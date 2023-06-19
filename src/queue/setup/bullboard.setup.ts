import { nightlightQueue } from './queue.setup';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

/**
 * Creates a new BullBoard adapter to be used for development
 * Useless for mocha tests, is therefore only uncommented for development use in src/server.ts
 * @returns {ExpressAdapter} bullboard adapter
 */
export const createBullBoardAdapter = () => {
  const serverAdapter = new ExpressAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(nightlightQueue)],
    serverAdapter: serverAdapter,
  });

  serverAdapter.setBasePath('/bull-board');

  return serverAdapter;
};
