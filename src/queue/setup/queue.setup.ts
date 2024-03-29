import { NIGHTLIGHT_QUEUE } from '../../utils/constants';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import type { JobsList, NightlightQueueJob } from '../jobs.interface';

let redisHost = process.env.REDIS_HOST || '';

// Use localhost for testing because server is not run in docker
if (process.env.ENVIRONMENT === 'test') redisHost = 'localhost';

// Define the connection options for the queue
const queueOptions = {
  connection: new Redis({
    host: redisHost,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  }),
};

// Log errors to the console
queueOptions.connection.on('error', err => {
  console.error('Redis connection error:', err);
});

/**
 * Create a new queue that will be used to process jobs.
 * Also can be used to retrieve the existing queue.
 * No two queues with the same name can exist.
 */
export const nightlightQueue = new Queue<NightlightQueueJob, unknown, JobsList>(
  NIGHTLIGHT_QUEUE,
  queueOptions
);

/**
 * Create a new queue events listener that will be used to listen to events
 */
//const queueEvents = new QueueEvents(NIGHTLIGHT_QUEUE);

/**
 * Listen to the queue events and log them to the console for development.
 */
// queueEvents.on('failed', (args: any, id: string) => {
//   console.log('Job failed: ' + args?.failedReason);
// });
// queueEvents.on('completed', (args: any, id: string) => {
//   console.log(`Job # ${id} completed.`);
// });
