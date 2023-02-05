import { Schema } from 'mongoose';
import { User } from './user';

export interface Venue {
  _id?: string;
  name: string;
  address: string;
  reactions: {
    '🔥': number;
    '🛡️': number;
    '🎉': number;
    '⚠️': number;
    '💩': number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}
