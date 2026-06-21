import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import { NotificationController } from "../controller/notification.controller";
import type { AppVariables } from "../types/hono";

const notificationRoutes = new Hono<{ Variables: AppVariables }>();

notificationRoutes.use("*", authMiddleware);

notificationRoutes.get("/", NotificationController.list);
notificationRoutes.get("/unread-count", NotificationController.unreadCount);
notificationRoutes.post("/system", NotificationController.createSystem);
notificationRoutes.post("/device-tokens", NotificationController.registerDeviceToken);
notificationRoutes.delete("/device-tokens/:id", NotificationController.deactivateDeviceToken);
notificationRoutes.patch("/read-all", NotificationController.markAllRead);
notificationRoutes.patch("/:id/read", NotificationController.markRead);
notificationRoutes.delete("/:id", NotificationController.delete);

export default notificationRoutes;
