import { nightlightQueue } from './setup/queue.setup';

/**
 * Add group expire job to the nightlightQueue.
 * @param {string} groupId - The ID of the group that the expiration job is for
 * @param {number} delay - Optional delay (in ms) before the job gets processed by the worker
 * @returns {Promise} - A promise that resolves when the job has been added to the queue.
 */
export const addGroupExpireJob = async (
  groupId: string,
  delay: number = 10000
) => {
  try {
    nightlightQueue.add(
      'groupExpire',
      {
        type: 'groupExpire',
        groupId: groupId,
      },
      { delay: delay }
    );
  } catch (error: any) {
    console.log(error);
  }
};

/**
 * Interface for the group expire job.
 * This is not completely necessary, but it helps with type checking.
 * Used as the type for the Job template object in the worker.
 */
export interface GroupExpireJob {
  type: 'groupExpire';
  groupId: string;
}
