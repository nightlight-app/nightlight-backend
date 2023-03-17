import express from 'express';
import {
  addNotificationsToDatabase,
  deleteNotification,
  getNotifications,
} from '../controllers/notification.controller';

const notificationsRouter = express.Router();

/* Notifications Controller */
notificationsRouter.get('/', getNotifications);
notificationsRouter.post('/', addNotificationsToDatabase);
notificationsRouter.delete(
  '/notifications/:notificationId',
  deleteNotification
);

export = notificationsRouter;
