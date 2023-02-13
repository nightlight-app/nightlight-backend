import { LastActive } from './lastActive';
import { SavedGroup } from './savedGroup';

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
  currentGroup?: any;
  friends: any[];
  lastActive?: LastActive;
  savedGroups: SavedGroup[];
}
