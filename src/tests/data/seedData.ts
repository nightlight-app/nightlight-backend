import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Group } from '../../interfaces/Group.interface';
import { User } from '../../interfaces/User.interface';
import { Venue } from '../../interfaces/Venue.interface';

/**
 * Creates a random user that can be sent as a post to the backend. Utilizes faker.js npm package for value generation
 * @param currentGroup designates the current group of the new user, undefined if not included
 * @param invitedGroups designates the current invited groups of user, undefined if not included
 * @param friends designates a list of user ids that are the users friends, [] if not included
 * @returns completed User object
 */
export const createUser = (
  currentGroup?: mongoose.Types.ObjectId,
  invitedGroups?: mongoose.Types.ObjectId[],
  friends?: mongoose.Types.ObjectId[]
): User => {
  return {
    firebaseUid: faker.random.alphaNumeric(32),
    notificationToken: undefined,
    imgUrlProfileSmall: faker.internet.url(),
    imgUrlProfileLarge: faker.internet.url(),
    imgUrlCover: faker.internet.url(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    isEmergency: false,
    birthday: new Date(
      faker.date.between('1990-01-01T00:00:00.000Z', '2001-01-01T00:00:00.000Z')
    ).toUTCString(),
    currentGroup: currentGroup,
    invitedGroups: invitedGroups,
    friends: friends || ([] as mongoose.Types.ObjectId[]),
    friendRequests: [] as mongoose.Types.ObjectId[],
    lastActive: {
      location: {
        latitude: Number(faker.address.latitude()),
        longitude: Number(faker.address.longitude()),
      },
      time: new Date(
        faker.date.between('1990-01-01T00:00:00.000Z', '2001-01-01T00:00:00.000Z')
      ).toUTCString(),
    },
    savedGroups: [],
  };
};

/**
 * Creates a random group that can be sent as a post to the backend. Utilizes faker.js npm package for value generation
 * @returns completed group object
 */
export const createGroup = () => {
  return {
    name: faker.word.adjective(),
    members: [] as mongoose.Types.ObjectId[],
    invitedMembers: [] as mongoose.Types.ObjectId[],
    creationDatetime: new Date().toUTCString(),
    expirationDatetime: new Date(
      new Date().setDate(new Date().getDate() + 1)
    ).toUTCString(),
    expectedDestination: {
      latitude: Number(faker.address.latitude()),
      longitude: Number(faker.address.longitude()),
    },
  } as Group;
};

/**
 * Creates a new venue that can be sent as a post to the backend. Utilizes faker.js npm package for value generation
 * @param name designates the intended name of the venue object, random if not included
 * @param address designates the intended address of the venue object, random if not included
 * @returns
 */
export const createVenue = (name?: string, address?: string) => {
  return {
    name: name || faker.word.adjective(),
    address: address || faker.address.streetAddress(),
    reactions: [],
    location: {
      latitude: Number(faker.address.latitude()),
      longitude: Number(faker.address.longitude()),
    },
  } as Venue;
};

/*
 * CONSTANTS
 */

export const SEED_VENUES = [
  {
    name: 'Play',
    address: '1519 Church St',
  },
  {
    name: 'The 5 Spot',
    address: '1006 Forrest Ave',
  },
  {
    name: 'Nashville Underground',
    address: '105 Broadway',
  },
  {
    name: 'Tootsies Orchid Lounge',
    address: '422 Broadway',
  },
  {
    name: "Nudie's Honky Tonk",
    address: '409 Broadway Ave',
  },
  {
    name: 'Flamingo Cocktail Club',
    address: '509 Houston St',
  },
  {
    name: 'Acme Feed and Seed',
    address: '101 Broadway',
  },
  {
    name: 'FGL House',
    address: '120 3rd Ave S',
  },
  {
    name: "Luke's 32 Bridge Food + Drink",
    address: '301 Broadway',
  },
  {
    name: 'The Valentine',
    address: '312 Broadway',
  },
  {
    name: "Santa's Pub",
    address: '2225 Bransford Ave',
  },
  {
    name: 'Bourbon Street Blues and Boogie Bar',
    address: '220 Printers Alley',
  },
  {
    name: 'Rosemary & Beauty Queen',
    address: '1102 Forrest Ave',
  },
  {
    name: "Bobby's Idle Hour Tavern",
    address: '9 Music Square S',
  },
  {
    name: 'Mercy Lounge',
    address: '1 Cannery Row',
  },
];

export const SEED_USERS = [
  {
    _id: '5e9f1c5b0f1c9c0b5c8b4566',
    firebaseUid: '123456789',
    imgUrlProfileSmall: 'https://i.imgur.com/X2BVSih.jpeg',
    imgUrlProfileLarge: 'https://i.imgur.com/X2BVSih.jpeg',
    imgUrlCover: 'https://i.imgur.com/X2BVSih.jpeg',
    firstName: 'Graham',
    lastName: 'Hemingway',
    email: 'probably.not@vanderbilt.edu',
    phone: '6155555554',
    birthday: new Date('1998-01-01'),
    currentGroup: '5e9f1c5b0f1c9c0b5c8b4567',
    friends: ['5e9f1c5b0f1c9c0b5c8b4567'],
    lastActive: {
      location: {
        latitude: 36.1447,
        longitude: -86.8027,
      },
      time: new Date().toUTCString(),
    },
    savedGroups: [],
    isActiveNow: false,
  },
  {
    _id: '5e9f1c5b0f1c9c0b5c8b4567',
    firebaseUid: '1234567890',
    imgUrlProfileSmall:
      'https://ca.slack-edge.com/T04K9KRM37Z-U04K9PNV6B1-915270f4cf38-512',
    imgUrlProfileLarge:
      'https://ca.slack-edge.com/T04K9KRM37Z-U04K9PNV6B1-915270f4cf38-512',
    imgUrlCover: 'https://i.imgur.com/X2BVSih.jpeg',
    firstName: 'Ethan',
    lastName: 'Ratnofsky',
    email: 'ha.u.thought@vanderbilt.edu',
    phone: '6155555555',
    birthday: new Date('1998-01-01'),
    currentGroup: '5e9f1c5b0f1c9c0b5c8b4567',
    friends: ['5e9f1c5b0f1c9c0b5c8b4567'],
    lastActive: {
      location: {
        latitude: 36.1447,
        longitude: -86.8027,
      },
      time: new Date('2023-02-28').toUTCString(),
    },
    savedGroups: [
      {
        name: 'Test Group',
        members: ['5e9f1c5b0f1c9c0b5c8b4567'],
      },
    ],
    isActiveNow: false,
  },
  {
    _id: '5e9f1c5b0f1c9c0b5c8b4568',
    firebaseUid: '1234567891',
    imgUrlProfileSmall:
      'https://ca.slack-edge.com/T04K9KRM37Z-U04L2QUMVH7-a29f336a4279-512',
    imgUrlProfileLarge:
      'https://ca.slack-edge.com/T04K9KRM37Z-U04L2QUMVH7-a29f336a4279-512',
    imgUrlCover: 'https://i.imgur.com/X2BVSih.jpeg',
    firstName: 'Jacob',
    lastName: 'Lurie',
    email: 'ha.u.thought2@vanderbilt.edu',
    phone: '6155555556',
    birthday: new Date('1998-01-01'),
    currentGroup: '5e9f1c5b0f1c9c0b5c8b4567',
    friends: ['5e9f1c5b0f1c9c0b5c8b4567'],
    lastActive: {
      location: {
        latitude: 36.1447,
        longitude: -86.8027,
      },
      time: new Date('2023-01-20').toUTCString(),
    },
    savedGroups: [
      {
        name: 'Test Group',
        members: ['5e9f1c5b0f1c9c0b5c8b4567'],
      },
    ],
    isActiveNow: false,
  },
  {
    _id: '5e9f1c5b0f1c9c0b5c8b4569',
    firebaseUid: '1234567892',
    imgUrlProfileSmall:
      'https://ca.slack-edge.com/T04K9KRM37Z-U04KQA281EE-4aabe4704f56-512',
    imgUrlProfileLarge:
      'https://ca.slack-edge.com/T04K9KRM37Z-U04KQA281EE-4aabe4704f56-512',
    imgUrlCover: 'https://i.imgur.com/X2BVSih.jpeg',
    firstName: 'Sophia',
    lastName: 'Brent',
    email: 'ha.u.thought3@vanderbilt.edu',
    phone: '6155555557',
    birthday: new Date('1998-01-01'),
    currentGroup: '5e9f1c5b0f1c9c0b5c8b4567',
    friends: ['5e9f1c5b0f1c9c0b5c8b4567'],
    lastActive: {
      location: {
        latitude: 36.1447,
        longitude: -86.8027,
      },
      time: new Date('2023-01-20').toUTCString(),
    },
    savedGroups: [
      {
        name: 'Test Group',
        members: ['5e9f1c5b0f1c9c0b5c8b4567'],
      },
    ],
    isActiveNow: false,
  },
  {
    _id: '5e9f1c5b0f1c9c0b5c8b4570',
    firebaseUid: '1234567893',
    imgUrlProfileSmall:
      'https://ca.slack-edge.com/T04K9KRM37Z-U04KMBQSUSZ-619550ec5a62-512',
    imgUrlProfileLarge:
      'https://ca.slack-edge.com/T04K9KRM37Z-U04KMBQSUSZ-619550ec5a62-512',
    imgUrlCover: 'https://i.imgur.com/X2BVSih.jpeg',
    firstName: 'Zi',
    lastName: 'Teoh',
    email: 'ha.u.thought4@vanderbilt.edu',
    phone: '6155555558',
    birthday: new Date('1998-01-01'),
    currentGroup: '5e9f1c5b0f1c9c0b5c8b4567',
    friends: ['5e9f1c5b0f1c9c0b5c8b4567'],
    lastActive: {
      location: {
        latitude: 36.1447,
        longitude: -86.8027,
      },
      time: new Date('2023-01-20').toUTCString(),
    },
    savedGroups: [
      {
        name: 'Test Group',
        members: ['5e9f1c5b0f1c9c0b5c8b4567'],
      },
    ],
    isActiveNow: false,
  },
];
