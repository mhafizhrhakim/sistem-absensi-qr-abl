# Dokumentasi API Absensi QR

API ini berjalan di dalam Next.js Application Service. Data tetap disimpan di Supabase PostgreSQL sebagai Database Service.

## Base URL Local

http://localhost:3000

## Endpoint Publik

### GET /api/health

Mengecek status service.

Contoh response:

{
  "status": "ok",
  "service": "Absensi QR API"
}

## Endpoint Butuh Login

Endpoint di bawah memakai session cookie dari login web. Jadi cara demo paling gampang: login dulu di browser, lalu buka endpoint API di tab baru.

### GET /api/me

Mengambil data user yang sedang login.

### GET /api/dosen/sessions

Role: dosen.

Mengambil daftar sesi absensi milik dosen yang sedang login.

### GET /api/dosen/sessions/:id

Role: dosen.

Mengambil detail sesi absensi dan daftar hadir.

### GET /api/mahasiswa/attendances

Role: mahasiswa.

Mengambil riwayat absensi mahasiswa yang sedang login.

### POST /api/attendance/scan

Role: mahasiswa.

Mencatat absensi berdasarkan token QR.

Body JSON:

{
  "token": "uuid-token-dari-qr"
}

## Catatan Presentasi ABL

- Next.js menyediakan Application/API Service.
- Supabase menyediakan Database Service berbasis PostgreSQL.
- API route memisahkan akses data dari tampilan UI.
- Role dosen dan mahasiswa membatasi akses endpoint.
- Validasi absensi dilakukan oleh Attendance Service: token QR, role mahasiswa, jadwal sesi, dan duplikasi absen.
