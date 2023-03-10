import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { createAdapter } from './bullboard.adapter';

const redisConnection = new Redis({
  host: 'localhost',
  port: 6379,
});

const queueOptions = {
  connection: redisConnection,
};

export const nightlightQueue = new Queue('nightlight-queue', queueOptions);

export const startQueue = () => {
  const queues = {
    nightlightQueue,
  };

  console.log('EVENT: Queue started!');
  const adapter = createAdapter('/bull-board', queues);

  return adapter;
};
