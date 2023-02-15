import mongoose from 'mongoose';

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

// Object stored in mongo nested in the Venue object
export interface VenueReaction {
  emoji: string;
  userId: mongoose.Types.ObjectId;
}

// formatted response after mongo query
export interface VenueReactionMap {
  [emoji: string]: { count: number; didReact: boolean };
}
