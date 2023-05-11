import mongoose from 'mongoose';
import User from '../models/User.model';

/**
 * DEPRECATED FUNCTION (keeping for possible future use)
 *
 * Adds the groupId to the invitedGroups array of the user document
 * @param groupId the id of the group that the users are being invited to join
 * @param invitedUsers array of user ids to be invited to the group of groupId
 * @returns status: HTTP status code
 * @returns message: HTTP response message
 */
export const inviteUsersToGroup = (
  groupId: mongoose.Types.ObjectId | string,
  invitedUsers: mongoose.Types.ObjectId[] | string[]
) => {
  try {
    invitedUsers.forEach(async (userId: mongoose.Types.ObjectId | string) => {
      await User.findByIdAndUpdate(userId, {
        $push: { invitedGroups: groupId },
      });
    });

    return {
      status: 200,
      message: 'Users invited sucessfully',
    };
  } catch (error: any) {
    return {
      status: 500,
      message: 'Group created successfully, error inviting users to group.',
    };
  }
};
