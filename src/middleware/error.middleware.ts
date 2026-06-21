import type { Context, Next } from "hono";
import { ApiError } from "../utils/api-error";

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (error: any) {
    console.error("[notification-service:error]", error);

    if (error instanceof ApiError) {
      return c.json({ success: false, message: error.message }, error.status as any);
    }

    return c.json({ success: false, message: "Internal server error" }, 500);
  }
}
