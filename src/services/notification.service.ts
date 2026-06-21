import { prisma } from "../utils/prisma";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { forbidden, notFound } from "../utils/api-error";
import type { Actor } from "../types/hono";
import type {
  CreateSystemNotificationInput,
  ListNotificationsInput,
  RegisterDeviceTokenInput,
} from "../validation/notification.validation";
import type { NotificationType, NotificationChannel } from "@prisma/client";

const ADMIN_BROADCAST_USER_ID = process.env.ADMIN_BROADCAST_USER_ID ?? "ADMIN_BROADCAST";

function notificationReadableByActorWhere(actor: Actor) {
  if (actor.role === "ADMIN") {
    return {
      OR: [{ userId: actor.id }, { userId: ADMIN_BROADCAST_USER_ID }],
    };
  }

  return { userId: actor.id };
}

export async function listNotificationsService(actor: Actor, query: ListNotificationsInput) {
  const { page, limit, skip } = getPagination(query.page, query.limit);

  const where = {
    ...notificationReadableByActorWhere(actor),
    ...(query.type ? { type: query.type } : {}),
    ...(query.isRead ? { isRead: query.isRead === "true" } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function unreadCountService(actor: Actor) {
  const count = await prisma.notification.count({
    where: {
      ...notificationReadableByActorWhere(actor),
      isRead: false,
    },
  });

  return { count };
}

export async function markNotificationReadService(actor: Actor, id: string) {
  const notification = await prisma.notification.findFirst({
    where: {
      id,
      ...notificationReadableByActorWhere(actor),
    },
  });

  if (!notification) throw notFound("Notifikasi tidak ditemukan");

  return prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsReadService(actor: Actor) {
  const result = await prisma.notification.updateMany({
    where: {
      ...notificationReadableByActorWhere(actor),
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { updated: result.count };
}

export async function deleteNotificationService(actor: Actor, id: string) {
  const notification = await prisma.notification.findFirst({
    where: {
      id,
      ...notificationReadableByActorWhere(actor),
    },
  });

  if (!notification) throw notFound("Notifikasi tidak ditemukan");

  await prisma.notification.delete({ where: { id } });
  return true;
}

export async function createSystemNotificationService(actor: Actor, input: CreateSystemNotificationInput) {
  if (actor.role !== "ADMIN") throw forbidden("Hanya ADMIN yang dapat membuat system notification");

  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: "SYSTEM",
      channel: input.channel as NotificationChannel,
      status: "SENT",
      title: input.title,
      body: input.body,
      data: input.data,
      sentAt: new Date(),
    },
  });
}

export async function registerDeviceTokenService(actor: Actor, input: RegisterDeviceTokenInput) {
  return prisma.deviceToken.upsert({
    where: { token: input.token },
    create: {
      userId: actor.id,
      token: input.token,
      platform: input.platform,
      isActive: true,
    },
    update: {
      userId: actor.id,
      platform: input.platform,
      isActive: true,
    },
  });
}

export async function deactivateDeviceTokenService(actor: Actor, tokenId: string) {
  const existing = await prisma.deviceToken.findFirst({
    where: {
      id: tokenId,
      userId: actor.id,
    },
  });

  if (!existing) throw notFound("Device token tidak ditemukan");

  return prisma.deviceToken.update({
    where: { id: tokenId },
    data: { isActive: false },
  });
}

export async function createNotificationFromEvent(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: unknown;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      channel: "IN_APP",
      status: "SENT",
      title: input.title,
      body: input.body,
      data: input.data as any,
      sentAt: new Date(),
    },
  });
}
