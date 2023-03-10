import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

export const createAdapter = (path: string, queues: any) => {
  const serverAdapter = new ExpressAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(queues.nightlightQueue)],
    serverAdapter: serverAdapter,
  });

  serverAdapter.setBasePath(path);

  return serverAdapter;
};
