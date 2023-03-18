export interface MongoNotification {
  userId: string;
  title: string;
  body: string;
  data: Object;
  notificationType: string;
  delay: number;
}

/**
 * Represents an Expo push-notification message.
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
