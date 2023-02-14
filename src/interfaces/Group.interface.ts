import { User } from './User.interface';

export interface Group {
  _id?: string;
  name: string;
  members: any[];
  invitedMembers: any[];
  creationTime: Date;
  expirationDate: Date;
  expectedDestination?: {
    latitude: number;
    longitude: number;
  };
  returnTime: Date;
}
