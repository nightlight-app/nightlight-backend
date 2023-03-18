import mongoose from 'mongoose';

/**
 * @interface MongoNotification
 * Interface defining the data structure for a notification to be saved in MongoDB database.
 *
 * @property {_id} mongoose.Types.ObjectId - Optional ID of the notification.
 * @property {string} userId - ID of the user to whom the notification belongs.
 * @property {string} title - Notification title.
 * @property {string} body - Notification message body.
 * @property {Object} data - Additional data that can be attached to the notification.
 * @property {string} notificationType - Type of the notification.
 * @property {number} delay - The delay in delivery of notification in seconds.
 */
export interface MongoNotification {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  body: string;
  data: Object;
  notificationType: string;
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
 * @property {Object} data - Additional data to attach to the notification
 */
export interface ExpoNotification {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: Object;
}
