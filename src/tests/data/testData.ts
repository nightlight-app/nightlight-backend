import mongoose from 'mongoose';
import { Group } from '../../interfaces/Group.interface';
import { LastActive } from '../../interfaces/LastActive.interface';
import {
  MongoNotification,
  NotificationData,
  NotificationType,
} from '../../interfaces/Notification.interface';
import { SavedGroup } from '../../interfaces/SavedGroup.interface';
import { EmergencyContact, User } from '../../interfaces/User.interface';
import { Venue, VenueReaction } from '../../interfaces/Venue.interface';
import { REACTION_EMOJIS } from '../../utils/constants';
import { Emoji } from '../../utils/venue.utils';

/* User 1 */
const TEST_LAST_ACTIVE_1: LastActive = {
  location: {
    latitude: 12.8758393,
    longitude: 95.7584833,
  },
  time: new Date().toUTCString(),
} as LastActive;

const TEST_SAVED_GROUP_1: SavedGroup = {
  _id: new mongoose.Types.ObjectId(),
  name: 'My new group!',
  users: [
    new mongoose.Types.ObjectId(233456),
    new mongoose.Types.ObjectId(345675),
  ],
};

const TEST_SAVED_GROUP_2: SavedGroup = {
  _id: new mongoose.Types.ObjectId(),
  name: 'My side friend group',
  users: [
    new mongoose.Types.ObjectId(2456),
    new mongoose.Types.ObjectId(34675),
  ],
};

export const TEST_USER_1: User = {
  firebaseUid: 'FAKEUSERID1',
  notificationToken: undefined,
  imgUrlProfileSmall: 'www.smallProfileImage1.com',
  imgUrlProfileLarge: 'www.largeProfileImage1.com',
  imgUrlCover: 'www.coverImage1.com',
  firstName: 'John1',
  lastName: 'Doe1',
  email: 'john.doe1@gmail.com',
  phone: '+11234567890',
  birthday: new Date().toUTCString(),
  currentGroup: undefined,
  invitedGroups: undefined,
  friends: [],
  friendRequests: [],
  lastActive: TEST_LAST_ACTIVE_1,
  savedGroups: [TEST_SAVED_GROUP_1, TEST_SAVED_GROUP_2],
};

export const UPDATE_USER_1_TO_USER_2: any = {
  firstName: 'Tom',
  lastName: 'Updated',
  email: 't-dawg@gmail.com',
  phone: '+16314959610',
};

export const SAVED_GROUP: SavedGroup = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test group',
  users: [
    new mongoose.Types.ObjectId(2234566),
    new mongoose.Types.ObjectId(987475),
    new mongoose.Types.ObjectId(23456765),
  ],
};

/* User 2 */
const TEST_LAST_ACTIVE_2: LastActive = {
  location: {
    latitude: 42.8758393,
    longitude: 35.7584833,
  },
  time: new Date().toUTCString(),
} as LastActive;

const TEST_SAVED_GROUP_3: SavedGroup = {
  _id: new mongoose.Types.ObjectId(),
  name: 'A cool friend group!',
  users: [
    new mongoose.Types.ObjectId(2234566),
    new mongoose.Types.ObjectId(987475),
  ],
};

const TEST_SAVED_GROUP_4: SavedGroup = {
  _id: new mongoose.Types.ObjectId(),
  name: 'A not-so-cool friend group',
  users: [
    new mongoose.Types.ObjectId(2098765),
    new mongoose.Types.ObjectId(346925),
  ],
};

export const TEST_USER_2: User = {
  firebaseUid: 'FAKEUSERID2',
  notificationToken: undefined,
  imgUrlProfileSmall: 'www.smallProfileImage2.com',
  imgUrlProfileLarge: 'www.largeProfileImage2.com',
  imgUrlCover: 'www.coverImage2.com',
  firstName: 'Graham2',
  lastName: 'Hemingway2',
  email: 'john.doe2@gmail.com',
  phone: '+11234567890',
  birthday: new Date().toUTCString(),
  currentGroup: undefined,
  invitedGroups: undefined,
  friends: [
    new mongoose.Types.ObjectId(987654),
    new mongoose.Types.ObjectId(16724),
  ],
  friendRequests: [],
  lastActive: TEST_LAST_ACTIVE_2,
  savedGroups: [TEST_SAVED_GROUP_3, TEST_SAVED_GROUP_4],
};

export const TEST_USER_3: User = {
  firebaseUid: 'FAKEUSERID3',
  notificationToken: undefined,
  imgUrlProfileSmall: 'www.smallProfileImage3.com',
  imgUrlProfileLarge: 'www.largeProfileImage3.com',
  imgUrlCover: 'www.coverImage3.com',
  firstName: 'Graham3',
  lastName: 'Hemingway3',
  email: 'john3.doe@gmail.com',
  phone: '+11234567890',
  birthday: new Date().toUTCString(),
  currentGroup: undefined,
  invitedGroups: undefined,
  friends: [
    new mongoose.Types.ObjectId(987654),
    new mongoose.Types.ObjectId(16724),
  ],
  friendRequests: [],
  lastActive: TEST_LAST_ACTIVE_2,
  savedGroups: [TEST_SAVED_GROUP_3, TEST_SAVED_GROUP_4],
};

export const TEST_USER_4: User = {
  firebaseUid: 'FAKEUSERID4',
  notificationToken: undefined,
  imgUrlProfileSmall: 'www.smallProfileImage4.com',
  imgUrlProfileLarge: 'www.largeProfileImage4.com',
  imgUrlCover: 'www.coverImage4.com',
  firstName: 'Graham4',
  lastName: 'Hemingway4',
  email: 'john4.doe@gmail.com',
  phone: '+11234567890',
  birthday: new Date().toUTCString(),
  currentGroup: undefined,
  invitedGroups: undefined,
  friends: [],
  friendRequests: [],
  lastActive: TEST_LAST_ACTIVE_2,
  savedGroups: [TEST_SAVED_GROUP_3, TEST_SAVED_GROUP_4],
};

export const TEST_USER_5: User = {
  firebaseUid: 'FAKEUSERID5',
  notificationToken: undefined,
  imgUrlProfileSmall: 'www.smallProfileImage5.com',
  imgUrlProfileLarge: 'www.largeProfileImage5.com',
  imgUrlCover: 'www.coverImage5.com',
  firstName: 'Graham5',
  lastName: 'Hemingway5',
  email: 'john5.doe@gmail.com',
  phone: '+11234567890',
  birthday: new Date().toUTCString(),
  currentGroup: undefined,
  invitedGroups: undefined,
  friends: [],
  friendRequests: [],
  lastActive: TEST_LAST_ACTIVE_2,
  savedGroups: [TEST_SAVED_GROUP_3, TEST_SAVED_GROUP_4],
};

export const SEARCH_USER_1: User = {
  firebaseUid: 'FAKEUSERID1',
  notificationToken: undefined,
  imgUrlProfileSmall: 'www.smallProfileImage1.com',
  imgUrlProfileLarge: 'www.largeProfileImage1.com',
  imgUrlCover: 'www.coverImage1.com',
  firstName: 'Ethan',
  lastName: 'Ratnofsky',
  email: 'er1@gmail.com',
  phone: '+11234567890',
  birthday: new Date().toUTCString(),
  currentGroup: undefined,
  invitedGroups: undefined,
  friends: [],
  friendRequests: [],
  lastActive: TEST_LAST_ACTIVE_1,
  savedGroups: [TEST_SAVED_GROUP_1, TEST_SAVED_GROUP_2],
};

export const SEARCH_USER_2: User = {
  firebaseUid: 'FAKEUSERID1',
  notificationToken: undefined,
  imgUrlProfileSmall: 'www.smallProfileImage1.com',
  imgUrlProfileLarge: 'www.largeProfileImage1.com',
  imgUrlCover: 'www.coverImage1.com',
  firstName: 'Ethan',
  lastName: 'Thomas',
  email: 'er2@gmail.com',
  phone: '+11234567890',
  birthday: new Date().toUTCString(),
  currentGroup: undefined,
  invitedGroups: undefined,
  friends: [],
  friendRequests: [],
  lastActive: TEST_LAST_ACTIVE_1,
  savedGroups: [TEST_SAVED_GROUP_1, TEST_SAVED_GROUP_2],
};

export const SEARCH_USER_3: User = {
  firebaseUid: 'FAKEUSERID1',
  notificationToken: undefined,
  imgUrlProfileSmall: 'www.smallProfileImage1.com',
  imgUrlProfileLarge: 'www.largeProfileImage1.com',
  imgUrlCover: 'www.coverImage1.com',
  firstName: 'Zi',
  lastName: 'Teoh',
  email: 'zt1@gmail.com',
  phone: '+11234567890',
  birthday: new Date().toUTCString(),
  currentGroup: undefined,
  invitedGroups: undefined,
  friends: [],
  friendRequests: [],
  lastActive: TEST_LAST_ACTIVE_1,
  savedGroups: [TEST_SAVED_GROUP_1, TEST_SAVED_GROUP_2],
};

/* Groups */
export const TEST_GROUP1: Group = {
  name: 'Our group',
  members: [
    new mongoose.Types.ObjectId(234),
    new mongoose.Types.ObjectId(65164),
  ],
  invitedMembers: [
    new mongoose.Types.ObjectId(5),
    new mongoose.Types.ObjectId(65264),
  ],
  creationDatetime: new Date().toUTCString(),
  expirationDatetime: new Date().toUTCString(),
};

export const TEST_GROUP2: Group = {
  name: 'Second group',
  members: [],
  invitedMembers: [],
  creationDatetime: new Date().toUTCString(),
  expirationDatetime: new Date().toUTCString(),
};

/* Venues */
export const TEST_VENUE: Venue = {
  name: 'The Last Bar',
  address: '123 Broadway, Just Broadway',
  location: {
    latitude: 12.2343234,
    longitude: 32.456543,
  },
  reactions: [],
};

/* Notification */
export const TEST_NOTIFICATION: MongoNotification = {
  _id: new mongoose.Types.ObjectId(),
  userId: new mongoose.Types.ObjectId(123).toString(),
  title: 'Friend Request',
  body: 'You have a friend request!',
  data: {
    notificationType: NotificationType.friendRequest,
  } as NotificationData,
  delay: 0,
};

/* Emergency Contact */
export const TEST_EMERGENCY_CONTACT: EmergencyContact = {
  name: 'John Doe',
  phone: '+11234567890',
};

/* Reactions */
export const createTestReaction = (userId: string | number, emoji: Emoji) => {
  return {
    userId: new mongoose.Types.ObjectId(userId),
    emoji: emoji,
  } as VenueReaction;
};

/* KEYS FOR TESTING */
// TODO: can these be enums?
export const USER_KEYS_TEST = [
  '__v',
  '_id',
  'birthday',
  'email',
  'firebaseUid',
  'firstName',
  'friends',
  'friendRequests',
  'imgUrlCover',
  'imgUrlProfileLarge',
  'imgUrlProfileSmall',
  'invitedGroups',
  'lastName',
  'phone',
  'lastActive',
  'savedGroups',
  'emergencyContacts',
];

export const GROUP_KEYS_TEST = [
  '__v',
  '_id',
  'name',
  'members',
  'invitedMembers',
  'creationDatetime',
  'expirationDatetime',
];

export const VENUE_KEYS_TEST = [
  '__v',
  '_id',
  'name',
  'address',
  'location',
  'reactions',
];

export const NOTIFICATION_KEYS_TEST = [
  '__v',
  '_id',
  'userId',
  'title',
  'body',
  'data',
  'delay',
];

export const REACTION_KEYS_TEST = ['count', 'didReact'];

export const VENUE_KEYS_EMOJIS_TEST = [...REACTION_EMOJIS];

export const SAVED_GROUP_KEYS = ['_id', 'name', 'users'];
