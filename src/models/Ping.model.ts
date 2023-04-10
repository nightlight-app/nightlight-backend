import mongoose, { Schema } from 'mongoose';

const pingSchema = new mongoose.Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sentDateTime: {
    type: String,
    required: true,
  },
  expirationDatetime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  queueId: {
    type: String,
  },
});

const Ping = mongoose.model('Ping', pingSchema);

export default Ping;
