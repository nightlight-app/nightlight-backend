import { ServiceAccount } from 'firebase-admin';

/**
 * Expiry duration of jobs in the queue
 */
export const GROUP_EXPIRY_DURATION = 1000 * 60 * 60 * 12; // 12 hours
export const REACTION_EXPIRY_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days

/**
 * Emoji reaction options
 */
export const REACTION_EMOJIS = ['🔥', '⚠️', '🛡', '💩', '🎉'];

/**
 * The necessary keys for a user object
 */
export const USER_KEYS = [
  'email',
  'firebaseUid',
  'firstName',
  'lastName',
  'phone',
  'isEmergency',
];

/**
 * All possible keys for a user object
 */
export const USER_KEYS_ALL = [
  '__v',
  '_id',
  'email',
  'firebaseUid',
  'firstName',
  'lastName',
  'phone',
  'isEmergency',
  'birthday',
  'friends',
  'friendRequests',
  'sentFriendRequests',
  'imgUrlCover',
  'imgUrlProfileLarge',
  'imgUrlProfileSmall',
  'invitedGroups',
  'lastActive',
  'savedGroups',
  'notificationToken',
  'currentGroup',
  'emergencyContacts',
  'sentPings',
  'receivedPings',
];

/**
 * The necessary keys for a group object
 */
export const GROUP_KEYS = [
  'name',
  'members',
  'invitedMembers',
  'creationDatetime',
  'expirationDatetime',
];

/**
 * All possible keys for a group object
 */
export const GROUP_KEYS_ALL = [
  '__v',
  '_id',
  'name',
  'members',
  'invitedMembers',
  'creationDatetime',
  'expirationDatetime',
  'expectedDestination',
];

/**
 * The necessary keys for a venue object
 */
export const VENUE_KEYS = ['name', 'address', 'location'];

/**
 * All possible keys for a venue object
 */
export const VENUE_KEYS_ALL = [
  '__v',
  '_id',
  'name',
  'address',
  'location',
  'reactions',
];

/**
 * The necessary keys for a notification object
 */
export const NOTIFICATION_KEYS = ['title', 'body', 'data'];

/**
 * All possible keys for a notification object
 */
export const NOTIFICATION_KEYS_ALL = [
  '__v',
  '_id',
  'userId',
  'userIds',
  'title',
  'body',
  'data',
  'delay',
];

/**
 * The necessary keys for a ping object
 */
export const PING_KEYS = [
  'senderId',
  'recipientId',
  'message',
  'expirationDatetime',
];

/**
 * All keys for a ping object
 */
export const PING_KEYS_ALL = [
  '__v',
  '_id',
  'senderId',
  'recipientId',
  'message',
  'sentDatetime',
  'expirationDatetime',
  'status',
];

/**
 * The necessary keys for an emergency contact object
 */
export const EMERGENCY_CONTACT_KEYS = ['name', 'phone'];

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
 * The Firebase admin configuration object, loaded from environment variables
 * @type {Object}
 * @keys `type`, `project_id`, `private_key_id`, `private_key`, `client_email`, `client_id`, `auth_uri`, `token_uri`, `auth_provider_x509_cert_url`, `client_x509_cert_url`
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
