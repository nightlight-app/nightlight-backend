import Group from '../models/Group.model';

/**
 * Expire a group from the database after the queue job has been processed
 * @param groupId the ID of the group to be expired
 */
export const expireGroup = async (groupId: string) => {
  console.log('WORKER FUNCTION IS RUNNING');
  try {
    Group.findByIdAndDelete(groupId);
  } catch (error: any) {
    console.log(error);
  }
};
