import mongoose, { ObjectId } from 'mongoose';
import { Group } from '../interfaces/group';
import { Reaction } from '../interfaces/reaction';
import { User } from '../interfaces/user';
import { Venue } from '../interfaces/venue';

export const TEST_USER = {
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
  friends: [
    new mongoose.Types.ObjectId(46432),
    new mongoose.Types.ObjectId(6564),
  ],
  currentLocation: {
    latitude: 12.8758393,
    longitude: 95.7584833,
  },
} as User;

export const TEST_GROUP = {
  name: 'Our group',
  members: [
    new mongoose.Types.ObjectId(234),
    new mongoose.Types.ObjectId(65164),
  ],
  invitedMembers: [
    new mongoose.Types.ObjectId(5),
    new mongoose.Types.ObjectId(65264),
  ],
  creationTime: new Date(),
  expirationDate: new Date(),
  returnTime: new Date(),
} as Group;

export const TEST_VENUE = {
  name: 'The Last Bar',
  address: '123 Broadway, Just Broadway',
  location: {
    latitude: 12.2343234,
    longitude: 32.456543,
  },
} as Venue;

export const createTestReaction = (userId: string, venueId: string) => {
  return {
    userId,
    venueId,
    emoji: '🔥',
  } as Reaction;
};

export const createSecondTestReaction = (userId: string, venueId: string) => {
  return {
    userId,
    venueId,
    emoji: '🎉',
  } as Reaction;
};

export const USER_KEYS = [
  '__v',
  '_id',
  'birthday',
  'currentLocation',
  'email',
  'firebaseUid',
  'firstName',
  'friends',
  'imgUrlCover',
  'imgUrlProfileLarge',
  'imgUrlProfileSmall',
  'lastName',
  'phone',
];

export const GROUP_KEYS = [
  '__v',
  '_id',
  'name',
  'members',
  'invitedMembers',
  'creationTime',
  'expirationDate',
  'returnTime',
];

export const VENUE_KEYS_POST = ['__v', '_id', 'name', 'address', 'location'];

export const VENUE_KEYS_GET = [
  '__v',
  '_id',
  'name',
  'address',
  'location',
  'reactions',
];
