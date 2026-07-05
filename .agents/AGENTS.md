# Dapur Arabella - Workspace Context & AI Handover Rules

> **PENTING UNTUK AI SELANJUTNYA:** Jika Anda adalah *instance* AI baru yang baru saja di-*spawn* ke dalam workspace ini, bacalah dokumen ini secara seksama. Dokumen ini adalah "ingatan" (memory transfer) dari AI sebelumnya (yang menangani hingga 5 Juli 2026).

## Aturan Perilaku AI (Persona "Humanoid" & Perintah Mutlak)
Sesuai perintah mutlak dari pengguna pada 5 Juli 2026, setiap AI yang menangani proyek ini HARUS mengingat dan menerapkan hal berikut:
1. **Pendekatan Humanoid (Bukan Sekadar Mesin)**: Berpikirlah seperti manusia layaknya *Claude Opus*. Gunakan logika tingkat tinggi. Jangan memodifikasi kode secara semena-mena. Jika menemukan kejanggalan atau potensi masalah (misalnya UX yang buruk, pergeseran layout, dll), **proaktiflah untuk memperbaikinya** dengan memberikan saran logis sebelum atau sesudah eksekusi. Pikirkan selalu dampak berantai (side-effects) dari setiap perubahan kode.
2. **Implementasi Sebelum Eksekusi**: Selalu buat rencana implementasi sebelum melakukan modifikasi kode yang krusial.
3. **Checklist Task Terstruktur**: Selalu buat task langkah-demi-langkah (`task.md`) yang jelas sebelum mulai bekerja.
4. **Persetujuan Mutlak**: Selalu tunggu persetujuan (approval) dari pengguna sebelum mengedit/mengeksekusi kode.

## Konteks Proyek
Ini adalah platform *e-commerce* berbasis Next.js 14/15 App Router untuk toko F&B Dapur Arabella.
Terdapat sisi *frontend* (pelanggan) dan *backend* Dasbor Admin.

### Tech Stack Khusus
- Next.js App Router (16.2.9) - Catatan: Menggunakan `--experimental-build-mode compile` untuk melewati bug InvariantError.
- Prisma ORM dengan PostgreSQL
- Autentikasi kustom berbasis JWT (tidak menggunakan NextAuth). Kita memakai `jose` untuk verifikasi token (di `src/lib/auth.js` untuk Admin dan `src/lib/userAuth.js` untuk pengguna).
- Styling menggunakan *CSS Modules* (`.module.css`). **DILARANG menggunakan Tailwind** kecuali diminta spesifik. Desain sejauh ini menggunakan Vanilla CSS murni dengan variabel warna kustom.

## Struktur Database Penting (Prisma)
- `Admin`: Untuk pengguna *backend* Dasbor (Superadmin & Admin).
- `User`: Untuk pelanggan *frontend*.
- `Product` & `Category`: Manajemen katalog.
- `Order`: Sistem pesanan *checkout*.
- `Cart` & `CartItem`: Keranjang belanja per-`User`.

## Status Terakhir (Bugs & TODO)

1. **Next.js Build InvariantError** -> **(SOLVED)** 
   - *Bug* ini sudah berhasil disiasati menggunakan *compile mode* di `package.json` (`next build --experimental-build-mode compile`). **Jangan** mengubah mode build ini karena Next.js 16.x memiliki bug internal.

2. **Logic Bug 1: Pesanan Terdampar (Orphaned Orders)**:
   - `schema.prisma` pada model `Order` saat ini belum memiliki relasi `userId`. 
   - Akibatnya, `src/app/api/orders/route.js` tidak bisa menautkan pesanan yang dibuat oleh pengguna yang sedang *login* ke akun mereka. 
   - *Solusi*: Anda harus mengubah `schema.prisma` (tambah `userId String?`), lakukan `npx prisma db push` atau `migrate dev`, lalu perbarui fungsi POST di `api/orders/route.js`.

3. **Logic Bug 2: Cart Not Cleared After Checkout**:
   - Di `src/app/api/orders/route.js`, setelah *checkout* berhasil (membuat `Order`), tidak ada fungsi untuk menghapus (delete/clear) `CartItem` milik pengguna tersebut.
   - *Solusi*: Jika pesanan terikat ke pengguna, pastikan keranjang belanjanya dihapus/dikosongkan.

4. **Desain Admin Sidebar**:
   - Sidebar admin sudah diperbaiki dan stabil. Sidebar bersifat *collapsible* namun **tidak melebar saat di-hover** untuk mencegah lonjakan layout. Pelebaran hanya terjadi saat pengguna mengklik ikon panah.
