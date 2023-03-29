import mongoose, { Schema } from 'mongoose';

/**
 * Defines a mongoose schema for a group.
 * @typedef {Object} GroupSchema
 *
 * @property {string} name - The name of the group, required.
 * @property {Array<mongoose.Types.ObjectId>} members - An array of user ids who are part of the group, required.
 * @property {Array<mongoose.Types.ObjectId>} invitedMembers - An array of user ids who are invited to join the group, required.
 * @property {Object} expectedDestination - Expected latitude and longitude of the destination.
 * @property {number} expectedDestination.latitude - Latitude of the expected destination.
 * @property {number} expectedDestination.longitude - Longitude of the expected destination.
 * @property {Date} creationDatetime - Date when the group is created, required.
 * @property {Date} expirationDatetime - Date when the group will expire, required.
 */
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  invitedMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  expectedDestination: {
    latitude: Number,
    longitude: Number,
  },
  creationDatetime: {
    type: Date,
    required: true,
  },
  expirationDatetime: {
    type: Date,
    required: true,
  },
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
