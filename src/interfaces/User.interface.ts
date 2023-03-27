import mongoose from 'mongoose';
import { LastActive } from './LastActive.interface';
import { SavedGroup } from './SavedGroup.interface';

/**
 * An interface representing a user object and its properties.
 * @interface User
 *
 * @property {_id} mongoose.Types.ObjectId - Optional ID of the user.
 * @property {string} firebaseUid - Unique identifier generated by Firebase for the user.
 * @property {string} notificationToken - Token assigned by Expo to be used for sending notifications to the user.
 * @property {string} imgUrlProfileSmall - URL of small-sized user profile image.
 * @property {string} imgUrlProfileLarge - URL of large-sized user profile image.
 * @property {string} imgUrlCover - URL of user's cover image.
 * @property {string} firstName - First name of the user.
 * @property {string} lastName - Last name of the user.
 * @property {string} email - Email address of the user.
 * @property {number} phone - Phone number of the user. **Note:** Currently stored as a string.
 * @property {Date} birthday - Date of birth of the user.
 * @property {mongoose.Types.ObjectId} currentGroup - ID of the group that the user is currently in.
 * @property {mongoose.Types.ObjectId[]} invitedGroups - IDs of groups to which the user has been invited.
 * @property {mongoose.Types.ObjectId[]} friends - IDs of other users who the user added as friends.
 * @property {mongoose.Types.ObjectId[]} friendRequests - IDs of users who sent friend requests to the user.
 * @property {LastActive} lastActive - Location and time stamp of when the user was last active.
 * @property {SavedGroup[]} savedGroups - Array of saved groups that the user added.
 */
export interface User {
  _id?: mongoose.Types.ObjectId;
  firebaseUid: string;
  notificationToken?: string;
  imgUrlProfileSmall?: string;
  imgUrlProfileLarge?: string;
  imgUrlCover?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday?: Date;
  currentGroup?: mongoose.Types.ObjectId;
  invitedGroups?: mongoose.Types.ObjectId[];
  friends?: mongoose.Types.ObjectId[];
  friendRequests?: mongoose.Types.ObjectId[];
  lastActive?: LastActive;
  savedGroups?: SavedGroup[];
}
