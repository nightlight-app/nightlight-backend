import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { NIGHTLIGHT_QUEUE } from '../../utils/constants';
import { JobsList, NightlightQueueJob } from '../jobs.interface';

// Define the connection options for the queue
const queueOptions = {
  connection: new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }),
};

/**
 * Create a new queue that will be used to process jobs.
 * Also can be used to retrieve the existing queue.
 * No two queues with the same name can exist.
 */
export const nightlightQueue = new Queue<NightlightQueueJob, any, JobsList>(
  NIGHTLIGHT_QUEUE,
  queueOptions
);
