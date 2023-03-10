import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { createBullBoardAdapter } from './bullboard.setup';

// Define the connection options for the queue
const queueOptions = {
  connection: new Redis({
    host: 'localhost',
    port: 6379,
  }),
};

/**
 * Create a new queue that will be used to process jobs.
 * Also can be used to retrieve the existing queue.
 * No two queues with the same name can exist.
 */
export const nightlightQueue = new Queue('nightlight-queue', queueOptions);
