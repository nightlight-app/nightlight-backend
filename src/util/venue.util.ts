import { EMOJIS } from './constants';

export interface EmojiCount {
  emoji: string;
  count: number;
}

export const fillEmojiCount = (emojiCount: EmojiCount[]) => {
  const result = [] as EmojiCount[];
  EMOJIS.forEach(emoji => {
    result.push({
      emoji,
      count:
        (emojiCount.find(pair => pair.emoji == emoji)
          ? emojiCount.filter(pair => pair.emoji == emoji)[0].count
          : 0) || 0,
    });
  });

  return result;
};
