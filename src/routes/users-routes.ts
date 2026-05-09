import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-services";

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
      name: t.String({ maxLength: 255 }),
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
  .group("", (app) => 
    app
      .derive(async ({ headers, set }) => {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return { user: null, token: null };
        }

        const token = authHeader.split(" ")[1];
        try {
          const user = await getCurrentUser(token);
          return { user, token };
        } catch (error) {
          return { user: null, token: null };
        }
      })
      .onBeforeHandle(({ user, set }) => {
        if (!user) {
          set.status = 401;
          return {
            message: "Token is invalid or expired",
            error: "Unauthorized",
          };
        }
      })
      .get("/current", async ({ user }) => {
        return {
          message: "User get successfully",
          user,
        };
      })
      .delete("/logout", async ({ token }) => {
        await logoutUser(token!);
        return {
          message: "User logout successfully",
        };
      })
  );


