import { Queue } from "bullmq";
import { redis } from "./redis";

export const emailQueue = new Queue("email-send", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 2000,
  },
});
