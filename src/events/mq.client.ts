import stompit from "stompit";

const connectOptions = {
  host: process.env.ACTIVEMQ_HOST ?? "localhost",
  port: Number(process.env.ACTIVEMQ_STOMP_PORT ?? 61613),
  connectHeaders: {
    host: "/",
    login: process.env.ACTIVEMQ_USER ?? "admin",
    passcode: process.env.ACTIVEMQ_PASSWORD ?? "admin",
    "heart-beat": "5000,5000",
  },
};

let client: stompit.Client | null = null;
let connecting: Promise<stompit.Client> | null = null;

export async function getMqClient(): Promise<stompit.Client> {
  if (client) return client;
  if (connecting) return connecting;

  connecting = new Promise((resolve, reject) => {
    stompit.connect(connectOptions, (error, connectedClient) => {
      connecting = null;

      if (error) {
        reject(error);
        return;
      }

      client = connectedClient;
      console.log("[ActiveMQ] Connected via STOMP");
      resolve(connectedClient);
    });
  });

  return connecting;
}

export async function subscribeToQueue(
  queueName: string,
  handler: (messageBody: unknown) => Promise<void>
) {
  const mqClient = await getMqClient();

  mqClient.subscribe(
    {
      destination: queueName,
      ack: "client-individual",
    },
    (error, message) => {
      if (error) {
        console.error(`[ActiveMQ] Subscribe error for ${queueName}:`, error);
        return;
      }

      message.readString("utf-8", async (readError, body) => {
        if (readError) {
          console.error(`[ActiveMQ] Read error for ${queueName}:`, readError);
          mqClient.nack(message);
          return;
        }

        try {
          const parsed = JSON.parse(body as any);
          await handler(parsed);
          mqClient.ack(message);
        } catch (handlerError) {
          console.error(`[ActiveMQ] Handler error for ${queueName}:`, handlerError);
          mqClient.nack(message);
        }
      });
    }
  );

  console.log(`[ActiveMQ] Subscribed to ${queueName}`);
}
