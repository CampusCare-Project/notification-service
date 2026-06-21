export type BaseEvent<T> = {
  eventId: string;
  eventName: string;
  version: number;
  producer: string;
  occurredAt: string;
  data: T;
};

export type ReportEventCommon = {
  reportId: string;
  reporterId: string;
  title: string;
  categoryId?: string;
  locationText?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export type ReportCreatedPayload = ReportEventCommon;

export type ReportVerifiedPayload = ReportEventCommon & {
  verifiedById?: string;
  note?: string | null;
};

export type ReportRejectedPayload = ReportEventCommon & {
  rejectedById?: string;
  reason?: string | null;
};

export type ReportAssignedPayload = ReportEventCommon & {
  technicianId: string;
  assignedById: string;
  note?: string | null;
};

export type ReportStatusChangedPayload = ReportEventCommon & {
  technicianId?: string | null;
  fromStatus?: string | null;
  toStatus: string;
  note?: string | null;
};

export type ReportResolvedPayload = ReportEventCommon & {
  technicianId?: string | null;
  resolvedNote?: string | null;
};

export type ReportCancelledPayload = ReportEventCommon & {
  cancelledById?: string;
  note?: string | null;
};
