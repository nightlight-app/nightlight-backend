import { Job, Worker, WorkerOptions } from 'bullmq';
import { connectMongoDB } from '../../config/mongodb.config';
import { NIGHTLIGHT_QUEUE } from '../../utils/constants';
import { NightlightQueueJob } from '../jobs.interface';
import { expireGroup, expireReaction } from '../workers';

let redisHost = process.env.REDIS_HOST || '';

// Use localhost for testing because server is not run in docker
if (process.env.ENVIRONMENT === 'test') redisHost = 'localhost';

/**
 * Define the connection options for the worker
 */
const workerOptions: WorkerOptions = {
  connection: {
    host: redisHost,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
};

/**
 * Decide which worker to use based on the type of an emmitted job.
 * @param job Job to be handled by the worker
 * @returns {Promise<void>} completion of the worker after handling the job
 */
const workerHandler = async (job: Job<NightlightQueueJob>) => {
  switch (job.data.type) {
    case 'groupExpire':
      await expireGroup(job.data.groupId);
      return;
    case 'reactionExpire':
      await expireReaction(job.data.userId, job.data.venueId, job.data.emoji);
      return;
    default:
      // exit if the job type is not recognized
      return;
  }
};

/**
 * Connect to the MongoDB database.
 */
connectMongoDB();

/**
 * Create a new worker that will process the queue
 */
new Worker(NIGHTLIGHT_QUEUE, workerHandler, workerOptions);
