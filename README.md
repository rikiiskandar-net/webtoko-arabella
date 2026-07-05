# Dapur Arabella - E-Commerce Platform

Sistem toko online (e-commerce) khusus makanan rumahan (F&B) untuk Dapur Arabella.
Dibuat dengan Next.js App Router, Prisma, dan PostgreSQL.

## 🚀 Fitur Utama
- **Katalog Produk & Kategori:** Pengunjung bisa melihat menu, detail produk, promo, dan label (badge).
- **Keranjang & Checkout:** Autentikasi pelanggan terpisah dengan Admin. Pelanggan bisa menambah produk ke keranjang dan checkout.
- **Kokpit Admin (Dasbor):** Antarmuka khusus superadmin & admin untuk mengatur konfigurasi toko, produk, pengguna, media, banner, dan pesanan.
- **Sidebar Minimalis:** Dasbor dilengkapi sidebar yang bisa di-*collapse* untuk memaksimalkan ruang layar.

## 🛠️ Tech Stack
- Framework: Next.js (App Router)
- Database ORM: Prisma
- Database: PostgreSQL
- Styling: CSS Modules (Vanilla) + Lucide React Icons
- Authentication: Custom JWT (jose) untuk *Server-Side* dan *Client-Side*.

## 📂 Struktur Penting
- `src/app/(admin)`: Rute khusus Dasbor Admin (dilindungi `AuthGuard`).
- `src/app/api`: Semua endpoint *backend*.
  - `/api/admin/*`: Endpoint khusus admin.
  - `/api/cart/*`, `/api/orders/*`, `/api/auth/*`: Endpoint *frontend*.
- `src/lib`: *Library* utilitas seperti `prisma.js`, `auth.js` (Admin Auth), `userAuth.js` (Customer Auth), dan Konteks Sesi.

## ⚠️ Status Saat Ini & Bug yang Belum Diselesaikan
Perhatikan dokumen `.agents/AGENTS.md` untuk informasi serah-terima teknis yang lebih detail kepada AI (Artificial Intelligence) selanjutnya.
1. **Next.js Build InvariantError**: Sistem saat ini gagal di-*build* (`npm run build`) dengan pesan `Expected workStore to be initialized`. Kemungkinan karena penggunaan `headers()` atau `cookies()` di dalam layout atau komponen yang di-*render* statis seperti `_not-found` atau `_global-error`.
2. **Bug Pesanan Terdampar (Orphaned Orders)**: Saat pelanggan login dan checkout, pesanan tidak tertaut ke akun mereka karena `schema.prisma` model `Order` belum memiliki kolom `userId`.
3. **Bug Keranjang (Cart Clear)**: Setelah *checkout* sukses, isi keranjang belum dihapus dari database.
