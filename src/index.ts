import { app } from "./app";
import { startReportConsumers } from "./events/report.consumer";
import { prisma } from "./utils/prisma";

const port = Number(process.env.PORT ?? 3003);

await startReportConsumers().catch((error) => {
  console.error("[ActiveMQ] Failed to start consumers:", error);
  console.error("[ActiveMQ] REST API will still run. Check ActiveMQ configuration if notifications from events are needed.");
});

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`[notification-service] running on http://localhost:${port}`);

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
