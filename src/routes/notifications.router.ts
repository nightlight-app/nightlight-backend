import express from 'express';
import {
  addNotificationToDatabase,
  deleteNotification,
} from '../controllers/notification.controller';

const notificationsRouter = express.Router();

/* Notifications Controller */
notificationsRouter.post('/', addNotificationToDatabase);
notificationsRouter.delete(
  '/notifications/:notificationId',
  deleteNotification
);

export = notificationsRouter;
