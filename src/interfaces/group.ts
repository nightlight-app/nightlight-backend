import { User } from './user';

export interface Group {
  _id?: string;
  name: string;
  members: any[];
  invitedMembers: any[];
  creationTime: Date;
  expirationDate: Date;
  returnTime: Date;
}
