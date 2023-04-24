import mongoose from 'mongoose';
import {
  ExpoNotification,
  MongoNotification,
  NotificationDocument,
  NotificationSpecificData,
} from '../interfaces/Notification.interface';
import Notification from '../models/Notification.model';
import User from '../models/User.model';
import axios from 'axios';

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
 * @param {number} delay - Optional delay until the notification should be shown to the user. (set as 0 for now)
 * @param {NotificationData} data - Optional data to include with the notification.
 *
 * @return {Promise<Notification[]>} - Returns a promise that resolves to an array of notifications.
 */
export const sendNotifications = async (
  userIds: string[],
  title: string,
  body: string,
  data: NotificationSpecificData,
  isPush: boolean,
  delay: number = 0
) => {
  // array of notifications to return
  let notifications: NotificationDocument[] = [];
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
        delay,
      } as MongoNotification);

      // add notification to array of notifications to return if it was successfully added to database
      if (notification) notifications.push(notification);

      // find user for their notification token
      const user = await User.findById(id);

      // send notification to user through expo if they have a notification token and if isPush is true (is a push notification)
      if (isPush && user?.notificationToken) {
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
 * This is a helper function. It is not to be used directly, instead use sendNotifications.
 * Expo is a trusted service. If the notification fails to send, it is likely due to an invalid token.
 * If the token is invalid, the notification will not be sent and no error will be thrown,
 * it will simply fail silently with the error logged.
 *
 * Params are the same as the ExpoNotification interface.
 * @param expoPushToken The push token of the device to receive the notification.
 * @param title The title of the notification.
 * @param body The body text of the notification.
 * @param data Optional additional data to send along with the notification.
 */
export const sendNotificationToExpo = async (notification: ExpoNotification) => {
  try {
    // send notification to expo to be sent to device
    await axios.post(
      'https://exp.host/--/api/v2/push/send',
      { ...notification },
      {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.log(JSON.stringify(error));
  }
};

/**
 * Adds a new notification to the mongo database with provided information.
 *
 * This is a helper function. For adding a notification to a user, use sendNotifications instead.
 * Assumes the userId is valid. Must be checked before using this function.
 *
 * If the notification fails to save to the database, it will return undefined.
 * If any other errors occurs, it will be silently logged and undefined will be returned.
 *
 * Params are the same as the MongoNotification interface.
 * @param userId The ID of the user the notification is being sent to
 * @param title The title of the new notification.
 * @param body The body of the new notification.
 * @param data Any additional data to attach to the notification.
 * @param delay The amount of time to delay sending the notification (in milliseconds).
 * @return The created Notification object or undefined.
 */
export const sendNotificationToUser = async (notification: MongoNotification) => {
  try {
    // create new notification
    const newNotification = new Notification(notification);

    // save notification to database
    await newNotification.save();

    return newNotification;
  } catch (error: any) {
    console.log(error?.message);
    return undefined;
  }
};
