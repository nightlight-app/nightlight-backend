import { Emoji } from '../utils/venue.utils';

/**
 * The list of jobs that the queue can handle
 * @options groupExpire, reactionExpire
 */
export type JobsList = 'groupExpire' | 'reactionExpire' | 'pingExpire';

/**
 * Interface representing a group expire job.
 * @interface GroupExpireJob
 *
 * @property {string} type - The type of job. Always "groupExpire".
 * @property {string} groupId - The ID of the group to expire.
 */
export interface GroupExpireJob {
  type: 'groupExpire';
  groupId: string;
}

/**
 * Represents a job to expire a reaction on a venue.
 * @interface ReactionExpireJob
 *
 * @property {string} type - The type of the job, which should always be `'reactionExpire'`.
 * @property {string} userId - The ID of the user who reacted to the venue.
 * @property {string} venueId - The ID of the venue where the reaction was made.
 * @property {Emoji} emoji - The emoji that was used in the reaction.
 */
export interface ReactionExpireJob {
  type: 'reactionExpire';
  userId: string;
  venueId: string;
  emoji: Emoji;
}

/**
 * Represents a job to expire a ping.
 * @interface PingExpireJob
 *
 * @property {string} type - The type of the job, which should always be `'pingExpire'`.
 * @property {string} pingId - The ID of the ping to expire.
 */
export interface PingExpireJob {
  type: 'pingExpire';
  pingId: string;
}

/**
 * Generic type for the jobs that the queue can handle.
 * This is the union of all the jobs that the queue can handle.
 *
 * @options GroupExpireJob, ReactionExpireJob
 */
export type NightlightQueueJob =
  | GroupExpireJob
  | ReactionExpireJob
  | PingExpireJob;
