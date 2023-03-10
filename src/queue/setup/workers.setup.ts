import { Job, Worker, WorkerOptions } from 'bullmq';
import { GroupExpireJob } from '../jobs/group.expiration.jobs';

// Define the connection options for the worker
const workerOptions: WorkerOptions = {
  connection: {
    host: 'localhost',
    port: 6379,
  },
};

/**
 * Decide which worker to use based on the type of an emmitted job.
 * @param job Job to be handled by the worker
 */
const workerHandler = async (job: Job<GroupExpireJob>) => {
  switch (job.data.type) {
    case 'groupExpire': {
      // Will export functionality to workers/group.expiration.worker.ts
      console.log(`Hello world!`, job.data);
      return;
    }
  }
};

// Create a new worker that will process the queue
const worker = new Worker('nightlight-queue', workerHandler, workerOptions);
