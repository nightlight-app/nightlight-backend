import mongoose, { Schema } from 'mongoose';

/**
 * Notification schema
 * @typedef NotificationSchema
 *
 * @type {object}
 * @property {mongoose.Types.ObjectId} userId - User id associated with the notification.
 * @property {string} title - The title of the notification.
 * @property {string} body - The body of the notification.
 * @property {Object} data - Additional data to be sent with the notification.
 * @property {number} delay - Delay in displaying the notification.
 */
const notificationSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  delay: {
    type: Number,
    required: true,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
