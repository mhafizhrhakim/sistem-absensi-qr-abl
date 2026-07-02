# Absensi QR ABL

Rewrite project absensi QR menjadi aplikasi fullstack modern menggunakan Next.js, Supabase PostgreSQL, dan Vercel.

## Stack

- Next.js: frontend dan backend route/server action
- Supabase PostgreSQL: database backend cloud
- Vercel: hosting aplikasi
- QR Code: dibuat dari token sesi absensi
- Session: cookie server-side bertanda tangan HMAC

## Modul Layanan

- Auth Service: login, role dosen/mahasiswa, session
- Attendance Service: validasi jadwal, cek peserta kelas, catat absen
- QR Service: token sesi dan QR scan URL
- Reporting Service: daftar hadir dan export CSV
- Database Service: Supabase PostgreSQL

## Setup Supabase

1. Buat project di Supabase.
2. Buka SQL Editor.
3. Jalankan isi file database/schema.sql.
4. Buka Project Settings > API.
5. Ambil Project URL dan service_role key.

## Setup Local

Salin .env.example menjadi .env.local, lalu isi:

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=isi-dengan-secret-panjang-minimal-24-karakter

Install dan jalankan:

npm install
npm run dev

Akun demo setelah menjalankan database/schema.sql:

- Dosen: dosen1 / dosen123
- Mahasiswa: 2201001 / mhs123

## Deploy Vercel

1. Push project ini ke GitHub.
2. Import repository ke Vercel.
3. Tambahkan Environment Variables:
   - NEXT_PUBLIC_APP_URL: URL Vercel kamu, contoh https://absensi-qr.vercel.app
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - SESSION_SECRET
4. Deploy.

## Skenario Demo

1. Login sebagai dosen.
2. Buat sesi absensi dengan jadwal aktif.
3. Buka detail sesi dan tampilkan QR.
4. Login sebagai mahasiswa di perangkat lain.
5. Scan QR.
6. Absensi tersimpan ke Supabase.
7. Dosen melihat daftar hadir dan export CSV.

## Catatan Keamanan

- SUPABASE_SERVICE_ROLE_KEY hanya boleh dipakai di server.
- Jangan masukkan .env.local ke GitHub.
- Untuk versi produksi lanjutan, auth bisa ditingkatkan ke Supabase Auth.
