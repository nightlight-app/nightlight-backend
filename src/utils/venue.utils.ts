/* eslint-disable no-prototype-builtins */
// Type for the emoji reaction options
export type Emoji = '🔥' | '⚠️' | '🛡' | '💩' | '🎉';

/**
 * Array of emoji reactions {text: emoji}
 */
const encodeEmojiMap: { [key: string]: string } = {
  FIRE: '🔥',
  CAUTION: '⚠️',
  SHIELD: '🛡',
  POOP: '💩',
  PARTY: '🎉',
};

/**
 * Inverse of the array of emoji reactions {emoji: text}
 */
const decodeEmojiMap: { [key: string]: string } = {
  '🔥': 'FIRE',
  '⚠️': 'CAUTION',
  '🛡': 'SHIELD',
  '💩': 'POOP',
  '🎉': 'PARTY',
};

/**
 * Convert text to emoji (don't use hasOwnProperty because it's a string)
 * @param inputWord the text to convert
 * @returns emoji as a string or null if the inputWord is not in the map
 */
export const encodeEmoji = (inputWord: string) => {
  if (encodeEmojiMap.hasOwnProperty(inputWord)) {
    return encodeEmojiMap[inputWord] as Emoji;
  } else {
    return null;
  }
};

/**
 * Convert string emoji to text
 * @param inputEmoji the emoji to convert
 * @returns text as a string or null if the inputEmoji is not in the map
 */
export const decodeEmoji = (inputEmoji: string) => {
  if (decodeEmojiMap.hasOwnProperty(inputEmoji)) {
    return decodeEmojiMap[inputEmoji] as Emoji;
  } else {
    return null;
  }
};
