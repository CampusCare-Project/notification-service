import { createMiddleware } from "hono/factory";
import { unauthorized } from "../utils/api-error";
import type { AppVariables, UserRole } from "../types/hono";

const validRoles = new Set(["STUDENT", "STAFF", "TECHNICIAN", "ADMIN"]);

export const authMiddleware = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const userId = c.req.header("x-user-id");
  const role = c.req.header("x-user-role") as UserRole | undefined;

  if (!userId || !role) {
    throw unauthorized("Unauthorized: header x-user-id dan x-user-role wajib ada dari API Gateway");
  }

  if (!validRoles.has(role)) {
    throw unauthorized("Unauthorized: role tidak valid");
  }

  c.set("actor", { id: userId, role });
  await next();
});
