import { EMOJIS } from './constants';

export interface EmojiCount {
  emoji: string;
  count: number;
}

export const fillEmojiCount = (partialEmojiCount: EmojiCount[]) => {
  let emojiCount = EMOJIS.reduce((acc, emoji) => ({ ...acc, [emoji]: 0 }), {});
  emojiCount = { ...emojiCount, ...partialEmojiCount };
  return emojiCount;
};
