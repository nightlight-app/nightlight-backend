const encodeEmojiMap: { [key: string]: string } = {
  FIRE: '🔥',
  CAUTION: '⚠️',
  SHIELD: '🛡',
  POOP: '💩',
  PARTY: '🎉',
};

const decodeEmojiMap: { [key: string]: string } = {
  '🔥': 'FIRE',
  '⚠️': 'CAUTION',
  '🛡': 'SHIELD',
  '💩': 'POOP',
  '🎉': 'PARTY',
};

/* Convert text to emoji */
export const encodeEmoji = (inputWord: string) => {
  if (encodeEmojiMap.hasOwnProperty(inputWord)) {
    return encodeEmojiMap[inputWord];
  } else {
    return null;
  }
};

/* Convert emoji to text */
export const decodeEmoji = (inputWord: string) => {
  if (decodeEmojiMap.hasOwnProperty(inputWord)) {
    return decodeEmojiMap[inputWord];
  } else {
    return null;
  }
};
