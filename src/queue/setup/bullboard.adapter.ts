import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

/**
 * Creates a new BullBoard adapter to be used for development
 * @param {string} path  the path to the bullboard adapter
 * @param {any} queues the queues to be used by the adapter
 * @returns {ExpressAdapter} bullboard adapter
 */
export const createAdapter = (path: string, queues: any) => {
  const serverAdapter = new ExpressAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(queues.nightlightQueue)],
    serverAdapter: serverAdapter,
  });

  serverAdapter.setBasePath(path);

  return serverAdapter;
};
