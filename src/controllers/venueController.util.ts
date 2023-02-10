export interface EmojiCount {
  emoji: string;
  count: number;
}

export const completeEmojiArray = (
  emojiCount: EmojiCount[],
  possibleEmojis: string[]
) => {
  const emojiCountMap = new Map<string, number>();
  emojiCount.forEach(({ emoji, count }) => {
    emojiCountMap.set(emoji, count);
  });

  const result = [] as EmojiCount[];
  possibleEmojis.forEach(emoji => {
    result.push({
      emoji,
      count: (emojiCountMap.has(emoji) ? emojiCountMap.get(emoji) : 0) || 0,
    });
  });

  return result;
};
