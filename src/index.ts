import { Elysia } from "elysia";
import { userRoutes } from "./routes/users-routes";

const app = new Elysia()
  .get("/", () => "Hello World")
  .use(userRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
