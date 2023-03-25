import mongoose from 'mongoose';
import { Emoji } from '../utils/venue.utils';

/**
 * An interface representing a venue object with an optional id, the name of the venue, its address, any reactions to it, and its associated location.
 * @interface Venue
 *
 * @property {string} [_id] - The optional id of the venue object.
 * @property {string} name - The name of the venue.
 * @property {string} address - The address of the venue.
 * @property {VenueReactionMap[]} [reactions] - The array of VenueReactionMaps that represent reactions to the venue.
 * @property {Object} location - The latitude and longitude coordinates of the venue.
 * @property {number} location.latitude - The latitude coordinate of the venue.
 * @property {number} location.longitude - The longitude coordinate of the venue.
 */
export interface Venue {
  _id?: string;
  name: string;
  address: string;
  reactions?: VenueReactionMap[];
  location: {
    latitude: number;
    longitude: number;
  };
}

/**
 * An interface representing a reaction object related to a venue nested within the Venue object.
 * @interface VenueReaction
 *
 * @property {string} emoji - The emoji the user reacted with.
 * @property {mongoose.Types.ObjectId} userId - The id of the user who reacted to the venue.
 * @property {string} queueId - The id of the queue from which the user reacted to the venue.
 */
export interface VenueReaction {
  emoji: Emoji;
  userId: mongoose.Types.ObjectId;
  queueId: string;
}

/**
 * A formatted response after a mongo query, which maps each unique emoji to an array of VenueReaction objects containing info about those reactions for display.
 * @interface VenueReactionMap
 *
 * @property {string} [emoji] - The emoji users reacted with.
 * @property {VenueReaction[]}[] [array] - An array of VenueReaction objects containing information about the users' reactions to the venue, including their ids and the queue from which the reaction originated.
 */
export interface VenueReactionMap {
  [emoji: string]: { count: number; didReact: boolean };
}
