// emoji reaction options
export const REACTION_EMOJIS = ['🔥', '⚠️', '🛡', '💩', '🎉'];

// the name of the queue
export const NIGHTLIGHT_QUEUE = 'nightlight-queue';
// maximum file size for image upload in bytes
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
