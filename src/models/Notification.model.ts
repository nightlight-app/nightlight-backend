import mongoose, { Schema } from 'mongoose';

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
  },
  data: {
    type: Object,
  },
  notificationType: {
    type: String,
    required: true,
  },
  delay: {
    type: Number,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
