import { ObjectId } from 'mongodb';
import { Group } from '../interfaces/group';
import { User } from '../interfaces/user';

export const testUser = {
  firebaseUid: 'THISWORKEDOMG',
  imgUrlProfileSmall: 'www.smallProfileImage.com',
  imgUrlProfileLarge: 'www.largeProfileImage.com',
  imgUrlCover: 'www.coverImage.com',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@gmail.com',
  phone: '+11234567890',
  birthday: new Date(),
  currentGroup: undefined,
  friends: [new ObjectId(4), new ObjectId(6564)],
  currentLocation: {
    latitude: '12.8758393',
    longitude: '95.7584833',
  },
} as User;

export const testGroup = {
  name: 'Our group',
  members: [new ObjectId(234), new ObjectId(65164)],
  invitedMembers: [new ObjectId(5), new ObjectId(65264)],
  creationTime: new Date(),
  expirationDate: new Date(),
  returnTime: new Date(),
} as Group;
