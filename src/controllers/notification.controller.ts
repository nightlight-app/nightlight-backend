import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendNotificationToUser } from '../utils/notification.utils';
import Notification from '../models/Notification.model';
import { MongoNotification } from '../interfaces/Notification.interface';
import { KeyValidationType, verifyKeys } from '../utils/validation.utils';

/**
 * Retrieves all notifications for a given user.
 * @param {Request} req - Express Request object containing query parameters.
 * @param {Response} res - Express Response object containing status and message.
 * @returns {Promise<Notification[]>} HTTP response indicating success and found notifications.
 */
export const getNotifications = async (req: Request, res: Response) => {
  // get userId from query parameters
  const userId = req.query.userId as string;

  // check if userId is present
  if (!userId) {
    return res.status(400).send({ message: 'Missing userId query parameter.' });
  }

  try {
    // find all notifications for the given user
    const notifications = await Notification.find({ userId: userId });

    // return found notifications
    return res.status(200).send({
      message: 'Found notifications for user!',
      notifications: notifications,
    });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Creates and saves a new notification to the database for the specified user.
 * Does NOT send a notification via expo to a user's device.
 *
 * This endpoint is mainly for future admin purposes.
 *
 * @param {Request} req - Express request object containing the user data to be stored.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Promise} - a promise resolving to the newly created Notification document from the MongoDB database
 */
export const addNotificationsToDatabase = async (req: Request, res: Response) => {
  // check if all required fields are present
  const notification = req.body;

  // check if a notification object is present
  if (!notification) {
    return res.status(400).send({ message: 'Missing notification object.' });
  }

  // check if all required fields are present
  const validationError = verifyKeys(
    notification,
    KeyValidationType.NOTIFICATIONS
  );
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  // check if delay is a positive number
  if (req.body.delay < 0) {
    return res.status(500).send({ message: 'Delay must be a positive number.' });
  }

  try {
    // Javascript will not wait for promises to resolve in a for loop or mapping, so we must collect all the promises
    const promises = notification.userIds.map(async (id: string) => {
      // check if current user id is valid
      if (mongoose.Types.ObjectId.isValid(id)) {
        // add notification to database via utils function
        await sendNotificationToUser({
          userId: id,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          delay: notification.delay,
        } as MongoNotification);
      }
    });

    // wait for all promises to resolve
    await Promise.all(promises);

    // return success message
    return res.status(201).send({
      message: 'Successfully created notification(s) in database!',
    });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Deletes a notification by its ID.
 * @async
 * @function deleteNotification
 * @param {Request} req - The request object containing the notification ID.
 * @param {Response} res - The response object used to send the result of the operation.
 * @returns {Promise<Notification>} - The promise that resolves after successful deletion. Returns the deleted notification.
 */
export const deleteNotification = async (req: Request, res: Response) => {
  // get notification id from request
  const notificationId = req.params.notificationId as string;

  // check if notification id is present
  if (!notificationId) {
    return res.status(400).send({ message: 'Missing notification id.' });
  }

  // check if notification id is valid
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return res.status(400).send({ message: 'Invalid notification id.' });
  }

  try {
    // delete notification from database
    const targetNotification = await Notification.findByIdAndRemove(
      notificationId
    );

    // check if notification was found and return error if not
    if (!targetNotification) {
      return res.status(404).send({ message: 'Notification not found.' });
    }

    // return deleted notification
    return res.status(200).send({
      message: 'Notification deleted.',
      notification: targetNotification,
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
};
