---
name: webtoko-backend
description: Use when working on WebToko Dapur Arabella backend — Prisma schema, API routes, admin CRUD pages, and connecting public components to the database. Covers the Next.js 16 + Prisma 7 + Supabase stack.
---

# WebToko Backend — Dapur Arabella

Online food store. Tech: Next.js 16 (App Router), React 19, Prisma 7 + PostgreSQL (Supabase), CSS Modules.

## Prisma Schema (`prisma/schema.prisma`)

Models: `Category`, `Admin`, `StoreConfig`, `HeroBanner`, `Product`

```prisma
model Category {
  id          String    @id @default(uuid())
  name        String
  icon        String    // Lucide icon name
  description String    @default("")
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Admin {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // bcrypt hashed
  name      String
  role      String   @default("admin") // "superadmin" | "admin"
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model StoreConfig {
  id          String   @id @default(uuid())
  storeName   String   @default("Dapur Arabella")
  waNumber    String   @default("")
  description String   @default("")
  address     String   @default("")
  hours       String   @default("Tutup pukul 21.00")
  deliveryETA String   @default("Antar mulai 15 menit")
  updatedAt   DateTime @updatedAt
}

model HeroBanner {
  id        String   @id @default(uuid())
  image     String
  badge     String   @default("")
  title     String
  subtitle  String   @default("")
  ctaText   String   @default("Eksplor Menu Sekarang")
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id            String   @id @default(uuid())
  name          String
  price         Int      // Rupiah, no decimals
  description   String
  image         String
  isPromo       Boolean  @default(false)
  promoPrice    Int?
  originalPrice Int?
  badge         String   @default("")   // "Promo" | "Bestseller" | "Baru" | ""
  rating        Float    @default(0)
  sold          String   @default("0")
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## API Route Convention

```
Public store:  /api/store/<resource>  →  GET only, returns data for frontend
Admin CRUD:    /api/admin/<resource>   →  GET/POST (list), requires auth cookie
               /api/admin/<resource>/[id]  →  PUT/DELETE, requires auth cookie
Auth:          /api/auth/login|logout|me
Other:         /api/config, /api/upload, /api/seed
```

### Pattern for Admin API Routes

```js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ... query + response
}
```

## Auth System

- HMAC-signed token in httpOnly cookie `auth_token`
- Login: DB lookup (Prisma Admin model, bcrypt verify), fallback to env var
- `seedFirstAdmin()` in `src/lib/auth.js` — creates first superadmin from env if Admin table empty
- Middleware (`src/middleware.js`) only checks cookie existence (Edge Runtime)
- `AuthGuard` client component (`src/components/AuthGuard.js`) — calls `/api/auth/me`, redirects to `/login?redirect=` on 401
- Session context (`src/lib/SessionContext.js`) — `useSession()` hook
- Role-based: `superadmin` sees "Admin" menu; `admin` only sees products/categories/settings

## Admin Dashboard Pages

Located in `src/app/(admin)/dashboard/`:

| Page | Route | File |
|------|-------|------|
| Ringkasan | `/dashboard` | `page.js` |
| Produk | `/dashboard/products` | `ProductsClient.js` |
| Kategori | `/dashboard/categories` | `CategoriesClient.js` |
| Pengaturan | `/dashboard/settings` | `SettingsClient.js` |
| Banner | `/dashboard/banners` | `BannersClient.js` |
| Admin | `/dashboard/admins` | `AdminsClient.js` |

Pattern: `page.js` (server component, exports metadata) → imports `*Client.js` ("use client", CRUD UI)

## Public Components (src/components/)

| Component | Data Source | Status |
|-----------|-------------|--------|
| Header | Static | ❌ hardcoded (search, cart count from props) |
| HeroBanner | DB via `/api/store/banners` | ✅ DONE |
| TrustBadges | Hardcoded array | ❌ NOT DONE |
| MenuHariIni | Props from page.js (hours, deliveryETA) | ✅ DONE |
| ProductCard | Props from page.js | ✅ DONE |
| ProductModal | Props from page.js | ✅ DONE |
| Cart | Props from page.js | ✅ DONE |
| Testimonial | Hardcoded array | ❌ NOT DONE |
| Footer | Hardcoded | ❌ NOT DONE |

## Common Patterns

### CSS Module
```css
.tableContainer { background: white; border-radius: 12px; box-shadow: ...; }
```
```js
import styles from "./Component.module.css";
```

### Admin Page CRUD (Client Component)
- State: `[items, setItems]`, `[isModalOpen, setIsModalOpen]`, `[editingItem, setEditingItem]`, `[formData, setFormData]`
- Fetch: `fetch("/api/admin/<resource>").then(r => r.json()).then(setItems)`
- Create: `POST /api/admin/<resource>` with JSON body
- Update: `PUT /api/admin/<resource>/[id]`
- Delete: `DELETE /api/admin/<resource>/[id]`

### Seed Script (`scripts/seed.mjs`)
Uses `PrismaClient` + `PrismaPg` adapter + `dotenv/config`. Add new seed sections with `if (count === 0) { ... }` pattern to avoid duplicates.

## Currently NOT Connected to DB (TODO)

- **Testimonial** — need model + admin CRUD + public API
- **TrustBadges** — need model + admin CRUD + public API (or make configurable in StoreConfig)
- **Footer** — contact info could come from StoreConfig or dedicated model
- **Order Management System** — new feature, not started
- **Stat Tracking** — hardcoded
- **Rate Limiting**
- **Manage Hero Banner & Testimonial from admin** — HeroBanner DONE, Testimonial still TODO

## Step-by-Step Guide to Add a New DB-Backed Section

1. Add model to `prisma/schema.prisma`
2. Run `npx prisma db push` to sync DB
3. Run `npx prisma generate` to update client
4. Create public API: `src/app/api/store/<resource>/route.js` (GET)
5. Create admin API: `src/app/api/admin/<resource>/route.js` (GET/POST)
6. Create admin API: `src/app/api/admin/<resource>/[id]/route.js` (PUT/DELETE)
7. Create admin page: `src/app/(admin)/dashboard/<resource>/page.js` + `*Client.js` + `*.module.css`
8. Add sidebar nav item in `src/app/(admin)/layout.js`
9. Update public component to fetch from `/api/store/<resource>`
10. Update `scripts/seed.mjs` with default data
11. Update `AGENTS.md` with new routes

## Seeding Data

```bash
npx prisma db push && npx prisma generate && node scripts/seed.mjs
```
