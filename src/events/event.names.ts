export const EVENT_NAMES = {
  REPORT_CREATED: "report.created",
  REPORT_VERIFIED: "report.verified",
  REPORT_REJECTED: "report.rejected",
  REPORT_ASSIGNED: "report.assigned",
  REPORT_STATUS_CHANGED: "report.status_changed",
  REPORT_RESOLVED: "report.resolved",
  REPORT_CANCELLED: "report.cancelled",
} as const;

export const QUEUES = {
  REPORT_CREATED: "/queue/report.created",
  REPORT_VERIFIED: "/queue/report.verified",
  REPORT_REJECTED: "/queue/report.rejected",
  REPORT_ASSIGNED: "/queue/report.assigned",
  REPORT_STATUS_CHANGED: "/queue/report.status_changed",
  REPORT_RESOLVED: "/queue/report.resolved",
  REPORT_CANCELLED: "/queue/report.cancelled",
} as const;
