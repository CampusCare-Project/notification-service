# CampusCare Notification Service

Microservice untuk notifikasi CampusCare.

Fungsi utama:

- Consume event dari ActiveMQ yang dipublish oleh `report-service`.
- Simpan notifikasi ke PostgreSQL.
- Sediakan REST API untuk React Native melalui API Gateway.

## Stack

- Bun
- Hono
- Prisma
- PostgreSQL
- ActiveMQ / Artemis via STOMP
- Zod

## Struktur

```txt
apps/notification-service/
  prisma/
    schema.prisma
  src/
    controller/
    middleware/
    routes/
    utils/
    services/
    validation/
    events/
    app.ts
    index.ts
```

## Env

```env
PORT=3003
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campuscare_notification?schema=public"
ACTIVEMQ_HOST=localhost
ACTIVEMQ_STOMP_PORT=61613
ACTIVEMQ_USER=admin
ACTIVEMQ_PASSWORD=admin
DISABLE_MQ_CONSUMER=false
ADMIN_BROADCAST_USER_ID=ADMIN_BROADCAST
```

## Jalankan lokal

```bash
cd apps/notification-service
bun install
cp .env.example .env
bunx prisma generate
bunx prisma migrate dev --name init
bun run dev
```

## Endpoint REST

Semua endpoint di bawah harus melewati API Gateway dan menerima header internal:

```txt
x-user-id: <id_user>
x-user-role: STUDENT | STAFF | TECHNICIAN | ADMIN
```

Endpoint:

```txt
GET    /api/notifications
GET    /api/notifications/unread-count
POST   /api/notifications/system
POST   /api/notifications/device-tokens
DELETE /api/notifications/device-tokens/:id
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
```

## Event ActiveMQ yang dikonsumsi

```txt
/queue/report.created
/queue/report.verified
/queue/report.rejected
/queue/report.assigned
/queue/report.status_changed
/queue/report.resolved
/queue/report.cancelled
```

Event `report.created` akan membuat notifikasi untuk `ADMIN_BROADCAST`.
Saat user role ADMIN mengambil notifikasi, service akan mengambil notifikasi milik admin tersebut dan notifikasi broadcast admin.

## Update API Gateway

Tambahkan env:

```env
NOTIFICATION_SERVICE_URL=http://localhost:3003
```

Tambahkan mapping route gateway:

```ts
proxyRoutes.all("/api/notifications", authMiddleware, async (c) => {
  return proxyRequest(c, env.NOTIFICATION_SERVICE_URL);
});

proxyRoutes.all("/api/notifications/*", authMiddleware, async (c) => {
  return proxyRequest(c, env.NOTIFICATION_SERVICE_URL);
});
```
