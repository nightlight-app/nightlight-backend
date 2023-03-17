import { Request, Response } from 'express';
import { sendNotificationToUser } from '../utils/notification.utils';

/**
 * Creates and saves a new notification to the database for the specified user.
 * Does NOT send a notification via expo to a user's device.
 *
 * This endpoint is mainly for testing purposes and future admin purposes.
 *
 * @param {Request} req - Express request object containing the user data to be stored.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Promise} - a promise resolving to the newly created Notification document from the MongoDB database
 */
export const addNotificationToDatabase = async (
  req: Request,
  res: Response
) => {
  try {
    if (
      !req.body.userId ||
      !req.body.title ||
      !req.body.body ||
      !req.body.data ||
      !req.body.notificationType ||
      req.body.delay === undefined
    ) {
      return res.status(500).send({
        message: 'Missing required fields to create notification for database.',
      });
    }

    if (req.body.delay < 0) {
      return res
        .status(500)
        .send({ message: 'Delay must be a positive number.' });
    }

    if (Array.isArray(req.body.userId)) {
      req.body.userId.forEach(async (id: string) => {
        // add notification to database via utils function
        await sendNotificationToUser(
          id,
          req.body.title,
          req.body.body,
          req.body.data,
          req.body.notificationType,
          req.body.delay
        );
      });
    } else {
      // add notification to database via utils function
      await sendNotificationToUser(
        req.body.userId,
        req.body.title,
        req.body.body,
        req.body.data,
        req.body.notificationType,
        req.body.delay
      );
    }

    return res.status(201).send({
      message: 'Successfully created notification(s) in database!',
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
