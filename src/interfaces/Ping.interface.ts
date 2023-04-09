import mongoose from 'mongoose';

/**
 * Defines the interface for a Ping message between two users.
 * @interface Ping
 *
 * @property {_id?: mongoose.Types.ObjectId} [optional] - The unique identifier of the Ping message.
 * @property {mongoose.Types.ObjectId} senderId - The unique identifier of the user sending the Ping message.
 * @property {mongoose.Types.ObjectId} recipientId - The unique identifier of the user receiving the Ping message.
 * @property {string} message - The content of the Ping message.
 * @property {string} sentDateTime - The date and time the Ping message was sent.
 * @property {string} expirationDateTime - The date and time the Ping message will expire.
 */
export interface Ping extends PostPingData {
  _id?: mongoose.Types.ObjectId;
  sentDateTime: string;
  status: string;
}

/**
 * Defines the interface for the data for sending a post request to create a new Ping message.
 * @interface PostPingData
 *
 * @property {mongoose.Types.ObjectId} senderId - The unique identifier of the user sending the Ping message.
 * @property {mongoose.Types.ObjectId} recipientId - The unique identifier of the user receiving the Ping message.
 * @property {string} message - The content of the Ping message.
 * @property {string} expirationDateTime - The date and time the Ping message will expire.
 */
export interface PostPingData {
  senderId: string;
  recipientId: string;
  message: string;
  expirationDateTime: string;
}
