# Task: Implementasi Fitur Swagger UI untuk Dokumentasi API

Dokumen ini berisi panduan langkah demi langkah untuk mengimplementasikan fitur **Swagger UI** di proyek VibeCoding. Fitur ini bertujuan untuk menyediakan halaman dokumentasi API yang interaktif, sehingga *frontend developer* atau pengguna API lainnya dapat dengan mudah melihat spesifikasi dan melakukan uji coba endpoint langsung dari browser.

ElysiaJS memiliki dukungan resmi yang sangat baik untuk Swagger melalui plugin `@elysiajs/swagger`.

---

## 🛠️ Tahapan Implementasi

Silakan ikuti instruksi detail di bawah ini:

### Langkah 1: Instalasi Plugin Swagger
Elysia menyediakan plugin resmi untuk meng-generate OpenAPI/Swagger. Jalankan perintah berikut di terminal pada root folder proyek:
```bash
bun add @elysiajs/swagger
```

### Langkah 2: Registrasi Plugin di `src/index.ts`
Buka file utama aplikasi yaitu `src/index.ts`. Lakukan import dan pasang plugin tersebut ke instance aplikasi Elysia Anda. 

**Catatan Penting:** Pastikan memanggil `.use(swagger(...))` **sebelum** mendaftarkan routing (`.use(userRoutes)`) agar Swagger dapat membaca seluruh endpoint yang ada di bawahnya.

**Kode yang perlu ditambahkan/diubah:**
```typescript
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger"; // 1. Tambahkan import ini
import { userRoutes } from "./routes/users-routes";

export const app = new Elysia()
  // 2. Tambahkan konfigurasi swagger di sini
  .use(swagger({
    path: '/swagger', // Halaman dokumentasi bisa diakses di http://localhost:3000/swagger
    documentation: {
      info: {
        title: 'VibeCoding API Documentation',
        version: '1.0.0',
        description: 'Dokumentasi interaktif untuk Authentication Service VibeCoding.',
      }
    }
  }))
  .get("/", () => "Hello World")
  .use(userRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
  console.log(`📚 Swagger documentation available at http://localhost:3000/swagger`);
}
```

### Langkah 3: Menambahkan Detail Skema (Opsional / *Best Practice*)
Meskipun ElysiaJS secara otomatis membaca skema validasi (TypeBox) yang sudah ada di `src/routes/users-routes.ts` untuk membangun dokumentasi, Anda bisa menambahkan properti `detail` pada konfigurasi route jika ingin hasil Swagger-nya lebih rapi.

*Contoh jika ingin diterapkan pada salah satu endpoint di `users-routes.ts` (tidak wajib tapi bagus untuk dicoba):*
```typescript
  .post("/login", async ({ body, set }) => {
    // ... logika login
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    }),
    detail: {
      tags: ['Authentication'],
      summary: 'Login User',
      description: 'Endpoint untuk mengautentikasi user dan mendapatkan session token.'
    }
  })
```

### Langkah 4: Uji Coba Secara Lokal
1. Jalankan aplikasi menggunakan perintah:
   ```bash
   bun run dev
   ```
2. Buka browser Anda dan navigasikan ke: **`http://localhost:3000/swagger`**
3. Pastikan halaman antarmuka Swagger UI terbuka.
4. Coba tes salah satu endpoint (misalnya `POST /api/users/login`) langsung melalui halaman Swagger tersebut.

### Langkah 5: Git Commit & Pull Request
Setelah memastikan semuanya berjalan lancar:
1. Buat branch baru, contoh: `git checkout -b feature/swagger-docs`.
2. Lakukan *commit* perubahan: `git commit -m "feat: add swagger ui for api documentation"`.
3. Lakukan *push* dan buatkan Pull Request (PR) ke branch `main`.
