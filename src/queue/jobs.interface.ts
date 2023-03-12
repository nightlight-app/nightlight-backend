import { Emoji } from '../utils/types';

/**
 * The list of jobs that the queue can handle./v2
 */
export type JobsList = 'groupExpire' | 'reactionExpire';

/**
 * Interface for the group expire job.
 */
export interface GroupExpireJob {
  type: 'groupExpire';
  groupId: string;
}

/**
 * Interface for the emoji expire job.
 */
export interface ReactionExpireJob {
  type: 'reactionExpire';
  userId: string;
  venueId: string;
  emoji: Emoji;
}

/**
 * Generic type for the jobs that the queue can handle.
 *
 * This is the union of all the jobs that the queue can handle.
 */
export type NightlightQueueJob = GroupExpireJob | ReactionExpireJob;
