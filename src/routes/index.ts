import { Hono } from "hono";
import notificationRoutes from "./notification.routes";
import type { AppVariables } from "../types/hono";

const routes = new Hono<{ Variables: AppVariables }>();

routes.route("/notifications", notificationRoutes);

export default routes;
