# Cobainyuk: Sistem Review Kantin (Frontend + Backend)

Aplikasi review warung kantin. Frontend React membaca dan mengelola data warung lewat REST API Express.js yang terhubung ke SQL Server. Proyek ini adalah Tugas 4 (Frontend React & Integrasi Backend), kelanjutan dari Tugas 2 (REST API & Database) dan Tugas 3 (Auth).

## Teknologi

**Frontend**
- React + TypeScript
- Vite (dev server dan build)
- React Router DOM
- Axios (metode integrasi HTTP yang dipilih)
- React Context API (`AuthContext`) untuk status login dan role
- CSS biasa

**Backend**
- Node.js + Express.js (TypeScript, dijalankan dengan `tsx`)
- SQL Server
- JWT untuk autentikasi, bcrypt untuk hash password

## Fitur

- Daftar warung (pencarian, filter kategori, pagination) dan detail warung
- Registrasi, login, dan informasi pengguna (`GET /auth/me`)
- CRUD warung sesuai role
- Ruang Kelola untuk owner dan admin
- Halaman khusus admin: Pengguna, Laporan ulasan, Riwayat aktivitas
- Loading state (skeleton), empty state, dan error state dengan tombol "Coba lagi"
- Penanganan respons 401 dan 403

## Hak akses per role

| Role | Hak akses |
|---|---|
| Public | Melihat daftar dan detail warung, registrasi, login |
| Customer | Melihat daftar dan detail warung, tanpa akses pengelolaan |
| Owner | Membuat warung dan mengubah warung miliknya sendiri |
| Admin | Seluruh pengelolaan warung (tambah, ubah, hapus), serta halaman Pengguna, Laporan, dan Riwayat |

Aturan akhir tetap ditentukan backend. Frontend hanya menyesuaikan tampilan.

## Struktur folder

```
Tugas_Prak2/
├── src/                 # backend (controllers, services, repositories, ...)
├── frontend/            # frontend React + Vite
│   └── src/
│       ├── api/         # instance Axios dan penerjemah error
│       ├── components/
│       ├── context/     # AuthContext
│       ├── hooks/
│       └── pages/       # halaman publik dan pages/kelola (Ruang Kelola)
├── .env.example         # contoh konfigurasi backend
├── package.json         # backend
└── README.md
```

## Prasyarat

- Node.js v24 (dikembangkan dengan v24.21.0)
- SQL Server (lokal, port 1433)
- Git

## Instalasi dan konfigurasi

### 1. Clone repository

```bash
git clone https://github.com/greciaaulia/TugasPraktikumRSI-review-kantin-api.git
cd TugasPraktikumRSI-review-kantin-api
```

### 2. Backend

```bash
npm install
```

Salin `.env.example` menjadi `.env` di root backend, lalu isi nilainya sendiri:

```
DB_SERVER=localhost
DB_PORT=1433
DB_USER=praktikum_user
DB_PASSWORD=isi_password_database_anda
DB_NAME=review_kantin

# Untuk SQL Server lokal biasanya: encrypt=false, trustServerCertificate=true
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=ganti-dengan-string-acak
JWT_EXPIRES_IN=2h
BCRYPT_SALT_ROUNDS=10
```

File `.env` tidak ikut repository. Jangan pernah meng-commit password database atau JWT secret.

### 3. Database

1. Buat database kosong bernama `review_kantin` di SQL Server.
2. Buat login/user `praktikum_user` dengan hak akses ke database tersebut, lalu samakan passwordnya dengan `DB_PASSWORD` di `.env`.
3. Struktur tabel mengikuti rancangan database Tugas 2: `USERS`, `STALLS`, `MENU_ITEMS`, `REVIEWS`, `FLAGS`, dan `AUDIT_LOGS`. Skrip database (`.sql`) tidak disertakan dalam repository ini, sehingga tabel dan data awal perlu dibuat sesuai rancangan Tugas 2 atau dengan menghubungi pembuat repository.

### 4. Frontend

```bash
cd frontend
npm install
```

Salin `frontend/.env.example` menjadi `frontend/.env`:

```
VITE_API_URL=http://localhost:3000/api/v1
```

## Menjalankan aplikasi

Jalankan backend dan frontend di dua terminal terpisah.

**Backend** (dari root repository):

```bash
npm run dev
```

Berjalan di `http://localhost:3000`.

**Frontend** (dari folder `frontend`):

```bash
npm run dev
```

Berjalan di `http://localhost:5173`.

## Akun untuk pengujian

Login memakai email dan password.

| Role | Email | Password |
|---|---|---|
| Admin | admin@kantin.test | admin123 |
| Owner | tini@kantin.test | rahasia123 |
| Customer | elena@kantin.test | elena123 |

Akun di atas hanya akun dummy untuk pengujian.

## Endpoint backend yang dipakai frontend

Semua endpoint diawali `http://localhost:3000/api/v1`.

| Fitur | Endpoint |
|---|---|
| Daftar warung | `GET /stalls` |
| Detail warung | `GET /stalls/:id` |
| Menu warung | `GET /stalls/:id/menus` |
| Tambah warung | `POST /stalls` |
| Ubah warung | `PUT /stalls/:id` |
| Hapus warung | `DELETE /stalls/:id` |
| Registrasi | `POST /auth/register` |
| Login | `POST /auth/login` |
| Info pengguna | `GET /auth/me` |
| Daftar pengguna (admin) | `GET /users` |
| Laporan ulasan (admin) | `GET /flags`, `PUT /flags/:id` |
| Riwayat aktivitas (admin) | `GET /audit` |

## Catatan

- Backend mencatat aktivitas daftar, tambah, ubah, dan hapus warung ke tabel `AUDIT_LOGS`. Pencatatan dibungkus `try/catch` sehingga kegagalan log tidak mengganggu operasi utama.
- Loading state memakai jeda minimal 0,4 detik (`minDelay` di `frontend/src/utils.ts`) supaya tidak berkedip di localhost.