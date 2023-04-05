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
 * @property {String} creationDatetime - Date (in UTC) when the group is created, required.
 * @property {String} expirationDatetime - Date (in UTC) when the group will expire, required.
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
    type: String,
    required: true,
  },
  expirationDatetime: {
    type: String,
    required: true,
  },
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
