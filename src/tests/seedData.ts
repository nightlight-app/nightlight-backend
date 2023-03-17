import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Group } from '../interfaces/Group.interface';
import { User } from '../interfaces/User.interface';
import { Venue } from '../interfaces/Venue.interface';

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
) => {
  return {
    firebaseUid: faker.random.alphaNumeric(32),
    notificationToken:
      'ExponentPushToken[' + faker.random.alphaNumeric(12) + ']',
    imgUrlProfileSmall: faker.internet.url(),
    imgUrlProfileLarge: faker.internet.url(),
    imgUrlCover: faker.internet.url(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    birthday: new Date(
      faker.date.between('1990-01-01T00:00:00.000Z', '2001-01-01T00:00:00.000Z')
    ),
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
        faker.date.between(
          '1990-01-01T00:00:00.000Z',
          '2001-01-01T00:00:00.000Z'
        )
      ),
    },
    savedGroups: [],
  } as User;
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
    creationDatetime: new Date(),
    expirationDatetime: new Date(),
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
];
