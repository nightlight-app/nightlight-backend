import mongoose from 'mongoose';
import Notification from '../models/Notification.model';
import User from '../models/User.model';

/**
 * Sends notification to specified user(s) through expo and saves notification to database.
 * If userId is a string, sends notification to a single user. If it's an array of strings,
 * sends notification to all users in the array.
 *
 * This function is not exception safe. Must be wrapped in a try/catch block.
 *
 * @param {string | string[]} userId - The id or ids of the user(s) to receive the notification.
 * @param {string} title - The title of the notification.
 * @param {string} body - The content of the notification.
 * @param {any} data - Optional data to include with the notification.
 * @param {string} notificationType - The type of notification being sent.
 * @param {number} delay - The optional delay until the notification should be shown to the user. (set as 0 for now)
 * @throws {Error} - Throws an error if the userId is not a valid mongoose ObjectId.
 * @throws {Error} - Throws an error if the user id is not found in the database.
 * @throws {Error} - Throws an error if the delay is less than 0.
 */
export const sendNotifications = async (
  userId: string | string[],
  title: string,
  body: string,
  data: any,
  notificationType: string,
  delay: number
) => {
  // handle array of users
  if (Array.isArray(userId)) {
    userId.forEach(async id => {
      // check if user id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid user id');
      }

      // add notification to database
      await addNotificationToUser(
        id,
        title,
        body,
        data,
        notificationType,
        delay
      );

      // find user for notification token
      const user = await User.findById(id);

      // send notification to user through expo
      if (user?.notificationToken) {
        await sendNotificationToExpo(user.notificationToken, title, body, data);
      }
    });

    // handle single user
  } else {
    // check if user id is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user id');
    }

    // add notification to database
    await addNotificationToUser(
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
};

/**
 * Sends a notification to the specified Expo push token with the given title, body, and data.
 *
 * Function is not exception safe and not to be used directly, instead use sendNotifications.
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
  if (!expoPushToken || !title || !body || !data) {
    throw new Error('Missing required fields to create notification.');
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
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
 * Function is not exception safe and not to be used directly, instead use sendNotifications.
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
export const addNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data: any,
  notificationType: string,
  delay: number
) => {
  if (
    !userId ||
    !title ||
    !body ||
    !notificationType ||
    delay === undefined ||
    !data
  ) {
    throw new Error('Missing required fields to create notification.');
  }

  if (delay < 0) {
    throw new Error('Delay must be a positive number.');
  }

  const newNotification = new Notification({
    userId: userId,
    title: title,
    body: body,
    data: data,
    notificationType: notificationType,
    delay: delay,
  });

  await newNotification.save();

  return newNotification;
};
