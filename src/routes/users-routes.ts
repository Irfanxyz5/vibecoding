import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/users-services";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      const user = await registerUser(body);
      
      set.status = 201;
      return {
        message: "User registered successfully",
        user,
      };
    } catch (error: any) {
      if (error.message === "User already exists") {
        set.status = 409;
        return {
          message: "User already exists",
          error: "Conflict",
        };
      }
      
      set.status = 500;
      return {
        message: "Internal Server Error",
        error: error.message,
      };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  .post("/login", async ({ body, set }) => {
    try {
      const user = await loginUser(body);
      
      return {
        message: "Login user successfully",
        user,
      };
    } catch (error: any) {
      if (error.message === "email atau password salah") {
        set.status = 401;
        return {
          message: "email atau password salah",
          error: "Unauthorized",
        };
      }
      
      set.status = 500;
      return {
        message: "Internal Server Error",
        error: error.message,
      };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  .get("/current", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return {
          message: "Token is invalid",
          error: "Unauthorized",
        };
      }

      const token = authHeader.split(" ")[1];
      const user = await getCurrentUser(token);

      return {
        message: "User get successfully",
        user,
      };
    } catch (error: any) {
      if (error.message === "Token is invalid") {
        set.status = 401;
        return {
          message: "Token is invalid",
          error: "Unauthorized",
        };
      }

      set.status = 500;
      return {
        message: "Internal Server Error",
        error: error.message,
      };
    }
  });

