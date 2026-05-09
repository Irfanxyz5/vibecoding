import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoutes } from "./routes/users-routes";

export const app = new Elysia()
  .use(swagger({
    path: '/swagger',
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
