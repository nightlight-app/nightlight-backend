import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { nightlightQueue } from './queue.setup';

/**
 * Creates a new BullBoard adapter to be used for development
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
