const emojiMap: { [key: string]: string } = {
  '🔥': 'FIRE',
  '⚠️': 'CAUTION',
  '🛡': 'SHIELD',
  '💩': 'POOP',
  '🎉': 'PARTY',
};

export const mapEmoji = (inputWord: string) => {
  if (emojiMap.hasOwnProperty(inputWord)) {
    return emojiMap[inputWord];
  } else {
    const invertedMap = Object.fromEntries(
      Object.entries(emojiMap).map(([k, v]) => [v, k])
    );
    if (invertedMap.hasOwnProperty(inputWord)) {
      return invertedMap[inputWord];
    } else {
      return null;
    }
  }
};
