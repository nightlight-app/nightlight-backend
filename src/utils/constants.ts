import { ServiceAccount } from 'firebase-admin';
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

/**
 * The Firebase admin configuration object.
 * @type {Object}
 * @property {string} type - The Firebase project's type.
 * @property {string} project_id - The Firebase project ID.
 * @property {string} private_key_id - The Firebase project's private key ID.
 * @property {string} private_key - The Firebase project's private key.
 * @property {string} client_email - The Firebase client email address.
 * @property {string} client_id - The Firebase client ID.
 * @property {string} auth_uri - The Firebase authorization URI.
 * @property {string} token_uri - The Firebase token URI.
 * @property {string} auth_provider_x509_cert_url - The Firebase auth provider's X.509 certificate URL.
 * @property {string} client_x509_cert_url - The Firebase client's X.509 certificate URL.
 */
export const FIREBASE_ADMIN_CONFIG = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
} as ServiceAccount;
