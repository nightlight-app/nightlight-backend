import {
  VenueReactionMap,
  VenueReactionQuery,
} from '../interfaces/Venue.interface';
import { EMOJIS } from './constants';

export const convertEmojiFormat = (emojiCount: VenueReactionQuery[]) => {
  return emojiCount.reduce(
    (result, emojiObj) => {
      result[emojiObj.emoji] = {
        count: emojiObj.count,
        didReact: emojiObj.didReact,
      };
      return result;
    },
    EMOJIS.reduce((acc, emoji) => {
      acc[emoji] = { count: 0, didReact: false };
      return acc;
    }, {} as VenueReactionMap)
  );
};
