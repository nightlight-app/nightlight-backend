import mongoose, { Schema } from 'mongoose';
import { EmergencyContact } from '../interfaces/User.interface';

/**
 * Represents the schema for a user in the database.
 * @typedef {Object} User
 *
 * @property {mongoose.Types.ObjectId} [_id] - The ID of the user.
 * @property {String} firebaseUid - The Firebase UID of the user, required.
 * @property {String} [notificationToken] - The token for push notifications associated with the user.
 * @property {String} [imgUrlProfileSmall] - The URL for the small profile image of the user.
 * @property {String} [imgUrlProfileLarge] - The URL for the large profile image of the user.
 * @property {String} [imgUrlCover] - The URL for the cover image of the user.
 * @property {String} firstName - The first name of the user, required.
 * @property {String} lastName - The last name of the user, required.
 * @property {String} email - The email address of the user, required.
 * @property {String} phone - The phone number of the user, required.
 * @property {Date} birthday - The date of birth of the user, required.
 * @property {[mongoose.Types.ObjectId]} [friends] - The IDs of the friends of the user.
 * @property {[mongoose.Types.ObjectId]} [friendRequests] - The IDs of the users who have sent friendship requests to the user.
 * @property {mongoose.Types.ObjectId} [currentGroup] - The ID of the current group the user is in.
 * @property {[mongoose.Types.ObjectId]} [invitedGroups] - The IDs of the groups the user has been invited to.
 * @property {LastActive} [lastActive] - Object containing the location of the user's last activity and the time of that activity.
 * @property {[SavedGroup]} [savedGroups] - The saved groups of the user.
 * @property {[EmergencyContact]} [emergencyContacts] - The emergency contacts of the user.
 */
const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
  },
  notificationToken: {
    type: String,
  },
  imgUrlProfileSmall: {
    type: String,
  },
  imgUrlProfileLarge: {
    type: String,
  },
  imgUrlCover: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  friendRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  currentGroup: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
  invitedGroups: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
  ],
  lastActive: {
    location: {
      latitude: Number,
      longitude: Number,
    },
    time: Date,
  },
  savedGroups: [
    {
      _id: Schema.Types.ObjectId,
      name: String,
      users: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
  ],
  emergencyContacts: [
    {
      name: String,
      phone: String,
    },
  ],
});

const User = mongoose.model('User', userSchema);

export default User;
