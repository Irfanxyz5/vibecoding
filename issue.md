# Bug Report: Internal Server Error saat Registrasi dengan Nama > 255 Karakter

Dokumen ini berisi laporan bug dan panduan perbaikan terkait error yang terjadi saat user mencoba melakukan registrasi dengan input nama yang sangat panjang.

## 1. Deskripsi Bug

Saat ini, jika seorang pengguna mencoba mendaftar dengan kolom `name` yang memiliki panjang lebih dari 255 karakter, aplikasi akan mengalami *crash* dan mengembalikan respons **HTTP 500 (Internal Server Error)**. 

**Penyebab:**
Di level database (Drizzle ORM & MySQL), kolom `name` pada tabel `users` telah didefinisikan dengan batas maksimal `varchar(255)`. Namun, pada level *routing* di ElysiaJS, kita belum membatasi panjang karakter tersebut. Akibatnya, aplikasi mencoba memasukkan data yang terlalu panjang ke database, sehingga ditolak oleh MySQL dan berujung pada error sistem yang bocor ke respons API.

**Ekspektasi:**
Sistem seharusnya menolak *request* tersebut sebelum mencapai database dan mengembalikan respons **HTTP 400 (Bad Request)** dengan pesan bahwa validasi input gagal (nama terlalu panjang).

## 2. Struktur File yang Terdampak

Perbaikan hanya perlu dilakukan pada satu file:
- **`src/routes/users-routes.ts`**

## 3. Tahapan Perbaikan (Step-by-Step)

Sebagai junior programmer atau AI model, silakan ikuti instruksi berikut untuk memperbaiki bug ini:

### Langkah 1: Tambahkan Validasi Batas Maksimal (maxLength)
1. Buka file `src/routes/users-routes.ts`.
2. Cari endpoint registrasi user, yaitu pada blok kode `.post("/", async ({ body, set }) => { ... })`.
3. Gulir ke bagian bawah dari blok fungsi endpoint tersebut, temukan definisi validasi skema input (variabel `body` dari parameter kedua).
4. Ubah tipe validasi pada field `name` yang tadinya hanya `t.String()` menjadi memiliki batas maksimal 255 karakter.

**Kode Sebelum:**
```typescript
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
```

**Kode Sesudah:**
```typescript
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
```

*ElysiaJS secara otomatis akan menangani pengecekan ini dan langsung mengembalikan status HTTP 400 Bad Request jika input nama melebihi batas tersebut, tanpa harus menjalankan logika di service.*

### Langkah 2: Uji Coba Perbaikan
1. Jalankan aplikasi menggunakan perintah `bun run dev`.
2. Lakukan request **POST** ke `/api/users`.
3. Kirimkan JSON body dengan `name` yang berisi karakter asal-asalan lebih dari 255 karakter (misal: "A" sebanyak 300 kali).
4. Pastikan sistem tidak lagi mengembalikan `500 Internal Server Error`, melainkan mengembalikan error validasi dari ElysiaJS (biasanya berstatus `400 Bad Request` atau `422 Unprocessable Entity`).
5. Coba juga lakukan registrasi dengan nama yang valid (kurang dari 255 karakter) untuk memastikan fungsi registrasi normal tidak rusak.

### Langkah 3: Git Commit & Pull Request
Sesuai aturan alur kerja kita:
1. Jangan lupa untuk melakukan commit dengan pesan yang jelas, contoh: `fix: add maxLength validation to user registration name`.
2. Buat Pull Request (PR) ke branch `main`.
