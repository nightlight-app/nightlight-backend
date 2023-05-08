import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  createGroup,
  createUser,
  createVenue,
  SEED_VENUES,
} from './data/seedData';
import {
  GROUP_KEYS_TEST,
  USER_KEYS_TEST,
  VENUE_KEYS_TEST,
} from './data/testData';
import User from '../models/User.model';
import Group from '../models/Group.model';
import Venue from '../models/Venue.model';
import { Server } from 'http';
import Notification from '../models/Notification.model';
import { useTestingDatabase } from '../../src/config/mongodb.config';
require('dotenv').config();

chai.use(chaiHttp);
chai.should();

const app = createServer({ shouldRunBullBoard: false });
let server: Server;

const connectToMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(useTestingDatabase(), {
      useNewUrlParser: true,
    } as ConnectOptions);
  } catch (error) {
    console.error(error);
  }
};

before(async () => {
  await connectToMongo();
  server = app.listen(6063);
  await User.deleteMany({});
  await Group.deleteMany({});
  await Venue.deleteMany({});
  await Notification.deleteMany({});
});

/**
 * DATA SEEDING
 *
 * 6 total users, 4 friends with eachother and 2 seperate with some relations
 * 4 users in group
 * 10 venues (written by @Sophia)
 *
 */
describe('seed database for prod', () => {
  let userIds = [] as mongoose.Types.ObjectId[];
  let mainUserId: mongoose.Types.ObjectId;
  let groupId: string;
  let venueIds = [] as mongoose.Types.ObjectId[];

  // loop for multiple users to be added
  for (let i = 0; i < 5; ++i) {
    // create user and add to array
    const user = createUser(undefined, [], []);
    it('seed data - users', done => {
      chai
        .request(server)
        .post('/users/')
        .send(user)
        .then(res => {
          userIds.push(new mongoose.Types.ObjectId(res.body.user._id));
          expect(res).to.have.status(201);
          expect(res.body.user).to.have.keys([...USER_KEYS_TEST]);
          done();
        });
    });
  }

  const final_user = createUser(undefined, [], userIds);

  // post final user (main user)
  it('seed data - main user', done => {
    chai
      .request(server)
      .post('/users/')
      .send(final_user)
      .then(res => {
        mainUserId = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  it('seed data - group', done => {
    chai
      .request(server)
      .post('/groups/?userId=' + mainUserId)
      .send({
        ...createGroup(),
        invitedMembers: userIds,
        members: [mainUserId],
      })
      .then(res => {
        groupId = res.body.group._id;
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys([...GROUP_KEYS_TEST]);
        done();
      });
  });

  for (let i = 0; i < 5; ++i) {
    it('seed data - accept group invitation', done => {
      chai
        .request(server)
        .patch(
          '/users/' +
            userIds.pop() +
            '/accept-group-invitation/?groupId=' +
            groupId
        )
        .send()
        .then(res => {
          expect(res).to.have.status(200);
          done();
        });
    });
  }

  // loop for multiple venues to be  added
  for (let i = 0; i < 10; ++i) {
    // create venue from venues list
    const venue = createVenue(SEED_VENUES[i].name, SEED_VENUES[i].address);
    it('seed data - venues', done => {
      chai
        .request(server)
        .post('/venues/')
        .send(venue)
        .then(res => {
          venueIds.push(new mongoose.Types.ObjectId(res.body.venue._id));
          expect(res).to.have.status(201);
          expect(res.body.venue).to.have.keys(VENUE_KEYS_TEST);
          done();
        });
    });
  }
});

after(async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    await server.close();
  }
});
