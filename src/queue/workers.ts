import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { NotificationType } from '../interfaces/Notification.interface';
import Group from '../models/Group.model';
import User from '../models/User.model';
import Venue from '../models/Venue.model';
import { sendNotifications } from '../utils/notification.utils';

/**
 * Expire a group from the database after the queue job has been processed
 * @param groupId the ID of the group to be expired
 */
export const expireGroup = async (groupId: string) => {
  try {
    const targetGroup = await Group.findByIdAndDelete(groupId);

    if (targetGroup === null) {
      return;
    }

    if (targetGroup.members && targetGroup.members.length > 0) {
      // remove group id from all members who have joined the group
      await User.updateMany(
        { _id: targetGroup.members },
        {
          currentGroup: undefined,
        }
      );

      // remove group id from all invited members who have not joined the group
      await User.updateMany(
        { _id: targetGroup.invitedMembers },
        {
          $pull: { invitedGroups: groupId },
        }
      );
    }

    sendNotifications(
      [...targetGroup.members.map(objectId => objectId.toString())],
      'Group expired! 👋',
      'Your group has expired. We hope you had a safe night!',
      {
        notificationType: NotificationType.groupExpired,
        sentDateTime: new Date().toUTCString(),
      },
      false
    );
  } catch (error: any) {
    console.log(error.message);
  }
};

/**
 * Expire a reaction from the database after the queue job has been processed
 * @param userId the user ID of the user who created the reaction
 * @param venueId the venue ID of the venue where the reaction was created
 * @param emoji the emoji of the reaction to be expired
 */
export const expireReaction = async (
  userId: string,
  venueId: string,
  emoji: string
) => {
  try {
    await Venue.findOneAndUpdate(
      { _id: venueId },
      { $pull: { reactions: { userId: userId, emoji: emoji } } }
    );
  } catch (error: any) {
    console.log(error.message);
  }
};
