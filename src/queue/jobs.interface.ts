/**
 * The list of jobs that the queue can handle.
 */
export type JobsList = 'groupExpire' | 'emojiExpire';

/**
 * Interface for the group expire job.
 */
export interface GroupExpireJob {
  type: 'groupExpire';
  groupId: string;
}

/**
 * Interface for the emoji expire job.
 *
 * TODO: Implement this job in the future.
 */
export interface EmojiExpireJob {
  type: 'emojiExpire';
}

/**
 * Generic type for the jobs that the queue can handle.
 *
 * This is the union of all the jobs that the queue can handle.
 */
export type NightlightQueueJob = GroupExpireJob | EmojiExpireJob;
