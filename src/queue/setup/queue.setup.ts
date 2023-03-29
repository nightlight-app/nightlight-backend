import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { NIGHTLIGHT_QUEUE } from '../../utils/constants';
import { JobsList, NightlightQueueJob } from '../jobs.interface';

// Define the connection options for the queue
const queueOptions = {
  connection: new Redis({
    host: process.env.REDIS_HOST || 'redis',
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
