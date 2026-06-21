import type { Context } from "hono";

export function ok<T>(c: Context, message: string, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, message, data }, status);
}

export function fail(c: Context, message: string, status = 400, errors?: unknown) {
  return c.json({ success: false, message, ...(errors ? { errors } : {}) }, status as any);
}
