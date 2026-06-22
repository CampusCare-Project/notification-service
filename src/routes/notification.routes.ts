import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import { NotificationController } from "../controller/notification.controller";
import {rateLimit} from "../middleware/rateLimit"
import type { AppVariables } from "../types/hono";

const notificationRoutes = new Hono<{ Variables: AppVariables }>();

notificationRoutes.use("*", authMiddleware);

notificationRoutes.get("/" , 
    rateLimit({
    windowSec:Number(process.env.login_windowsSec ?? 20),
    max:Number(process.env.login_max ?? 20),
    keyPrefix:process.env.login_keyPrefix ?? "getNotfi"
  }),
   NotificationController.list);

notificationRoutes.get("/unread-count", 
    rateLimit({
    windowSec:Number(process.env.login_windowsSec ?? 20),
    max:Number(process.env.login_max ?? 20),
    keyPrefix:process.env.login_keyPrefix ?? "getNotfi"
  }),NotificationController.unreadCount);

notificationRoutes.post("/system",
    rateLimit({
    windowSec:Number(process.env.login_windowsSec ?? 20),
    max:Number(process.env.login_max ?? 20),
    keyPrefix:process.env.login_keyPrefix ?? "getNotfi"
  }),
    NotificationController.createSystem);
notificationRoutes.post("/device-tokens", 
    rateLimit({
    windowSec:Number(process.env.login_windowsSec ?? 20),
    max:Number(process.env.login_max ?? 20),
    keyPrefix:process.env.login_keyPrefix ?? "getNotfi"
  }),
    NotificationController.registerDeviceToken);
notificationRoutes.delete("/device-tokens/:id",
    rateLimit({
    windowSec:Number(process.env.login_windowsSec ?? 20),
    max:Number(process.env.login_max ?? 20),
    keyPrefix:process.env.login_keyPrefix ?? "getNotfi"
  }), NotificationController.deactivateDeviceToken);
notificationRoutes.patch("/read-all",rateLimit({
    windowSec:Number(process.env.login_windowsSec ?? 20),
    max:Number(process.env.login_max ?? 20),
    keyPrefix:process.env.login_keyPrefix ?? "getNotfi"
  }), NotificationController.markAllRead);
notificationRoutes.patch("/:id/read",
    rateLimit({
    windowSec:Number(process.env.login_windowsSec ?? 20),
    max:Number(process.env.login_max ?? 20),
    keyPrefix:process.env.login_keyPrefix ?? "getNotfi"
  }),
    NotificationController.markRead);
    
notificationRoutes.delete("/:id",
    rateLimit({
    windowSec:Number(process.env.login_windowsSec ?? 20),
    max:Number(process.env.login_max ?? 20),
    keyPrefix:process.env.login_keyPrefix ?? "getNotfi"
  }),
    NotificationController.delete);

export default notificationRoutes;
