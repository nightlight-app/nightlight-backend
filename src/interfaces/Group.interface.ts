import mongoose from 'mongoose';
import { User } from './User.interface';

export interface Group {
  _id?: string;
  name: string;
  members: mongoose.Types.ObjectId[];
  invitedMembers: mongoose.Types.ObjectId[];
  creationTime: Date;
  expirationDate: Date;
  expectedDestination?: {
    latitude: number;
    longitude: number;
  };
  returnTime: Date;
}
