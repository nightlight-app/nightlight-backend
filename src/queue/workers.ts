import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { NotificationType } from '../interfaces/Notification.interface';
import Group from '../models/Group.model';
import User from '../models/User.model';
import Venue from '../models/Venue.model';
import { sendNotifications } from '../utils/notification.utils';
import Ping from '../models/Ping.model';
import { PingStatus } from '../interfaces/Ping.interface';

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
        groupId: groupId,
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

/**
 * If a ping expires, the status of the ping must be updated to expired
 * @param pingId - The ID of the ping that the expiration job is for
 */
export const expirePing = async (pingId: string) => {
  try {
    // Update the status of the ping to expired and get the ping
    const ping = await Ping.findByIdAndUpdate(pingId, {
      status: PingStatus.EXPIRED,
    });

    // If the ping is null, return
    if (ping === null) {
      return;
    }

    // Get the recipient of the ping
    const recipientUser = await User.findById(ping?.recipientId);

    // If the recipient is null, return
    if (recipientUser === null) {
      return;
    }

    // Get the sender of the ping
    const senderUser = await User.findById(ping?.senderId);

    // If the sender is null, return
    if (senderUser === null) {
      return;
    }

    // Send a notification to the sender
    sendNotifications(
      [ping?.senderId.toString()],
      'Ping expired!⚠️',
      `Your ping to ${recipientUser.firstName} ${recipientUser.lastName} has expired without a response.`,
      {
        notificationType: NotificationType.pingExpiredSender,
        sentDateTime: new Date().toUTCString(),
        pingId: pingId,
        recipientId: ping?.recipientId.toString(),
        recipientFirstName: recipientUser?.firstName,
        recipientLastName: recipientUser?.lastName,
        senderId: ping.senderId.toString(),
        senderFirstName: senderUser?.firstName,
        senderLastName: senderUser?.lastName,
      },
      true
    );

    // Send a notification to the recipient
    sendNotifications(
      [ping?.recipientId.toString()],
      'Ping expired!⚠️',
      `You haven't responded to your ping from ${senderUser?.firstName} ${senderUser?.lastName}.`,
      {
        notificationType: NotificationType.pingExpiredRecipient,
        sentDateTime: new Date().toUTCString(),
        pingId: pingId,
        recipientId: ping?.recipientId.toString(),
        recipientFirstName: recipientUser?.firstName,
        recipientLastName: recipientUser?.lastName,
        senderId: ping.senderId.toString(),
        senderFirstName: senderUser?.firstName,
        senderLastName: senderUser?.lastName,
      },
      true
    );
  } catch (error: any) {
    console.log(error.message);
  }
};
