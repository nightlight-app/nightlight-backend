import { Schema } from 'mongoose';
import { User } from './user';

export interface Venue {
  _id?: string;
  name: string;
  address: string;
  location: {
    latitude: string;
    longitude: string;
  };
  reaction: {
    '🔥': User[];
    '⛨': User[];
    '🎉': User[];
    '⚠️': User[];
    '💩': User[];
  };
}
