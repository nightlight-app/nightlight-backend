import { Group } from '../interfaces/Group.interface';
import { MongoNotification } from '../interfaces/Notification.interface';
import { User } from '../interfaces/User.interface';
import { Venue } from '../interfaces/Venue.interface';

/**
 * Emoji reaction options
 */
export const REACTION_EMOJIS = ['🔥', '⚠️', '🛡', '💩', '🎉'];

/**
 * The necessary keys for a user object
 */
export const USER_KEYS = [
  '__v',
  '_id',
  'birthday',
  'email',
  'firebaseUid',
  'firstName',
  'lastName',
  'phone',
];

/**
 * The necessary keys for a group object
 */
export const GROUP_KEYS = [
  '__v',
  '_id',
  'name',
  'members',
  'invitedMembers',
  'creationDatetime',
  'expirationDatetime',
];

/**
 * The necessary keys for a venue object
 */
export const VENUE_KEYS = ['__v', '_id', 'name', 'address', 'location'];

/**
 * The necessary keys for a notification object
 */
export const NOTIFICATION_KEYS = [
  '__v',
  '_id',
  'userId',
  'title',
  'body',
  'data',
];

/**
 * The name of the queue
 */
export const NIGHTLIGHT_QUEUE = 'nightlight-queue';

/**
 * Maximum file size for image upload in bytes
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * The options to iterate through when uploading images
 *
 * @property width: the width of the image
 * @property height: the height of the image
 * @property dimension: the dimension of the image appended to the filename
 * @property userField: the field in the user model to update with the image url
 */
export const IMAGE_UPLOAD_OPTIONS = [
  {
    width: 128,
    height: 128,
    dimension: '128x128',
    userField: 'imgUrlProfileSmall',
  },
  {
    width: 256,
    height: 256,
    dimension: '256x256',
    userField: 'imgUrlProfileLarge',
  },
];

/**
 * @enum NotificationType
 * Defines the types of notification available
 *
 * @property friendRequest - When a user receives a friend request
 * @property friendRequestAccepted - When a user's friend request is accepted by the other user
 * @property friendRequestDeclined - When a user's friend request is declined by the other user
 * @property groupInvite - When a user is invited to a new group
 * @property groupInviteAccepted - When a user accepts an invitation to join a group
 * @property groupInviteDeclined - WHen a user declines an invitation to join a group
 */
export enum NotificationType {
  friendRequest = 'friendRequest',
  friendRequestAccepted = 'friendRequestAccepted',
  friendRequestDeclined = 'friendRequestDeclined',
  groupInvite = 'groupInvite',
  groupInviteAccepted = 'groupInviteAccepted',
  groupInviteDeclined = 'groupInviteDeclined',
}
