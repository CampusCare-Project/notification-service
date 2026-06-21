import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorMiddleware } from "./middleware/error.middleware";
import routes from "./routes";

export const app = new Hono();

app.use("*", errorMiddleware);
app.use("*", cors());

app.get("/health", (c) => {
  return c.json({
    success: true,
    service: "notification-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.route("/api", routes);

app.notFound((c) => {
  return c.json({ success: false, message: "Route tidak ditemukan" }, 404);
});
