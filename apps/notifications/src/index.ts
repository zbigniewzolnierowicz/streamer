import { connect } from "amqplib";

async function consumer() {
  // TODO: Replace connection string and queue name with environment variable
  const conn = await connect("amqp://test:test@localhost");

  console.log("[Notification] Connected");

  const queueName = "email";
  const channel = await conn.createChannel();
  await channel.assertQueue(queueName);

  // TODO: Add logic for parsing queue messages
  channel.consume(queueName, (msg) => {
    if (msg !== null) {
      console.log("Recieved:", msg.content.toString());
      channel.ack(msg);
    } else {
      console.log("Consumer cancelled by server");
    }
  });
}

consumer();