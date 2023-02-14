import mongoose from 'mongoose';
import { Group } from '../interfaces/Group.interface';
import { LastActive } from '../interfaces/LastActive.interface';
import { Reaction } from '../interfaces/Reaction.interface';
import { SavedGroup } from '../interfaces/SavedGroup.interface';
import { User } from '../interfaces/User.interface';
import { Venue, VenueReactionQuery } from '../interfaces/Venue.interface';
import { EMOJIS } from '../utils/constants';

/* User 1 */
const TEST_LAST_ACTIVE_1: LastActive = {
  location: {
    latitude: 12.8758393,
    longitude: 95.7584833,
  },
  time: new Date(),
} as LastActive;

const TEST_SAVED_GROUP_1: SavedGroup = {
  name: 'My new group!',
  users: [
    new mongoose.Types.ObjectId(233456),
    new mongoose.Types.ObjectId(345675),
  ],
};

const TEST_SAVED_GROUP_2: SavedGroup = {
  name: 'My side friend group',
  users: [
    new mongoose.Types.ObjectId(2456),
    new mongoose.Types.ObjectId(34675),
  ],
};

export const TEST_USER_1: User = {
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
  lastActive: TEST_LAST_ACTIVE_1,
  savedGroups: [TEST_SAVED_GROUP_1, TEST_SAVED_GROUP_2],
};

export const UPDATE_USER_1_TO_USER_2: any = {
  firstName: 'Tom',
  lastName: 'Updated',
  email: 't-dawg@gmail.com',
  phone: '+16314959610',
};

/* User 2 */
const TEST_LAST_ACTIVE_2: LastActive = {
  location: {
    latitude: 42.8758393,
    longitude: 35.7584833,
  },
  time: new Date(),
} as LastActive;

const TEST_SAVED_GROUP_3: SavedGroup = {
  name: 'A cool friend group!',
  users: [
    new mongoose.Types.ObjectId(2234566),
    new mongoose.Types.ObjectId(987475),
  ],
};

const TEST_SAVED_GROUP_4: SavedGroup = {
  name: 'A not-so-cool friend group',
  users: [
    new mongoose.Types.ObjectId(2098765),
    new mongoose.Types.ObjectId(346925),
  ],
};

export const TEST_USER_2: User = {
  firebaseUid: 'FAKEUSERID',
  imgUrlProfileSmall: 'www.smallProfileImage.com',
  imgUrlProfileLarge: 'www.largeProfileImage.com',
  imgUrlCover: 'www.coverImage.com',
  firstName: 'Graham',
  lastName: 'Hemingway',
  email: 'john.doe@gmail.com',
  phone: '+11234567890',
  birthday: new Date(),
  currentGroup: undefined,
  friends: [
    new mongoose.Types.ObjectId(987654),
    new mongoose.Types.ObjectId(16724),
  ],
  lastActive: TEST_LAST_ACTIVE_2,
  savedGroups: [TEST_SAVED_GROUP_3, TEST_SAVED_GROUP_4],
};

/* Groups */
export const TEST_GROUP: Group = {
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
};

/* Venues */
export const TEST_VENUE: Venue = {
  name: 'The Last Bar',
  address: '123 Broadway, Just Broadway',
  location: {
    latitude: 12.2343234,
    longitude: 32.456543,
  },
};

/* Reactions */
export const createTestReaction = (userId: string, venueId: string) => {
  return {
    userId: new mongoose.Types.ObjectId(userId),
    venueId: new mongoose.Types.ObjectId(venueId),
    emoji: '🔥',
  } as Reaction;
};

export const createSecondTestReaction = (userId: string, venueId: string) => {
  return {
    userId: new mongoose.Types.ObjectId(userId),
    venueId: new mongoose.Types.ObjectId(venueId),
    emoji: '🎉',
  } as Reaction;
};

/* UTIL: fillEmojiCount */
export const PARTIAL_EMOJI_COUNT_1: VenueReactionQuery[] = [
  { emoji: EMOJIS[0], count: 45, didReact: false },
];

export const PARTIAL_EMOJI_COUNT_2: VenueReactionQuery[] = [
  { emoji: EMOJIS[2], count: 45, didReact: false },
  { emoji: EMOJIS[4], count: 45, didReact: false },
  { emoji: EMOJIS[0], count: 45, didReact: false },
  { emoji: EMOJIS[3], count: 45, didReact: false },
];

export const PARTIAL_EMOJI_COUNT_3: VenueReactionQuery[] = [
  { emoji: EMOJIS[0], count: 45, didReact: false },
  { emoji: EMOJIS[1], count: 45, didReact: false },
  { emoji: EMOJIS[3], count: 45, didReact: false },
  { emoji: EMOJIS[2], count: 45, didReact: false },
  { emoji: EMOJIS[4], count: 45, didReact: false },
];

/* KEYS FOR TESTING */
export const USER_KEYS = [
  '__v',
  '_id',
  'birthday',
  'email',
  'firebaseUid',
  'firstName',
  'friends',
  'imgUrlCover',
  'imgUrlProfileLarge',
  'imgUrlProfileSmall',
  'lastName',
  'phone',
  'lastActive',
  'savedGroups',
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

export const VENUE_KEYS_EMOJIS = [...EMOJIS];
