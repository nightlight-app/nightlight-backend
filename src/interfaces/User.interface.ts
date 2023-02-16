import mongoose from 'mongoose';
import { LastActive } from './LastActive.interface';
import { SavedGroup } from './SavedGroup.interface';

export interface User {
  _id?: string;
  firebaseUid: string;
  imgUrlProfileSmall: string;
  imgUrlProfileLarge: string;
  imgUrlCover: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: Date;
  currentGroup: mongoose.Types.ObjectId | undefined;
  friends: mongoose.Types.ObjectId[];
  lastActive?: LastActive;
  savedGroups: SavedGroup[];
}
