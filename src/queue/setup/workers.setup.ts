import { Job, Worker, WorkerOptions } from 'bullmq';
import { connectMongoDB } from '../../config/mongodb.config';
import { NIGHTLIGHT_QUEUE } from '../../utils/constants';
import { GroupExpireJob } from '../jobs.interface';
import { expireGroup } from '../workers';

// Define the connection options for the worker
const workerOptions: WorkerOptions = {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
};

/**
 * Decide which worker to use based on the type of an emmitted job.
 * @param job Job to be handled by the worker
 */
const workerHandler = async (job: Job<GroupExpireJob>) => {
  switch (job.data.type) {
    case 'groupExpire': {
      expireGroup(job.data.groupId);
      return;
    }
  }
};

connectMongoDB();

// Create a new worker that will process the queue
new Worker(NIGHTLIGHT_QUEUE, workerHandler, workerOptions);
