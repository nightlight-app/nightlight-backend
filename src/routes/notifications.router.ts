import express from 'express';
import {
  deleteNotification,
  sendNotificationToUser,
} from '../controllers/notification.controller';

const notificationsRouter = express.Router();

/* Notifications Controller */
notificationsRouter.post('/', sendNotificationToUser);
notificationsRouter.delete(
  '/notifications/:notificationId',
  deleteNotification
);

export = notificationsRouter;
