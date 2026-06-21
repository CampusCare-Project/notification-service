import { NotificationType } from "@prisma/client";
import { QUEUES } from "./event.names";
import { subscribeToQueue } from "./mq.client";
import { createNotificationFromEvent } from "../services/notification.service";
import type {
  BaseEvent,
  ReportAssignedPayload,
  ReportCancelledPayload,
  ReportCreatedPayload,
  ReportRejectedPayload,
  ReportResolvedPayload,
  ReportStatusChangedPayload,
  ReportVerifiedPayload,
} from "./event.types";

const ADMIN_BROADCAST_USER_ID = process.env.ADMIN_BROADCAST_USER_ID ?? "ADMIN_BROADCAST";

function safeTitle(title?: string) {
  return title?.trim() || "Laporan kerusakan";
}

function stringifyStatus(status?: string | null) {
  if (!status) return "UNKNOWN";
  return status.replace(/_/g, " ");
}

async function handleReportCreated(event: BaseEvent<ReportCreatedPayload>) {
  const data = event.data;

  await createNotificationFromEvent({
    userId: ADMIN_BROADCAST_USER_ID,
    type: NotificationType.REPORT_CREATED,
    title: "Laporan baru masuk",
    body: `Laporan baru: ${safeTitle(data.title)}${data.locationText ? ` di ${data.locationText}` : ""}`,
    data: {
      eventId: event.eventId,
      reportId: data.reportId,
      reporterId: data.reporterId,
      categoryId: data.categoryId,
      priority: data.priority,
      locationText: data.locationText,
    },
  });
}

async function handleReportVerified(event: BaseEvent<ReportVerifiedPayload>) {
  const data = event.data;

  await createNotificationFromEvent({
    userId: data.reporterId,
    type: NotificationType.REPORT_VERIFIED,
    title: "Laporan kamu sudah diverifikasi",
    body: `Laporan "${safeTitle(data.title)}" sudah diverifikasi dan akan diteruskan ke teknisi.`,
    data: {
      eventId: event.eventId,
      reportId: data.reportId,
      verifiedById: data.verifiedById,
      note: data.note,
    },
  });
}

async function handleReportRejected(event: BaseEvent<ReportRejectedPayload>) {
  const data = event.data;

  await createNotificationFromEvent({
    userId: data.reporterId,
    type: NotificationType.REPORT_REJECTED,
    title: "Laporan kamu ditolak",
    body: `Laporan "${safeTitle(data.title)}" ditolak${data.reason ? `: ${data.reason}` : "."}`,
    data: {
      eventId: event.eventId,
      reportId: data.reportId,
      rejectedById: data.rejectedById,
      reason: data.reason,
    },
  });
}

async function handleReportAssigned(event: BaseEvent<ReportAssignedPayload>) {
  const data = event.data;

  await createNotificationFromEvent({
    userId: data.technicianId,
    type: NotificationType.REPORT_ASSIGNED,
    title: "Tugas baru diberikan",
    body: `Kamu ditugaskan menangani laporan "${safeTitle(data.title)}".`,
    data: {
      eventId: event.eventId,
      reportId: data.reportId,
      reporterId: data.reporterId,
      assignedById: data.assignedById,
      note: data.note,
    },
  });

  await createNotificationFromEvent({
    userId: data.reporterId,
    type: NotificationType.REPORT_ASSIGNED,
    title: "Laporan kamu sudah ditugaskan",
    body: `Laporan "${safeTitle(data.title)}" sudah ditugaskan ke teknisi.`,
    data: {
      eventId: event.eventId,
      reportId: data.reportId,
      technicianId: data.technicianId,
    },
  });
}

async function handleReportStatusChanged(event: BaseEvent<ReportStatusChangedPayload>) {
  const data = event.data;
  const toStatus = data.toStatus;

  let notificationType: NotificationType = NotificationType.REPORT_IN_PROGRESS;
  if (toStatus === "RESOLVED") notificationType = NotificationType.REPORT_RESOLVED;
  if (toStatus === "REJECTED") notificationType = NotificationType.REPORT_REJECTED;
  if (toStatus === "CANCELLED") notificationType = NotificationType.REPORT_CANCELLED;
  if (toStatus === "VERIFIED") notificationType = NotificationType.REPORT_VERIFIED;
  if (toStatus === "ASSIGNED") notificationType = NotificationType.REPORT_ASSIGNED;

  await createNotificationFromEvent({
    userId: data.reporterId,
    type: notificationType,
    title: "Status laporan berubah",
    body: `Status laporan "${safeTitle(data.title)}" berubah menjadi ${stringifyStatus(toStatus)}.`,
    data: {
      eventId: event.eventId,
      reportId: data.reportId,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      technicianId: data.technicianId,
      note: data.note,
    },
  });
}

async function handleReportResolved(event: BaseEvent<ReportResolvedPayload>) {
  const data = event.data;

  await createNotificationFromEvent({
    userId: data.reporterId,
    type: NotificationType.REPORT_RESOLVED,
    title: "Laporan selesai diperbaiki",
    body: `Laporan "${safeTitle(data.title)}" sudah diselesaikan${data.resolvedNote ? `: ${data.resolvedNote}` : "."}`,
    data: {
      eventId: event.eventId,
      reportId: data.reportId,
      technicianId: data.technicianId,
      resolvedNote: data.resolvedNote,
    },
  });
}

async function handleReportCancelled(event: BaseEvent<ReportCancelledPayload>) {
  const data = event.data;

  await createNotificationFromEvent({
    userId: data.reporterId,
    type: NotificationType.REPORT_CANCELLED,
    title: "Laporan dibatalkan",
    body: `Laporan "${safeTitle(data.title)}" telah dibatalkan${data.note ? `: ${data.note}` : "."}`,
    data: {
      eventId: event.eventId,
      reportId: data.reportId,
      cancelledById: data.cancelledById,
      note: data.note,
    },
  });
}

export async function startReportConsumers() {
  if (process.env.DISABLE_MQ_CONSUMER === "true") {
    console.log("[ActiveMQ] Consumer disabled by DISABLE_MQ_CONSUMER=true");
    return;
  }

  await subscribeToQueue(QUEUES.REPORT_CREATED, async (event) => {
    await handleReportCreated(event as BaseEvent<ReportCreatedPayload>);
  });

  await subscribeToQueue(QUEUES.REPORT_VERIFIED, async (event) => {
    await handleReportVerified(event as BaseEvent<ReportVerifiedPayload>);
  });

  await subscribeToQueue(QUEUES.REPORT_REJECTED, async (event) => {
    await handleReportRejected(event as BaseEvent<ReportRejectedPayload>);
  });

  await subscribeToQueue(QUEUES.REPORT_ASSIGNED, async (event) => {
    await handleReportAssigned(event as BaseEvent<ReportAssignedPayload>);
  });

  await subscribeToQueue(QUEUES.REPORT_STATUS_CHANGED, async (event) => {
    await handleReportStatusChanged(event as BaseEvent<ReportStatusChangedPayload>);
  });

  await subscribeToQueue(QUEUES.REPORT_RESOLVED, async (event) => {
    await handleReportResolved(event as BaseEvent<ReportResolvedPayload>);
  });

  await subscribeToQueue(QUEUES.REPORT_CANCELLED, async (event) => {
    await handleReportCancelled(event as BaseEvent<ReportCancelledPayload>);
  });
}
