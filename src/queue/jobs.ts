import { Emoji } from '../utils/venue.utils';
import { nightlightQueue } from './setup/queue.setup';

/**
 * Add group expire job to the nightlightQueue.
 * @param {string} groupId - The ID of the group that the expiration job is for
 * @param {number} delay - Optional delay (in ms) before the job gets processed by the worker
 * @returns {Promise} - A promise that resolves when the job has been added to the queue.
 */
export const addGroupExpireJob = async (groupId: string, delay: number) => {
  // override delay if environment is test
  if (process.env.ENVIRONMENT === 'test') delay = 3000;

  try {
    await nightlightQueue.add(
      'groupExpire',
      {
        type: 'groupExpire',
        groupId: groupId,
      },
      { delay: delay, removeOnComplete: true, removeOnFail: true }
    );
  } catch (error: any) {
    console.log(error.message);
  }
};

/**
 * Add reaction expire job to the nightlightQueue.
 * @param {string} groupId - The ID of the reaction that the expiration job is for
 * @param {number} delay - Optional delay (in ms) before the job gets processed by the worker
 * @returns {Promise} - A promise that resolves when the job has been added to the queue.
 */
export const addReactionExpireJob = async (
  userId: string,
  venueId: string,
  emoji: Emoji,
  delay: number
) => {
  // override delay if environment is test
  if (process.env.ENVIRONMENT === 'test') delay = 3000;

  try {
    const job = await nightlightQueue.add(
      'reactionExpire',
      {
        type: 'reactionExpire',
        userId: userId,
        venueId: venueId,
        emoji: emoji,
      },
      { delay: delay, removeOnComplete: true, removeOnFail: true }
    );

    return job;
  } catch (error: any) {
    console.log(error.message);
  }
};

/**
 * Add ping expire job to the nightlightQueue.
 * @param {string} pingId - The ID of the ping that the expiration job is for
 * @param {number} delay - Optional delay (in ms) before the job gets processed by the worker
 */
export const addPingExpireJob = async (pingId: string, delay: number) => {
  // override delay if environment is test
  if (process.env.ENVIRONMENT === 'test') delay = 3000;

  try {
    await nightlightQueue.add(
      'pingExpire',
      {
        type: 'pingExpire',
        pingId: pingId,
      },
      { delay: delay, removeOnComplete: true, removeOnFail: true }
    );
  } catch (error: any) {
    console.log(error.message);
  }
};
