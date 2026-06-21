import type { Context } from "hono";
import { ok, fail } from "../utils/response";
import {
  createSystemNotificationSchema,
  listNotificationsSchema,
  registerDeviceTokenSchema,
} from "../validation/notification.validation";
import {
  createSystemNotificationService,
  deactivateDeviceTokenService,
  deleteNotificationService,
  listNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
  registerDeviceTokenService,
  unreadCountService,
} from "../services/notification.service";
import type { AppVariables } from "../types/hono";

export class NotificationController {
  static async list(c: Context<{ Variables: AppVariables }>) {
    const actor = c.get("actor");
    const query = Object.fromEntries(new URL(c.req.url).searchParams.entries());
    const parsed = listNotificationsSchema.safeParse(query);

    if (!parsed.success) {
      return fail(c, "Validasi query gagal", 400, parsed.error.flatten().fieldErrors);
    }

    const data = await listNotificationsService(actor, parsed.data);
    return ok(c, "Daftar notifikasi berhasil diambil", data);
  }

  static async unreadCount(c: Context<{ Variables: AppVariables }>) {
    const actor = c.get("actor");
    const data = await unreadCountService(actor);
    return ok(c, "Jumlah notifikasi belum dibaca berhasil diambil", data);
  }

  static async markRead(c: Context<{ Variables: AppVariables }>) {
    const actor = c.get("actor");
    const id = c.req.param("id") as string;
    const data = await markNotificationReadService(actor, id);
    return ok(c, "Notifikasi berhasil ditandai sudah dibaca", data);
  }

  static async markAllRead(c: Context<{ Variables: AppVariables }>) {
    const actor = c.get("actor");
    const data = await markAllNotificationsReadService(actor);
    return ok(c, "Semua notifikasi berhasil ditandai sudah dibaca", data);
  }

  static async delete(c: Context<{ Variables: AppVariables }>) {
    const actor = c.get("actor");
    const id = c.req.param("id") as string;
    await deleteNotificationService(actor, id);
    return ok(c, "Notifikasi berhasil dihapus", true);
  }

  static async createSystem(c: Context<{ Variables: AppVariables }>) {
    const actor = c.get("actor");
    const body = await c.req.json();
    const parsed = createSystemNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return fail(c, "Validasi body gagal", 400, parsed.error.flatten().fieldErrors);
    }

    const data = await createSystemNotificationService(actor, parsed.data);
    return ok(c, "System notification berhasil dibuat", data, 201);
  }

  static async registerDeviceToken(c: Context<{ Variables: AppVariables }>) {
    const actor = c.get("actor");
    const body = await c.req.json();
    const parsed = registerDeviceTokenSchema.safeParse(body);

    if (!parsed.success) {
      return fail(c, "Validasi body gagal", 400, parsed.error.flatten().fieldErrors);
    }

    const data = await registerDeviceTokenService(actor, parsed.data);
    return ok(c, "Device token berhasil disimpan", data, 201);
  }

  static async deactivateDeviceToken(c: Context<{ Variables: AppVariables }>) {
    const actor = c.get("actor");
    const tokenId = c.req.param("id") as string;
    const data = await deactivateDeviceTokenService(actor, tokenId);
    return ok(c, "Device token berhasil dinonaktifkan", data);
  }
}
