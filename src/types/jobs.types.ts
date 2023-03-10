export interface GroupExpireJob {
  type: 'groupExpire';
  data: { groupId: string };
}

export type WorkerJob = GroupExpireJob;
