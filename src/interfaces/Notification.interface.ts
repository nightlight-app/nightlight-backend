/* eslint-disable autofix/no-unused-vars */
import type mongoose from 'mongoose';
import type { Document } from 'mongoose';

/**
 * @interface MongoNotification
 * Interface defining the data structure for a notification to be saved in MongoDB database.
 *
 * @property {_id} mongoose.Types.ObjectId - Optional ID of the notification.
 * @property {string} userId - ID of the user to whom the notification belongs.
 * @property {string} title - Notification title.
 * @property {string} body - Notification message body.
 * @property {NotificationSpecificData} data - Additional data that can be attached to the notification.
 * @property {number} delay - The delay in delivery of notification in seconds.
 */
export interface MongoNotification {
  _id?: mongoose.Types.ObjectId;
  recipientId: string;
  title: string;
  body: string;
  data: NotificationSpecificData;
  delay: number;
}

/**
 * @interface ExpoNotification
 * Represents an Expo push-notification message.
 *
 * @property {string} to - The device token of the recipient.
 * @property {string} sound - The sound to play when notification is received by the device.
 * @property {string} title - The title of the notification to display.
 * @property {string} body - The message body of the notification.
 * @property {NotificationSpecifcData} data - Additional data to attach to the notification
 */
export interface ExpoNotification {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: NotificationSpecificData;
}

/**
 * @enum NotificationType
 * Defines the types of notification available
 *
 * @options friendRequest, friendRequestAccepted, friendRequestDeclined, groupInvite, groupInviteAccepted, groupInviteDeclined, groupExpired
 */
export enum NotificationType {
  friendRequest = 'friendRequest',
  friendRequestAccepted = 'friendRequestAccepted',
  friendRequestDeclined = 'friendRequestDeclined',
  groupInvite = 'groupInvite',
  groupInviteAccepted = 'groupInviteAccepted',
  groupInviteDeclined = 'groupInviteDeclined',
  groupExpired = 'groupExpired',
  groupDeleted = 'groupDeleted',
  activateEmergency = 'activateEmergency',
  deactivateEmergency = 'deactivateEmergency',
  pingExpiredRecipient = 'pingExpiredRecipient',
  pingExpiredSender = 'pingExpiredSender',
  pingReceived = 'pingReceived',
  pingRespondedOkay = 'pingRespondedOkay',
  pingRespondedNotOkay = 'pingRespondedNotOkay',
  pingRemoved = 'pingRemoved',
}

/**
 * @interface NotificationDocument
 *
 * This interface represents a notification document that represents the document in the response from the database.
 * It contains information such as the user ID, title, body, data, and delay for displaying notifications.
 */
export interface NotificationDocument extends Document {
  title: string;
  body: string;
  data: NotificationSpecificData;
  delay: number;
}

/**
 * Interface for notification data. Will be added to over time.
 * This data will be used when the notification is clicked.
 *
 * @interface
 * @property {string} notificationType - The type of notification.
 * @property {string} sentDateTime - The date and time the notification was sent.
 */
export interface NotificationData {
  notificationType: string;
  sentDateTime: string;
}

/**
 * @interface FriendRequestNotificationData
 * Interface for the data that is specific to a notification type.
 *
 * @property {string} userId - The ID of the user who is either the sender or recipient of the notification.
 */
export interface FriendRequestNotificationData extends NotificationData {
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
}

/**
 * @interface GroupNotificationData
 * Interface for the data that is specific to a notification type.
 *
 * @property {string} groupId - The ID of the group that the notification is related to.
 * @property {string} groupName - The name of the group that the notification is related to.
 */
export interface GroupNotificationData extends NotificationData {
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  groupId: string;
  groupName: string;
}

/**
 * @interface GroupExpiredData
 * Interface for the data that is specific to a notification type.
 *
 * @property {string} groupId - The ID of the group that the notification is related to.
 */
export interface GroupExpiredData extends NotificationData {
  groupId: string;
}

/**
 * @interface GroupDeletedData
 * Interface for the data that is specific to a notification type.
 *
 * @property {string} groupId - The ID of the group that the notification is related to.
 * @property {string} groupName - The name of the group that the notification is related to.
 */
export interface GroupDeletedData extends NotificationData {
  groupId: string;
  groupName: string;
}

/**
 * @interface EmergencyNotificationData
 * Interface for the data that is specific to a notification type.
 *
 * @property {string} userId - The ID of the user who is either the sender or recipient of the notification.
 * @property {string} groupId - The ID of the group that the notification is related to.
 */
export interface EmergencyNotificationData extends NotificationData {
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  groupId: string;
}

/**
 * @interface PingNotificationData
 * Interface for the data that is specific to a notification type.
 *
 * @property {string} pingId - The ID of the ping that the notification is related to.
 * @property {string} recipientId - The ID of the user who is the recipient of the ping.
 * @property {string} senderId - The ID of the user who is the sender of the ping.
 */
export interface PingNotificationData extends NotificationData {
  pingId: string;
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  recipientId: string;
  recipientFirstName: string;
  recipientLastName: string;
}

/**
 * @type NotificationSpecificData
 * Union type for the data that is specific to a notification type.
 */
export type NotificationSpecificData =
  | FriendRequestNotificationData
  | GroupNotificationData
  | EmergencyNotificationData
  | PingNotificationData
  | GroupExpiredData
  | GroupDeletedData;
