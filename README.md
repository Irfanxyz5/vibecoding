# VibeCoding - Auth Service API

VibeCoding adalah aplikasi backend *Authentication Service* yang dibangun menggunakan arsitektur modern dan efisien. Proyek ini berfokus pada penyediaan sistem manajemen pengguna dasar yang aman, termasuk fitur registrasi, otentikasi (login), profil pengguna, dan manajemen sesi (logout).

## 🚀 Technology Stack & Libraries

Proyek ini menggunakan teknologi dan pustaka modern untuk memastikan performa tinggi dan pengalaman pengembangan yang baik:

*   **Runtime:** [Bun](https://bun.sh/) - Runtime JavaScript yang sangat cepat, sekaligus berfungsi sebagai *package manager* dan *test runner*.
*   **Web Framework:** [ElysiaJS](https://elysiajs.com/) - Framework web yang cepat dan ergonomis untuk Bun, mengutamakan keamanan tipe (Type Safety) dengan ekosistem TypeBox.
*   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript yang ringan dan *type-safe*.
*   **Database Engine:** MySQL 8.0 (dijalankan via Docker).
*   **Libraries Tambahan:**
    *   `bcrypt`: Untuk enkripsi dan hashing password pengguna.
    *   `mysql2`: Driver koneksi database MySQL.
    *   `@sinclair/typebox`: Digunakan oleh ElysiaJS untuk validasi skema input/output.

---

## 📂 Arsitektur & Struktur Direktori

Aplikasi ini mengadopsi pola arsitektur **Service-Controller** yang sederhana namun terstruktur, memisahkan logika bisnis dari lapisan *routing* HTTP.

**Konvensi Penamaan File:** Menggunakan format *kebab-case* dengan sufiks yang memperjelas peran file (contoh: `[nama-entitas]-[peran].ts` -> `users-routes.ts`, `users-services.ts`).

```text
├── src/
│   ├── db/
│   │   ├── index.ts          # Konfigurasi koneksi Drizzle ke MySQL
│   │   └── schema.ts         # Definisi skema tabel database (Users & UserTokens)
│   ├── routes/
│   │   └── users-routes.ts   # Definisi endpoint ElysiaJS, Middleware, dan validasi input
│   ├── services/
│   │   └── users-services.ts # Logika bisnis aplikasi (hashing, query DB)
│   ├── index.ts              # Entry point utama aplikasi & inisialisasi server
├── tests/
│   └── users.test.ts         # Skenario Unit Testing menggunakan bun:test
├── docker-compose.yml        # Konfigurasi MySQL container
├── drizzle.config.ts         # Konfigurasi migrasi Drizzle ORM
└── package.json
```

---

## 🗄️ Database Schema

Database menggunakan MySQL dengan dua tabel utama yang saling berelasi:

### 1. Tabel `users`
Menyimpan data otentikasi dan profil utama pengguna.
*   `id`: `bigint unsigned` (Primary Key, Auto Increment)
*   `name`: `varchar(255)` (Not Null)
*   `email`: `varchar(255)` (Not Null, Unique)
*   `password`: `varchar(255)` (Not Null, menyimpan versi *hashed* dari password)
*   `created_at`: `timestamp` (Default: CURRENT_TIMESTAMP)

### 2. Tabel `user_tokens`
Menyimpan token sesi aktif untuk otentikasi pengguna (Sistem Bearer Token berbasis DB).
*   `id`: `bigint unsigned` (Primary Key, Auto Increment)
*   `token`: `varchar(255)` (Not Null, Unique, menggunakan UUID v4)
*   `userId`: `bigint unsigned` (Foreign Key merujuk ke `users.id`, Cascade Delete)

---

## 📡 API Endpoints

Aplikasi mengekspos endpoint API di bawah prefix `/api/users`.

### 1. Registrasi User
*   **URL:** `POST /api/users`
*   **Body:** JSON `{ "name": "...", "email": "...", "password": "..." }`
*   **Validasi:** Panjang `name` maksimal 255 karakter, format email harus valid.
*   **Response Sukses:** `201 Created`
*   **Response Gagal:** `400 Bad Request` (Validasi Gagal) atau `409 Conflict` (Email sudah ada).

### 2. Login User
*   **URL:** `POST /api/users/login`
*   **Body:** JSON `{ "email": "...", "password": "..." }`
*   **Response Sukses:** `200 OK` (Mengembalikan objek user yang berisi `token` sesi).
*   **Response Gagal:** `401 Unauthorized` (Kredensial salah).

### 3. Get Current User Profile (Protected)
*   **URL:** `GET /api/users/current`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response Sukses:** `200 OK` (Mengembalikan data diri user).
*   **Response Gagal:** `401 Unauthorized` (Token tidak valid, hilang, atau kadaluarsa).

### 4. Logout User (Protected)
*   **URL:** `DELETE /api/users/logout`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response Sukses:** `200 OK` (Menghapus token dari database `user_tokens`).
*   **Response Gagal:** `401 Unauthorized`.

---

## 🛠️ Cara Setup Project

Ikuti langkah-langkah berikut untuk menyiapkan proyek di lingkungan lokal Anda:

1.  **Clone Repository:**
    ```bash
    git clone <repository_url>
    cd vibecoding
    ```

2.  **Instalasi Dependencies:**
    Pastikan Anda sudah menginstal Bun.
    ```bash
    bun install
    ```

3.  **Setup Environment Variables:**
    Salin file `.env.example` ke `.env` (atau buat file `.env` baru) dan sesuaikan konfigurasi database.
    ```env
    DATABASE_URL="mysql://root:password@localhost:3307/vibecoding"
    ```

4.  **Jalankan Database via Docker:**
    Proyek ini sudah dilengkapi dengan `docker-compose.yml` untuk memutar MySQL.
    ```bash
    docker-compose up -d
    ```
    *(Catatan: Port MySQL di-mapping ke `3307` pada host untuk menghindari konflik port lokal).*

5.  **Jalankan Migrasi Drizzle (Opsional/Jika Diperlukan):**
    ```bash
    bunx drizzle-kit push
    ```

---

## 🏃‍♂️ Cara Menjalankan Aplikasi

Untuk menjalankan aplikasi dalam mode pengembangan (*development mode*) dengan fitur *hot-reload*:

```bash
bun run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🧪 Cara Melakukan Testing

Proyek ini dilengkapi dengan *Automated Unit Tests* menggunakan framework bawaan `bun:test`. Seluruh skenario API (Registrasi, Login, Profile, Logout) akan diuji, termasuk simulasi penolakan *Bad Request* dan *Unauthorized*.

**Catatan Penting:** Pengujian akan menghapus data di tabel `user_tokens` dan `users` sebelum setiap skenario dijalankan agar hasil tes tetap konsisten. Jangan jalankan tes ini di database produksi.

Untuk menjalankan seluruh *test suite*:
```bash
bun test
```

Untuk melihat detail file mana yang sedang diuji, Anda juga bisa menambahkan flag verbose:
```bash
bun test --verbose
```
