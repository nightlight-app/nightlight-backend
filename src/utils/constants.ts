import { ServiceAccount } from 'firebase-admin';

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
