import mongoose from 'mongoose';
import { LastActive } from './LastActive.interface';
import { SavedGroup } from './SavedGroup.interface';

export interface User {
  _id?: mongoose.Types.ObjectId;
  firebaseUid: string;
  imgUrlProfileSmall?: string;
  imgUrlProfileLarge?: string;
  imgUrlCover?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday?: Date;
  currentGroup?: mongoose.Types.ObjectId;
  invitedGroups?: mongoose.Types.ObjectId[];
  friends?: mongoose.Types.ObjectId[];
  friendRequests?: mongoose.Types.ObjectId[];
  lastActive?: LastActive;
  savedGroups?: SavedGroup[];
}
