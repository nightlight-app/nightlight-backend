import mongoose, { Schema } from 'mongoose';

/**
 * Represents the schema for a ping in the database.
 * @typedef {Object} Ping
 *
 * @property {string} senderId - The id of the user who sent the ping.
 * @property {string} recipientId - The id of the user who received the ping.
 * @property {string} message - The message of the ping.
 * @property {string} sentDateTime - The date and time the ping was sent.
 * @property {string} expirationDatetime - The date and time the ping expires.
 * @property {string} status - The status of the ping.
 * @property {string} queueId - The id of the queue the ping is in.
 */
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
