import { EMOJIS } from './constants';

export interface EmojiCount {
  emoji: string;
  count: number;
}

export const fillEmojiCount = (rawAggregate: EmojiCount[]) => ({
  ...EMOJIS.reduce((acc, emoji) => ({ ...acc, [emoji]: 0 }), {}),
  ...rawAggregate.reduce(
    (acc, { count, emoji }) => ({ ...acc, [emoji]: count }),
    {}
  ),
});
