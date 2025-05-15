import ampq from "amqplib";
import logger from "../logger";

export class MessageQueue {
  private connection?: ampq.ChannelModel;
  private channel?: ampq.Channel;

  constructor(private url: string, private queueName: string) {
    this.url = url;
    this.queueName = queueName;
  }

  async connect() {
    try {
      logger.info("Connecting to Rabbit MQ");
      this.connection = await ampq.connect(this.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      this.channel.prefetch(1);
      logger.success("Successfuly connected to Rabbit MQ");
    } catch (err) {
      logger.error("Couldn't connect to Rabbit MQ : ", (err as Error).message);
    }
  }

  async addConsumerListener(onMessage: (message: string) => Promise<void>) {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not initialied");
    }

    await this.channel.consume(
      this.queueName,
      async (message) => {
        if (!message || !this.channel) return;
        const content = message.content.toString();
        logger.info(`Recieved message : ${content}`);
        await onMessage(content);

        // Acknowledge the message to remove it from the queue
        this.channel.ack(message);
      },
      // Ensures messages are acknowledged manually after processing
      { noAck: false }
    );
  }

  async queueMessage(message: string) {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not initialied");
    }

    this.channel.sendToQueue(this.queueName, Buffer.from(message), {
      persistent: true,
    });
    logger.info("Message has been sent to queue");
  }
}

export default MessageQueue;
