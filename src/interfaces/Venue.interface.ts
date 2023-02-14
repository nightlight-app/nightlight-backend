export interface Venue {
  _id?: string;
  name: string;
  address: string;
  reactions?: VenueReactionMap;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface VenueReactionQuery {
  emoji: string;
  count: number;
  didReact: boolean;
}

export interface VenueReactionMap {
  [key: string]: { count: number; didReact: boolean };
}
