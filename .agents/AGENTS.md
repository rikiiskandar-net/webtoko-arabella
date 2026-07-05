# Dapur Arabella - Workspace Context & AI Handover Rules

> **PENTING UNTUK AI SELANJUTNYA:** Jika Anda adalah *instance* AI baru yang baru saja di-*spawn* ke dalam workspace ini, bacalah dokumen ini secara seksama. Dokumen ini adalah "ingatan" (memory transfer) dari AI sebelumnya (yang menangani hingga 5 Juli 2026).

## Konteks Proyek
Ini adalah platform *e-commerce* berbasis Next.js 14/15 App Router untuk toko F&B Dapur Arabella.
Terdapat sisi *frontend* (pelanggan) dan *backend* Dasbor Admin.

### Tech Stack Khusus
- Next.js App Router
- Prisma ORM dengan PostgreSQL
- Autentikasi kustom berbasis JWT (tidak menggunakan NextAuth). Kita memakai `jose` untuk verifikasi token (di `src/lib/auth.js` untuk Admin dan `src/lib/userAuth.js` untuk pengguna).
- Styling menggunakan *CSS Modules* (`.module.css`). **DILARANG menggunakan Tailwind** kecuali diminta spesifik, karena seluruh desain sejauh ini menggunakan Vanilla CSS murni dengan variabel warna kustom.

## Struktur Database Penting (Prisma)
- `Admin`: Untuk pengguna *backend* Dasbor (Superadmin & Admin).
- `User`: Untuk pelanggan *frontend*.
- `Product` & `Category`: Manajemen katalog.
- `Order`: Sistem pesanan *checkout*.
- `Cart` & `CartItem`: Keranjang belanja per-`User`.

## Status Terakhir (Bugs & TODO)
AI sebelumnya (saya) disuruh berhenti (istirahat) sebelum sempat membereskan beberapa masalah ini. Anda HARUS mengetahui status ini:

1. **Next.js Build InvariantError (CRITICAL)**: 
   - Proyek saat ini **gagal kompilasi** saat menjalankan `npm run build` dengan pesan `Error [InvariantError]: Invariant: Expected workStore to be initialized`. 
   - *Clue*: Ini biasanya terjadi karena penggunaan `headers()` atau `cookies()` di rute yang seharusnya statis (seperti `not-found.js` atau komponen layout yang salah). Tangani bug ini terlebih dahulu sebelum mencoba men-*deploy* ke Vercel!

2. **Logic Bug 1: Pesanan Terdampar (Orphaned Orders)**:
   - `schema.prisma` pada model `Order` saat ini belum memiliki relasi `userId`. 
   - Akibatnya, `src/app/api/orders/route.js` tidak bisa menautkan pesanan yang dibuat oleh pengguna yang sedang *login* ke akun mereka. 
   - *Solusi*: Anda harus mengubah `schema.prisma` (tambah `userId String?`), lakukan `npx prisma db push` atau `migrate dev`, lalu perbarui fungsi POST di `api/orders/route.js`.

3. **Logic Bug 2: Cart Not Cleared After Checkout**:
   - Di `src/app/api/orders/route.js`, setelah *checkout* berhasil (membuat `Order`), tidak ada fungsi untuk menghapus (delete/clear) `CartItem` milik pengguna tersebut.
   - *Solusi*: Jika pesanan terikat ke pengguna, pastikan keranjang belanjanya dihapus/dikosongkan.

4. **Desain Admin Sidebar**:
   - Sidebar admin baru saja dibuat menjadi *collapsible* (bisa dilipat) menggunakan state `isSidebarCollapsed` di `src/app/(admin)/layout.js` dan CSS di `AdminLayout.module.css`. Jangan merusaknya saat menambah rute baru.

Terima kasih. Lanjutkan pekerjaan yang belum selesai ini dengan hati-hati. 🚀
