import mongoose from 'mongoose';
import {
  ExpoNotification,
  MongoNotification,
} from '../interfaces/Notification.interface';
import Notification from '../models/Notification.model';
import User from '../models/User.model';

/**
 * Sends notification to specified user(s) through expo and saves notification to database.
 * If userId is a string, sends notification to a single user. If it's an array of strings,
 * sends notification to all users in the array.
 *
 * If the userIds field is an empty array, the function will return an empty array.
 * If the userId is invalid, the function will return undefined. If a userId in the array is invalid, the function
 * will ignore that userId and continue to send notifications to the other valid userIds.
 *
 * @param {string[]} userIds - The id or ids of the user(s) to receive the notification.
 * @param {string} title - The title of the notification.
 * @param {string} body - The content of the notification.
 * @param {string} notificationType - The type of notification being sent.
 * @param {number} delay - Optional delay until the notification should be shown to the user. (set as 0 for now)
 * @param {Object} data - Optional data to include with the notification.
 *
 * @return {Promise<Notification[]>} - Returns a promise that resolves to an array of notifications.
 */
export const sendNotifications = async (
  userIds: string[],
  title: string,
  body: string,
  notificationType: string,
  data: Object = {},
  delay: number = 0
) => {
  // array of notifications to return
  let notifications: any[] = [];

  // Exit function if userId is an empty array
  if (userIds.length === 0) {
    return notifications;
  }

  // Javascript will not wait for promises to resolve in a for loop or mapping, so we must collect all the promises
  const promises = userIds.map(async id => {
    // check if current user id is valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      // add notification to database
      const notification = await sendNotificationToUser({
        userId: id,
        title,
        body,
        data,
        notificationType,
        delay,
      } as MongoNotification);

      // add notification to array of notifications to return
      notifications.push(notification);

      // find user for their notification token
      const user = await User.findById(id);

      // send notification to user through expo
      if (user?.notificationToken) {
        await sendNotificationToExpo({
          to: user.notificationToken,
          title,
          body,
          data,
          sound: 'default',
        });
      }
    }
  });

  // Wait for all promise resolutions
  await Promise.all(promises);

  // return array of notifications
  return notifications;
};

/**
 * Sends a push notification to the specified Expo push token with the given title, body, and data.
 *
 * This is a helper function. Function is not exception safe and not to be used directly, instead use sendNotifications.
 * Expo is a trusted service. If the notification fails to send, it is likely due to an invalid token.
 * If the token is invalid, the notification will not be sent and no error will be thrown,
 * it will simply fail silently with the error logged.
 *
 * @param expoPushToken The push token of the device to receive the notification.
 * @param title The title of the notification.
 * @param body The body text of the notification.
 * @param data Optional additional data to send along with the notification.
 */
export const sendNotificationToExpo = async (
  notification: ExpoNotification
) => {
  try {
    // send notification to expo to be sent to device
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });
  } catch (error: any) {
    console.log(error?.message);
  }
};

/**
 * Adds a new notification to the mongo database with provided information.
 *
 * This is a helper function. For adding a notification to a user, use sendNotifications instead.
 * Assumes the userId is valid. Must be checked before using this function.
 *
 * @param userId The ID of the user the notification is being sent to
 * @param title The title of the new notification.
 * @param body The body of the new notification.
 * @param data Any additional data to attach to the notification.
 * @param notificationType The type of the notification, e.g. "message", "alert", etc.
 * @param delay The amount of time to delay sending the notification (in milliseconds).
 * @return The created Notification object or undefined.
 */
export const sendNotificationToUser = async (
  notification: MongoNotification
) => {
  // create new notification
  const newNotification = new Notification(notification);

  // save notification to database
  await newNotification.save();

  return newNotification;
};