import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/index";
import { db } from "../src/db";
import { users, userTokens } from "../src/db/schema";

describe("Users API", () => {
  // Setup: Clean DB before each test
  beforeEach(async () => {
    await db.delete(userTokens);
    await db.delete(users);
  });

  describe("POST /api/users (Registration)", () => {
    it("1. [SUCCESS] Should register a new user successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        })
      );
      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.message).toBe("User registered successfully");
      expect(data.user.name).toBe("Test User");
      expect(data.user.email).toBe("test@example.com");
      expect(data.user.password).toBeUndefined();
    });

    it("2. [ERROR] Should fail if email already exists", async () => {
      // Register first user
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User One",
            email: "duplicate@example.com",
            password: "password123",
          }),
        })
      );

      // Try registering same email
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User Two",
            email: "duplicate@example.com",
            password: "password123",
          }),
        })
      );
      const data = await response.json();
      expect(response.status).toBe(409);
      expect(data.error).toBe("Conflict");
    });

    it("3. [ERROR] Should fail if payload is incomplete", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Incomplete User",
            // missing email and password
          }),
        })
      );
      expect(response.status).toBe(422); // Elysia validation error
    });

    it("4. [ERROR] Should fail with invalid email format", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Invalid Email User",
            email: "not-an-email",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422); // Elysia validation error
    });

    it("5. [ERROR] Should fail if name exceeds 255 characters", async () => {
      const longName = "A".repeat(300);
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: longName,
            email: "longname@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422); // Elysia validation error
    });
  });

  describe("POST /api/users/login (Login)", () => {
    beforeEach(async () => {
      // Prepare a user for login tests
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Login Tester",
            email: "login@example.com",
            password: "password123",
          }),
        })
      );
    });

    it("1. [SUCCESS] Should login successfully with correct credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "password123",
          }),
        })
      );
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.message).toBe("Login user successfully");
      expect(data.user.token).toBeDefined();
    });

    it("2. [ERROR] Should fail login with unregistered email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "notfound@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(401);
    });

    it("3. [ERROR] Should fail login with wrong password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "wrongpassword",
          }),
        })
      );
      expect(response.status).toBe(401);
    });

    it("4. [ERROR] Should fail login if payload is incomplete", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
          }),
        })
      );
      expect(response.status).toBe(422);
    });
  });

  describe("GET /api/users/current (Get Profile)", () => {
    let validToken: string;

    beforeEach(async () => {
      // Register and login to get a valid token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Current User Tester",
            email: "current@example.com",
            password: "password123",
          }),
        })
      );
      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "current@example.com",
            password: "password123",
          }),
        })
      );
      const loginData = await loginRes.json();
      validToken = loginData.user.token;
    });

    it("1. [SUCCESS] Should get current user profile with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.message).toBe("User get successfully");
      expect(data.user.email).toBe("current@example.com");
    });

    it("2. [ERROR] Should fail without Authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );
      expect(response.status).toBe(401);
    });

    it("3. [ERROR] Should fail with malformed Authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: validToken, // Missing "Bearer "
          },
        })
      );
      expect(response.status).toBe(401);
    });

    it("4. [ERROR] Should fail with non-existent token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: "Bearer invalid-token-123",
          },
        })
      );
      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/users/logout (Logout)", () => {
    let validToken: string;

    beforeEach(async () => {
      // Register and login to get a valid token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Logout Tester",
            email: "logout@example.com",
            password: "password123",
          }),
        })
      );
      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "logout@example.com",
            password: "password123",
          }),
        })
      );
      const loginData = await loginRes.json();
      validToken = loginData.user.token;
    });

    it("1. [SUCCESS] Should logout successfully and invalidate token", async () => {
      // Logout
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      expect(response.status).toBe(200);

      // Verify token is invalidated
      const currentRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      expect(currentRes.status).toBe(401);
    });

    it("2. [ERROR] Should fail logout without Authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
        })
      );
      expect(response.status).toBe(401);
    });

    it("3. [ERROR] Should fail logout with non-existent token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: "Bearer invalid-token-123",
          },
        })
      );
      expect(response.status).toBe(401);
    });
  });
});
