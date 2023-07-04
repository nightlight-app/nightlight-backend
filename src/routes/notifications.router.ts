import {
  addNotificationsToDatabase,
  deleteNotification,
  getNotifications,
} from '../controllers/notification.controller';
import express from 'express';

const notificationsRouter = express.Router();

/* Notifications Controller */
notificationsRouter.get('/', getNotifications);
notificationsRouter.post('/', addNotificationsToDatabase);
notificationsRouter.delete('/:notificationId', deleteNotification);

export = notificationsRouter;
