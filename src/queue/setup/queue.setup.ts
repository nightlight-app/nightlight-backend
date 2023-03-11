import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Define the connection options for the queue
const queueOptions = {
  connection: new Redis({
    host: 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }),
};

/**
 * Create a new queue that will be used to process jobs.
 * Also can be used to retrieve the existing queue.
 * No two queues with the same name can exist.
 */
export const nightlightQueue = new Queue('nightlight-queue', queueOptions);
