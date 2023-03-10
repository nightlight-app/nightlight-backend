import { Job, Worker, WorkerOptions } from 'bullmq';
import { WorkerJob } from '../../types/jobs.types';

const workerOptions: WorkerOptions = {
  connection: {
    host: 'localhost',
    port: 6379,
  },
};

const workerHandler = async (job: Job<WorkerJob>) => {
  switch (job.data.type) {
    case 'groupExpire': {
      console.log(`Hello world!`, job.data);
      return;
    }
  }
};

const worker = new Worker('nightlight-queue', workerHandler, workerOptions);

console.log('EVENT: Worker started!');
