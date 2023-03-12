export const REACTION_EMOJIS = ['🔥', '⚠️', '🛡', '💩', '🎉'];

// the name of the queue
export const NIGHTLIGHT_QUEUE = 'nightlight-queue';
// maximum file size for image upload in bytes
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * The options to iterate through when uploading images
 *
 * width: the width of the image
 * height: the height of the image
 * dimension: the dimension of the image appended to the filename
 * userField: the field in the user model to update with the image url
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
