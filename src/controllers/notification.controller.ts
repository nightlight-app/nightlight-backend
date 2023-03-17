import { Request, Response } from 'express';
import { addNotificationToUser } from '../utils/notifications.utils';

/**
 * Creates and saves a new notification to the database for the specified user
 *
 * This endpoint is mainly for testing purposes. It is not used in the app.
 *
 * @param {Request} req - Express request object containing the user data to be stored.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Promise} - a promise resolving to the newly created Notification document from the MongoDB database
 */
export const sendNotificationToUser = async (req: Request, res: Response) => {
  try {
    const newNotification = await addNotificationToUser(
      req.body.userId,
      req.body.title,
      req.body.body,
      req.body.data,
      req.body.notificationType,
      req.body.delay
    );

    return res.status(201).send({
      message: 'Successfully created notification in database!',
      notification: newNotification,
    });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
