# Task: Implementasi Fitur Logout User

Dokumen ini berisi perencanaan dan spesifikasi untuk mengimplementasikan fitur logout user. Pada proses logout ini, token sesi yang dikirimkan oleh klien harus dihapus dari database agar tidak bisa digunakan lagi. Ikuti instruksi di bawah ini dengan saksama.

## 1. Spesifikasi API

Buat endpoint API untuk memproses logout user.

- **Method:** `DELETE`
- **Endpoint:** `/api/users/logout`

### Header Request
Diperlukan header `Authorization` untuk memvalidasi user yang melakukan logout.
- `Authorization`: `Bearer <token>`
*(Catatan: Sesuai struktur tabel sebelumnya, data token sesi ini disimpan di tabel `user_tokens` (atau `sessions`).*

### Response Body (Success - 200 OK)
Jika proses logout berhasil dan token terhapus dari tabel:
```json
{
    "message": "User logout successfully"
}
```

### Response Body (Failed - 401 Unauthorized)
Jika token tidak valid, format header salah, atau token sudah kedaluwarsa/tidak ditemukan di tabel:
```json
{
    "message": "Token is invalid or expired",
    "error": "Unauthorized"
}
```

## 2. Struktur Folder dan File

Tambahkan fitur ini ke dalam file yang sudah ada:

- **Folder `routes/`**: Tambahkan routing di file `users-routes.ts`
- **Folder `services/`**: Tambahkan logika bisnis di file `users-services.ts`

## 3. Tahapan Implementasi (Step-by-Step)

Sebagai junior programmer atau AI model, ikuti urutan pengerjaan berikut:

### Langkah 1: Buat Logika Bisnis (Service)
1. Buka file `src/services/users-services.ts`.
2. Buat fungsi baru bernama `logoutUser(token)`. Fungsi ini menerima parameter string `token`.
3. Di dalam fungsi tersebut:
   - Validasi parameter `token`, jika kosong atau undefined, lempar error "Token is invalid or expired".
   - Lakukan pengecekan ke database (tabel `user_tokens`) menggunakan Drizzle ORM untuk memastikan token tersebut benar-benar ada.
   - Jika token tidak ditemukan, lempar error "Token is invalid or expired".
   - Jika token ditemukan, jalankan perintah `delete` menggunakan Drizzle ORM pada tabel `user_tokens` dengan kondisi `where token = <token_dari_parameter>`. Hal ini akan menghapus sesi user.

### Langkah 2: Tambahkan Routing (Controller)
1. Buka file `src/routes/users-routes.ts`.
2. Tambahkan rute `DELETE /logout` di dalam instance Elysia `userRoutes`.
3. Ambil nilai header `Authorization` dari request object (`headers.authorization`).
4. Lakukan pengecekan format token:
   - Pastikan header ada dan diawali dengan kata "Bearer ".
   - Jika tidak valid, set status 401 dan kembalikan JSON error.
5. Ekstrak nilai tokennya (split string).
6. Panggil fungsi `logoutUser(token)` yang berada di service.
7. **Tangani Sukses:** Kembalikan JSON dengan pesan sukses "User logout successfully".
8. **Tangani Error (catch):** Jika menangkap pesan error "Token is invalid or expired", set HTTP status menjadi `401` dan kirimkan response error JSON sesuai spesifikasi. Untuk error sistem lainnya, kembalikan `500` Internal Server Error.

### Langkah 3: Uji Coba
1. Jalankan aplikasi menggunakan perintah `bun run dev`.
2. Pertama, lakukan request **POST** ke `/api/users/login` dengan kredensial yang valid untuk mendapatkan token baru.
3. Coba lakukan request **DELETE** ke `/api/users/logout` **tanpa** token di header. Pastikan sistem menolak dengan 401 Unauthorized.
4. Lakukan request **DELETE** ke `/api/users/logout` dengan token valid yang kamu dapat dari login tadi. Pastikan sistem merespons sukses.
5. Untuk memastikan token benar-benar terhapus, lakukan kembali request **DELETE** dengan token yang sama. Sistem seharusnya sekarang menolak dengan pesan error 401 (karena token sudah tidak ada di database).
6. Uji juga di endpoint `GET /api/users/current` dengan token yang sudah di-logout, sistem harus menolak aksesnya.
