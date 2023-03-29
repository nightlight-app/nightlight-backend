import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { NotificationType } from '../library/interfaces/Notification.interface';
import Group from '../library/models/Group.model';
import User from '../library/models/User.model';
import Venue from '../library/models/Venue.model';
import { sendNotifications } from '../library/utils/notification.utils';

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
      const result = await User.updateMany(
        { _id: targetGroup.members },
        {
          currentGroup: undefined,
        }
      );
    }

    sendNotifications(
      [...targetGroup.members.map(objectId => objectId.toString())],
      'Group expired! 👋',
      'Your group has expired. We hope you had a safe night!',
      { notificationType: NotificationType.groupExpired },
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
