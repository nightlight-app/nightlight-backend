import { Emoji } from '../utils/types';
import { nightlightQueue } from './setup/queue.setup';

/**
 * Add group expire job to the nightlightQueue.
 * @param {string} groupId - The ID of the group that the expiration job is for
 * @param {number} delay - Optional delay (in ms) before the job gets processed by the worker
 * @returns {Promise} - A promise that resolves when the job has been added to the queue.
 */
export const addGroupExpireJob = async (groupId: string, delay: number) => {
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
  try {
    nightlightQueue.add(
      'reactionExpire',
      {
        type: 'reactionExpire',
        userId: userId,
        venueId: venueId,
        emoji: emoji,
      },
      { delay: delay }
    );
  } catch (error: any) {
    console.log(error);
  }
};
