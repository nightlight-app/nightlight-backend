import mongoose from 'mongoose';

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
}
