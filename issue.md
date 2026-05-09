# Task: Implementasi Fitur Get Current User (Get Profile)

Dokumen ini berisi perencanaan dan spesifikasi untuk mengimplementasikan fitur pengambilan data user yang saat ini sedang login berdasarkan token. Ikuti instruksi di bawah ini dengan saksama.

## 1. Spesifikasi API

Buat endpoint API untuk mengambil data profil user.

- **Method:** `GET`
- **Endpoint:** `/api/users/current`

### Header Request
Diperlukan header `Authorization` untuk memvalidasi user yang mengakses.
- `Authorization`: `Bearer <token>`
*(Catatan: Token ini adalah UUID yang digenerate saat login dan disimpan di dalam database. Berdasarkan implementasi sebelumnya, token ini disimpan di tabel `user_tokens` yang berelasi dengan tabel `users`.)*

### Response Body (Success - 200 OK)
```json
{
    "message": "User get successfully",
    "user": {
        "id": 1,
        "name": "ipanzx",
        "email": "ipanzx@gmail.com",
        "created_at": "timestamp"
    }
}
```

### Response Body (Failed - 401 Unauthorized)
Jika token tidak valid, kadaluarsa, atau header tidak disertakan:
```json
{
    "message": "Token is invalid",
    "error": "Unauthorized"
}
```

## 2. Struktur Folder dan File

Tambahkan fitur ini ke dalam file yang sudah ada:

- **Folder `routes/`**: Tambahkan routing di `users-routes.ts`
- **Folder `services/`**: Tambahkan logika bisnis di `users-services.ts`

## 3. Tahapan Implementasi (Step-by-Step)

Sebagai junior programmer atau AI model, ikuti urutan pengerjaan berikut:

### Langkah 1: Buat Logika Bisnis (Service)
1. Buka file `src/services/users-services.ts`.
2. Buat fungsi baru bernama `getCurrentUser(token)`. Fungsi ini menerima parameter string `token`.
3. Di dalam fungsi tersebut:
   - Jika token kosong atau undefined, langsung lempar error "Token is invalid".
   - Lakukan query ke database menggunakan Drizzle ORM. Kamu perlu mencari data token di tabel `user_tokens` yang nilainya cocok.
   - Karena kamu membutuhkan data user (`id`, `name`, `email`, `created_at`), lakukan query **join** antara tabel `user_tokens` dan tabel `users` berdasarkan `user_id`. (Bisa juga query `user_tokens` dulu, baru query ke `users` jika ketemu).
   - Jika data tidak ditemukan, lemparkan error `Token is invalid`.
   - Jika ditemukan, kembalikan object user yang berisi `id`, `name`, `email`, dan `created_at`. Pastikan untuk **TIDAK** mengembalikan field sensitif seperti password.

### Langkah 2: Tambahkan Routing (Controller)
1. Buka file `src/routes/users-routes.ts`.
2. Tambahkan rute `GET /current` di dalam instance Elysia `userRoutes`.
3. Ambil nilai header `Authorization` dari request object. Di Elysia, kamu bisa mengambilnya via `headers.authorization`.
4. Ekstrak nilai token dari header. Header `Authorization` biasanya memiliki format `Bearer <token>`. Lakukan pemisahan (split) string untuk mendapatkan nilai `<token>`-nya saja.
   - Jika format header tidak sesuai atau token tidak ada, kembalikan HTTP Status 401 Unauthorized dengan JSON error.
5. Panggil fungsi `getCurrentUser(token)` yang telah dibuat di service.
6. **Tangani Sukses:** Kembalikan JSON dengan message "User get successfully" dan data user.
7. **Tangani Error (catch):** Jika error message adalah "Token is invalid" atau error lainnya terkait autentikasi, set response HTTP status menjadi `401` dan kembalikan JSON gagal sesuai spesifikasi.

### Langkah 3: Uji Coba
1. Pastikan server lokal menyala (`bun run dev`).
2. Lakukan request **POST** ke `/api/users/login` terlebih dahulu untuk mendapatkan valid `<token>`.
3. Lakukan request **GET** ke `/api/users/current` **tanpa** header `Authorization`. Pastikan aplikasi merespons `401 Unauthorized`.
4. Lakukan request **GET** ke `/api/users/current` **dengan** header `Authorization: Bearer <token asal-asalan>`. Pastikan merespons `401 Unauthorized`.
5. Lakukan request **GET** ke `/api/users/current` **dengan** header `Authorization: Bearer <token valid>`. Pastikan aplikasi merespons `200 OK` beserta data profil user.
