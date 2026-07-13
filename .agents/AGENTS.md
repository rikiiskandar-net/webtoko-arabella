# Webtoko Arabella Rules & Constraints

## Next.js 16 Proxy vs Middleware
- This project uses Next.js 16.2. 
- **DO NOT** create or use a `middleware.js` file at the root or `src/` directory, as it will cause a build conflict (`Error: Both middleware file and proxy file are detected`).
- **DO USE** `src/proxy.js` instead.
- The `src/proxy.js` file MUST use a default export named `proxy`: `export default async function proxy(request) { ... }`. Using `export async function middleware` inside `proxy.js` will cause a build error (`Proxy is missing expected function export name`).

## Code Modification Rules
- When doing bulk search and replace using scripts, be extremely careful about `async function` declarations (e.g. do not accidentally create `async function await getSession`). 
- Verify builds using `npm run build` after making structural changes or global search/replaces.

## Aturan Pengembangan Eksekusi Kode
1. Jangan pernah langsung Edit/Hapus kode sebelum mendapat perintah persetujuan dari user.
2. Selalu buat dan berikan Implementation Plan sebelum melakukan perbaikan atau penambahan kode.
3. Gunakan artifact Task (task.md) sebagai daftar eksekusi kode setiap memulai eksekusi.
4. Selalu laporkan penggunaan Skill dan pelajari/baca skill yang relevan sebelum bekerja (misal: skill frontend untuk perbaikan frontend, skill backend untuk backend, dsb).
