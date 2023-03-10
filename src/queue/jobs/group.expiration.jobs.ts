import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { GroupExpireJob } from '../../types/jobs.types';
import { nightlightQueue } from '../setup/queue.setup';

/**
 * Add group expire job to the nightlightQueue.
 * @param {string} groupId - The ID of the group that the expiration job is for
 * @param {number} delay - Optional delay (in ms) before the job gets processed by the worker
 * @returns {Promise} - A promise that resolves when the job has been added to the queue.
 */
export const addGroupExpireJob = async (groupId: string, delay: number) => {
  try {
    console.log('EVENT: Group job added');

    nightlightQueue.add(
      'groupExpire',
      {
        type: 'groupExpire',
        data: { groupId: groupId },
      },
      { delay: delay }
    );
  } catch (error: any) {
    console.log(error);
  }
};