import mongoose from 'mongoose';
import { Document } from 'mongoose';

/**
 * @interface MongoNotification
 * Interface defining the data structure for a notification to be saved in MongoDB database.
 *
 * @property {_id} mongoose.Types.ObjectId - Optional ID of the notification.
 * @property {string} userId - ID of the user to whom the notification belongs.
 * @property {string} title - Notification title.
 * @property {string} body - Notification message body.
 * @property {NotificationData} data - Additional data that can be attached to the notification.
 * @property {number} delay - The delay in delivery of notification in seconds.
 */
export interface MongoNotification {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  body: string;
  data: NotificationData;
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
 * @property {NotificationData} data - Additional data to attach to the notification
 */
export interface ExpoNotification {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: NotificationData;
}

/**
 * Interface for notification data. Will be added to over time.
 * This data will be used when the notification is clicked.
 *
 * @interface
 * @property {string} notificationType - The type of notification.
 */
export interface NotificationData {
  notificationType: string;
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
}

/**
 * @interface NotificationDocument
 *
 * This interface represents a notification document that represents the document in the response from the database.
 * It contains information such as the user ID, title, body, data, and delay for displaying notifications.
 */
export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  data: NotificationData;
  delay: number;
}
