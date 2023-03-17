import mongoose from 'mongoose';
import Notification from '../models/Notification.model';
import User from '../models/User.model';

/**
 * Sends notification to specified user(s) through expo and saves notification to database.
 * If userId is a string, sends notification to a single user. If it's an array of strings,
 * sends notification to all users in the array.
 *
 * This function is exception safe. If any of the required fields are missing, the function will return undefined.
 * If the userId is invalid, the function will return undefined. If a userId in the array is invalid, the function
 * will ignore that userId and continue to send notifications to the other valid userIds.
 *
 * @param {string | string[]} userId - The id or ids of the user(s) to receive the notification.
 * @param {string} title - The title of the notification.
 * @param {string} body - The content of the notification.
 * @param {any} data - Optional data to include with the notification.
 * @param {string} notificationType - The type of notification being sent.
 * @param {number} delay - The optional delay until the notification should be shown to the user. (set as 0 for now)
 *
 * @return {Promise<Notification | Notification[]>} - Returns a promise that resolves to a single notification or an array of notifications.
 */
export const sendNotifications = async (
  userId: string | string[],
  title: string,
  body: string,
  data: any,
  notificationType: string,
  delay: number
) => {
  // Exit function if userId is an empty string or an empty array (length === 0 works for both string and string[])
  if (userId.length === 0) {
    return;
  }

  // handle array of users
  if (Array.isArray(userId)) {
    // array of notifications to return
    let notifications = [] as any[];

    const promises = userId.map(async id => {
      // check if current user id is valid
      if (mongoose.Types.ObjectId.isValid(id)) {
        // add notification to database
        const notification = await sendNotificationToUser(
          id,
          title,
          body,
          data,
          notificationType,
          delay
        );

        // add notification to array of notifications to return
        notifications.push(notification);

        // find user for their notification token
        const user = await User.findById(id);

        // send notification to user through expo
        if (user?.notificationToken) {
          await sendNotificationToExpo(
            user.notificationToken,
            title,
            body,
            data
          );
        }
      }
    });

    // Javascript will not wait for promises to resolve in a for loop or mapping, so we must use Promise.all to wait for all resolutions
    await Promise.all(promises);

    // return array of notifications
    return notifications;

    // handle single user
  } else {
    // single notification to return
    let notification: any;

    // check if user id is valid
    if (mongoose.Types.ObjectId.isValid(userId)) {
      // add notification to database
      notification = await sendNotificationToUser(
        userId,
        title,
        body,
        data,
        notificationType,
        delay
      );

      // find user for notification token
      const user = await User.findById(userId);

      // send notification to user through expo
      if (user?.notificationToken) {
        await sendNotificationToExpo(user.notificationToken, title, body, data);
      }
    }

    // return single notification
    return notification;
  }
};

/**
 * Sends a push notification to the specified Expo push token with the given title, body, and data.
 *
 * Function is not exception safe and not to be used directly, instead use sendNotifications.
 * Expo is a trusted service. If the notification fails to send, it is likely due to an invalid token.
 * If the token is invalid, the notification will not be sent and no error will be thrown,
 * it will simply fail silently with the error logged.
 *
 * @param expoPushToken The push token of the device to receive the notification.
 * @param title The title of the notification.
 * @param body The body text of the notification.
 * @param data Any additional data to send along with the notification.
 * @throws {Error} - Throws an error if any of the required fields are missing.
 */
export const sendNotificationToExpo = async (
  expoPushToken: string,
  title: string,
  body: string,
  data: any
) => {
  // create notification object
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    // send notification to expo to be sent to device
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error: any) {
    console.log(error?.message);
  }
};

/**
 * Adds a new notification to the mongo database with provided information.
 *
 * This is a helper function. For adding a notification to a user, use sendNotifications instead.
 *
 * @param userId The ID of the user the notification is being sent to
 * @param title The title of the new notification.
 * @param body The body of the new notification.
 * @param data Any additional data to attach to the notification.
 * @param notificationType The type of the notification, e.g. "message", "alert", etc.
 * @param delay The amount of time to delay sending the notification (in milliseconds).
 * @throws {Error} - Throws an error if any of the required fields are missing.
 * @throws {Error} - Throws an error if the delay is less than 0.
 * @return The created Notification object.
 */
export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data: any,
  notificationType: string,
  delay: number
) => {
  // create new notification
  const newNotification = new Notification({
    userId: userId,
    title: title,
    body: body,
    data: data,
    notificationType: notificationType,
    delay: delay,
  });

  // save notification to database
  await newNotification.save();

  return newNotification;
};
