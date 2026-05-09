import { db } from "../db";
import { users, userTokens } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

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
