---
name: webtoko-production
description: Production readiness, deployment, security hardening, monitoring, and performance optimization for WebToko Dapur Arabella. Apply automatically when deploying, configuring infra, or reviewing code for production.
---

# WebToko Production Readiness — DevOps Guide

Tech stack: Next.js 16 (standalone output), Prisma 7 + PostgreSQL (Supabase), Supabase Storage, Linux VM / VPS deployment.

## Security Checklist

### Environment & Secrets
- [ ] `.env` is gitignored (already done). Use `.env.example` for docs.
- [ ] `AUTH_SECRET` must be a strong random string in production — rotate before live
- [ ] `DATABASE_URL` and `DIRECT_URL` use Supabase pooler with SSL (`sslmode=require`)
- [ ] `ADMIN_PASSWORD` env var only for seed; remove/deactivate after first admin is created via DB
- [ ] Never log `error.stack` in API responses (use `NODE_ENV=production` or explicit check)

### API Security
- [ ] All mutating endpoints require `verifyToken()` session check
- [ ] Rate limiting on public API routes (`/api/store/*`, `/api/auth/login`) — use a simple in-memory rate limiter or headers
- [ ] CORS: restrict to known origins in production (or rely on same-origin via Next.js)
- [ ] File upload: already validated (images only, max 2MB, sanitized filename)
- [ ] SQL injection: prevented by Prisma parameterized queries
- [ ] XSS: React auto-escapes, but sanitize any `dangerouslySetInnerHTML`
- [ ] CSRF: httpOnly cookie + same-site mitigations

### Auth Hardening
- [ ] Cookie: `httpOnly`, `secure: true`, `sameSite: "lax"`, `maxAge: 86400` (24h)
- [ ] HMAC token: use `AUTH_SECRET` from env with a strong algorithm
- [ ] Login: rate limit attempts (e.g., 5 attempts per 15 min per IP)
- [ ] Session: verify admin is still `isActive` on each request (not just token validity)

## Error Handling & Logging

### API Route Pattern
```js
export async function GET(request) {
  try {
    // ... logic
  } catch (error) {
    console.error(`[API] ${request.nextUrl.pathname}:`, error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Logging Guidelines
- Use `console.error` for errors, `console.log` for info (server-side only)
- Include timestamp and route path in log messages
- NEVER log secrets, tokens, or passwords
- In production, pipe stdout/stderr to a log management service

### Error Boundaries
- API routes: always wrap in try/catch, never expose stack traces
- Client components: use React error boundaries or global error handling
- Next.js `error.js` and `not-found.js` for user-friendly error pages
- `layout.js` should have `error.js` and `loading.js` companions

## Performance Optimization

### Next.js Config (`next.config.mjs`)
```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ✅ already set — for Docker/VPS deployment
  compress: true,       // enable gzip/brotli compression
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
    {
      source: '/images/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
};
```

### Database
- Prisma connection pool: already uses `@prisma/adapter-pg` with Pool
- Set `connection_limit` in pool config (e.g., 5-10 for Supabase free tier)
- Use `DIRECT_URL` for migrations, `DATABASE_URL` (pooler) for runtime queries
- N+1 queries: use Prisma `include` or `select` to eager-load relations
- Indexes: add on `Product.categoryId`, `Order.status`, `HeroBanner.isActive`

### Static Assets
- Cache static assets (images, fonts) with `Cache-Control: public, immutable`
- Use Supabase Storage for uploads, not local filesystem (already done)
- Optimize images before upload (compress, resize)

## Monitoring & Observability

### Health Check Endpoint
Create `src/app/api/health/route.js`:
```js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[HealthCheck] DB connection failed:", error.message);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
```

### Uptime Monitoring
- Use free services like BetterUptime, UptimeRobot, or HetrixTools
- Hit `/api/health` every 1-5 minutes
- Alert via Email, Telegram, or WhatsApp

### Error Tracking
- Consider Sentry (free tier) or GlitchTip (self-hosted) for error aggregation
- Integrate with Next.js via `@sentry/nextjs`

## Deployment

### Build & Run
```bash
npm run build         # Next.js standalone build
node .next/standalone/server.js  # run in production
```

### Process Manager (Production)
Use `pm2` or systemd to keep the server running:
```bash
npm install -g pm2
pm2 start .next/standalone/server.js --name webtoko
pm2 save
pm2 startup
```

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name dapurarabella.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name dapurarabella.com;

    ssl_certificate /etc/letsencrypt/live/dapurarabella.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dapurarabella.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

### Docker Deployment (Optional)
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### SSL / HTTPS
- Use Let's Encrypt via Certbot for free SSL
- Auto-renew via systemd timer or cron
- Redirect HTTP → HTTPS in Nginx config

## Database Operations

### Migrations
```bash
npx prisma migrate dev   # development (creates migration)
npx prisma migrate deploy # production (apply pending migrations)
```

### Backup
- Supabase provides automatic daily backups (Pro tier)
- For self-hosted: `pg_dump` or `pg_backrest` with off-site storage
- Before any migration: take a manual snapshot

### Connection Pool
- Supabase pooler already in use via `DATABASE_URL`
- Pool config: `{ max: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 }`
- Use `DIRECT_URL` for long-running operations (seeds, migrations)

## Pre-Launch Checklist

- [ ] `AUTH_SECRET` rotated to a strong production value
- [ ] Supabase project in production mode (not paused/development)
- [ ] Domain configured with SSL
- [ ] `/api/health` endpoint deployed and monitored
- [ ] Nginx reverse proxy configured
- [ ] PM2/systemd process management set up
- [ ] Database migration applied (`prisma migrate deploy`)
- [ ] Seed data loaded if needed
- [ ] `.env` rotation: DB passwords, API keys
- [ ] Static assets cached properly
- [ ] CORS headers configured for production
- [ ] Rate limiting enabled on login & public API
- [ ] Error pages (404, 500) customized
- [ ] `robots.txt` and `sitemap.xml` generated
- [ ] Google Analytics / Search Console set up (optional)
- [ ] Monitoring alert configured (uptime + health check)

## Rollback Plan

If deploy fails:
1. Revert to previous commit: `git revert HEAD && git push`
2. Re-deploy: `npm run build && pm2 restart webtoko`
3. If DB migration fails: restore from backup, fix migration, re-run
4. Keep last known-good build in a `releases/` directory
