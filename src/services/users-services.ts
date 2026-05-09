import { db } from "../db";
import { users, userTokens } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

/**
 * Mendaftarkan pengguna baru ke dalam sistem.
 * Fungsi ini akan mengecek apakah email sudah terdaftar, melakukan hashing pada password,
 * menyimpan data pengguna ke database, dan mengembalikan profil pengguna (tanpa password).
 *
 * @param {any} data - Objek yang berisi name, email, dan password.
 * @returns {Promise<Object>} Data profil pengguna yang baru dibuat.
 * @throws {Error} Jika email sudah terdaftar.
 */
export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  // 1. Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // 2. Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 3. Insert user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Get the inserted user (to return)
  const newUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!newUser) {
    throw new Error("Failed to register user");
  }

  // 5. Remove password from response
  const { password: _, ...userWithoutPassword } = newUser;
  
  return userWithoutPassword;
};

/**
 * Mengautentikasi pengguna dan membuat sesi login baru.
 * Fungsi ini memvalidasi email dan password, membuat token UUID unik untuk sesi,
 * menyimpannya ke tabel user_tokens, dan mengembalikan profil beserta token.
 *
 * @param {any} data - Objek yang berisi email dan password.
 * @returns {Promise<Object>} Profil pengguna beserta properti token.
 * @throws {Error} Jika email tidak ditemukan atau password salah.
 */
export const loginUser = async (data: any) => {
  const { email, password } = data;

  // 1. Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error("email atau password salah");
  }

  // 2. Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("email atau password salah");
  }

  // 3. Generate token
  const token = crypto.randomUUID();

  // 4. Save token
  await db.insert(userTokens).values({
    token,
    userId: user.id,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token,
  };
};

/**
 * Mengambil profil pengguna yang sedang login berdasarkan token sesi yang aktif.
 * Fungsi ini melakukan join antara tabel user_tokens dan users untuk mendapatkan data pengguna.
 *
 * @param {string} token - Bearer token milik pengguna.
 * @returns {Promise<Object>} Profil pengguna yang sedang login (tanpa password).
 * @throws {Error} Jika token tidak valid, kadaluarsa, atau tidak ditemukan.
 */
export const getCurrentUser = async (token: string) => {
  if (!token) {
    throw new Error("Token is invalid");
  }

  // Find token and join with user
  const tokenData = await db.query.userTokens.findFirst({
    where: eq(userTokens.token, token),
    with: {
      user: true,
    },
  });

  if (!tokenData || !tokenData.user) {
    throw new Error("Token is invalid");
  }

  const user = tokenData.user;

  // Remove sensitive data
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

/**
 * Mengakhiri sesi pengguna dengan menghapus token dari database.
 * Setelah fungsi ini dijalankan, token tersebut tidak bisa lagi digunakan untuk otentikasi.
 *
 * @param {string} token - Bearer token sesi yang ingin dihapus.
 * @returns {Promise<boolean>} Mengembalikan true jika berhasil dihapus.
 * @throws {Error} Jika token tidak ditemukan di database.
 */
export const logoutUser = async (token: string) => {
  if (!token) {
    throw new Error("Token is invalid or expired");
  }

  // Check if token exists
  const tokenData = await db.query.userTokens.findFirst({
    where: eq(userTokens.token, token),
  });

  if (!tokenData) {
    throw new Error("Token is invalid or expired");
  }

  // Delete token
  await db.delete(userTokens).where(eq(userTokens.token, token));

  return true;
};
