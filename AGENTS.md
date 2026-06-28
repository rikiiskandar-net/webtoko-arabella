<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# WebToko — Dapur Arabella

Online food store built with Next.js 16 (App Router), React 19, Prisma 7 + PostgreSQL (Supabase).

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Frontend | React 19.2.4, CSS Modules |
| Icons | lucide-react |
| Backend | Next.js API Routes (REST) |
| ORM | Prisma 7.8.0 with `@prisma/adapter-pg` |
| Database | PostgreSQL via Supabase (pooler) |
| Auth | Custom HMAC-signed cookie token |

## Route Structure

| Route | Type | Access |
|-------|------|--------|
| `/` | Public | Landing page — menu, hero, testimonial |
| `/login` | Public | Admin login form |
| `/dashboard` | Protected | Ringkasan bisnis (real data from Prisma) |
| `/dashboard/products` | Protected | CRUD produk |
| `/dashboard/categories` | Protected | CRUD kategori (with description field) |
| `/dashboard/settings` | Protected | Edit nama toko, WA, jam, alamat, estimasi |
| `/dashboard/banners` | Protected | CRUD hero banner (image, teks, urutan) |
| `/dashboard/admins` | Protected (superadmin) | CRUD admin users |
| `/api/config` | Public | Returns WA number from env |
| `/api/products` | Mixed | GET public, POST/PUT/DELETE protected |
| `/api/categories` | Mixed | GET public, POST/PUT/DELETE protected |
| `/api/upload` | Protected | Image upload (validated: images only, max 2MB) |
| `/api/store/products` | Public | Returns products formatted for frontend (with badge, badgeColor, category name) |
| `/api/store/categories` | Public | Returns categories including "Semua", icon names for frontend |
| `/api/store/banners` | Public | Returns active hero banners sorted by sortOrder |
| `/api/admin/banners` | Protected | GET/POST — CRUD hero banners |
| `/api/admin/banners/[id]` | Protected | PUT/DELETE — manage single banner |
| `/api/admin/settings` | Protected | GET/PUT store config (name, WA, hours, etc.) |
| `/api/admin/admins` | Protected (superadmin) | GET/POST — CRUD admin users |
| `/api/admin/admins/[id]` | Protected (superadmin) | PUT/DELETE — manage single admin |
| `/api/seed` | Public | Seed database with sample data |
| `/api/auth/login` | Public | POST — returns httpOnly signed cookie |
| `/api/auth/logout` | Protected | POST — clears cookie |
| `/api/auth/me` | Protected | GET — returns session info |

## Architecture Decisions

### ✅ Dual Data Source — Resolved
- **Frontend (public)** now fetches from `/api/store/products` and `/api/store/categories` (same DB as Admin)
- **Admin + API** uses Prisma/DB (id: UUID, categoryId: relation)
- Data is now **fully synced**. Admin changes immediately reflect on public site.
- Static fallback `src/data/products.js` remains as reference but frontend no longer imports it.

### Authentication
- HMAC-signed token stored in httpOnly cookie (`auth_token`)
- Middleware checks cookie existence on `/dashboard/*` routes (Edge Runtime, no crypto)
- Login validates via DB (Prisma Admin model, bcrypt), fallback ke env var
- **AuthGuard** client component di layout admin: call `/api/auth/me`, kalau 401 redirect ke `/login?redirect=...`
- **Login page** support `?redirect=` query param, balik ke halaman asal setelah login
- Topbar dinamis: nama & role dari session (tidak hardcoded)
- Sidebar role-based: menu "Admin" hanya untuk superadmin
- Token expires in 24 hours
- `AUTH_SECRET` env var used for signing (change in production!)

### Database (PostgreSQL via Supabase)
- Connection uses `@prisma/adapter-pg` with pg Pool
- SSL enabled (rejectUnauthorized: false for pooler compatibility)
- Schema: Category (uuid, name, icon, description) → Product (uuid, name, price, isPromo, promoPrice, originalPrice, badge, rating, sold, etc.)
- Price stored as **integer** (in Rupiah, no decimals)
- ✅ Frontend reads from DB via `/api/store/products` (not static data)

## CSS Conventions
- CSS Modules only (`.module.css`)
- Global styles in `src/app/globals.css` with CSS variables
- Responsive via media queries, mobile-first
- Dotted grid background pattern

## Component Architecture

### Public Components (`src/components/`)
```
Header, Footer, HeroBanner (DB), TrustBadges (hardcoded), MenuHariIni,
ProductCard, ProductModal, Cart, FloatingCart, Testimonial (hardcoded), Toast,
AuthGuard (session wrapper)
```
- All "use client" (interactive)
- Cart state managed in `page.js` via useState, passed down as props
- HeroBanner self-fetches from `/api/store/banners` (no props needed)
- AuthGuard wraps admin layout, provides session via `SessionContext`

### Admin Components (`src/app/(admin)/`)
```
AdminLayout (sidebar + topbar, "use client")
Dashboard (server component, async Prisma queries)
ProductsClient (CRUD table + modal, "use client")
CategoriesClient (CRUD table + modal, "use client")
SettingsClient (form edit config, "use client")
BannersClient (CRUD table + modal, "use client")
AdminsClient (CRUD table + modal, "use client")
```

## Common Pitfalls

1. **Auth cookie & middleware** — Middleware runs on Edge Runtime (no Node.js crypto). Cookie verification happens in API routes/login page, middleware only checks cookie existence.
2. **Prisma adapter required** — Prisma 7 requires adapter. Always use `@prisma/adapter-pg` + Pool pattern from `src/lib/prisma.js`. Don't create `new PrismaClient()` without adapter.
3. **import path alias** — `@/*` maps to `./src/*` (configured in `jsconfig.json`).
4. **Category id is UUID string** — Never use `parseInt()` on category IDs. They are `String @default(uuid())`.
5. **Prices are integers** — Store in Rupiah without decimals (e.g., 15000 = Rp15.000).
6. **~~The static data has number ids, DB uses UUID~~** — ✅ Resolved. Frontend now fetches from DB.
7. **AGENTS.md** — Always check this file before writing code; Next.js 16 has breaking changes.

## Security Rules

- Never expose `error.stack` in API responses (already removed from most endpoints)
- Upload validation: images only, max 2MB, filename sanitized
- WA number from env, served via `/api/config`
- Admin credentials from env, not hardcoded
- All mutating API endpoints require auth (handled in route handlers)
- .env contains DB credentials — don't commit to git

## ✅ Phase 2 Progress

### Completed
- ✅ `StoreConfig` model (storeName, waNumber, description, address, hours, deliveryETA)
- ✅ Halaman `/dashboard/settings` — form edit nama toko, WA, jam, alamat, estimasi
- ✅ API `/api/admin/settings` (GET/PUT, protected)
- ✅ API `/api/config` now reads from DB (fallback to env)
- ✅ `MenuHariIni` receives props from config (no more hardcode)
- ✅ `layout.js` metadata is dynamic from DB via `generateMetadata`
- ✅ Admin product form — added badge (select), rating, sold, originalPrice
- ✅ Admin product API — supports new fields (POST/PUT)
- ✅ **Multi-Admin system** — `Admin` model in Prisma, login via DB, `seedFirstAdmin()` from env
- ✅ **Manajemen Admin** — `/dashboard/admins` page (CRUD, toggle active, superadmin-only)
- ✅ **Role-based access** — `superadmin` can manage admins; `admin` manages products/categories
- ✅ **AuthGuard client wrapper** — call `/api/auth/me`, redirect ke login kalau 401
- ✅ **Login redirect** — support `?redirect=` param, balik ke halaman asal
- ✅ **Topbar dinamis** — nama & role dari session, tidak hardcoded
- ✅ **Sidebar role-based** — menu "Admin" hanya muncul untuk superadmin
- ✅ **HeroBanner dari DB** — model + API store + admin CRUD + auto-slide
- ✅ **Manajemen Banner di dashboard** — `/dashboard/banners` (CRUD, urut, aktif/nonaktif)
- ✅ **Footer dinamis** — nama toko, deskripsi, WA, Instagram, Email, paymentMethods dari DB/StoreConfig
- ✅ **Pengaturan Toko diperluas** — Instagram, Email, Metode Pembayaran bisa diisi dari Dashboard

### Still Missing / To Do

- [ ] **Testimonial** — masih hardcoded, perlu model + admin CRUD + public API
- [ ] **TrustBadges** — masih hardcoded, perlu model + admin CRUD + public API
- [ ] **Footer** — kontak, WA, link masih hardcoded, bisa dari StoreConfig
- [ ] Order management system (tabel order, status, riwayat)
- [ ] Stat tracking (totalViews still hardcoded)
- [ ] Rate limiting on API
- [ ] Better error handling in seed script
- [ ] Production .env rotation (DB password, AUTH_SECRET)
