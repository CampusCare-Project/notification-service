import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "REPORT_CREATED",
  "REPORT_VERIFIED",
  "REPORT_ASSIGNED",
  "REPORT_IN_PROGRESS",
  "REPORT_RESOLVED",
  "REPORT_REJECTED",
  "REPORT_CANCELLED",
  "SYSTEM",
]);

export const notificationChannelSchema = z.enum(["IN_APP", "PUSH", "EMAIL"]);

export const listNotificationsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isRead: z.enum(["true", "false"]).optional(),
  type: notificationTypeSchema.optional(),
});

export const createSystemNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(3),
  body: z.string().min(3),
  channel: notificationChannelSchema.default("IN_APP"),
  data: z.any().optional(),
});

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(10),
  platform: z.string().min(2),
});

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
export type CreateSystemNotificationInput = z.infer<typeof createSystemNotificationSchema>;
export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
