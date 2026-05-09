import { Elysia } from "elysia";
import { userRoutes } from "./routes/users-routes";

export const app = new Elysia()
  .get("/", () => "Hello World")
  .use(userRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}
