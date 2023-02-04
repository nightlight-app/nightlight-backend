import mongoose from 'mongoose';
import { Group } from './group';

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
  currentLocation: {
    latitude: string;
    longitude: string;
  };
}
