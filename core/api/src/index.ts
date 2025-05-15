import "dotenv/config";
import chalk from "chalk";
import app from "./app";
import { API_PORT, RABBIT_MQ_URL } from "./config/config";
import MessageQueue from "./utils/message-broker/message-queue";
import { QUEUE_NAMES } from "./utils/message-broker/queue-names";
import { execa } from "execa";
import { cwd } from "process";

export const messageQueue = new MessageQueue(RABBIT_MQ_URL, QUEUE_NAMES.SCALER);

/**
 * Start the server instance
 */
app.listen(API_PORT, async () => {
  await messageQueue.connect();
  console.log(`${chalk.blue("[SERVER]")} Running on port ${API_PORT}`);
});
