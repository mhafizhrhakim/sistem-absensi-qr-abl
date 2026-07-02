# Database

File utama:

- schema.sql: digunakan untuk setup database dari nol.

Folder migrations berisi catatan perubahan selama pengembangan:

- 001-register.sql: menambahkan fitur register dan mengganti nama dosen demo.
- 002-class-codes.sql: mengubah konsep kelas menjadi KH-001, KH-002, KH-003.
- 003-fix-kh001.sql: membersihkan kode kelas lama yang sempat dibuat sebelum perubahan final.

Untuk presentasi, cukup jelaskan schema.sql sebagai struktur database utama. Migrations adalah riwayat perubahan saat development.
