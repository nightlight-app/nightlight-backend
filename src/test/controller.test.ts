import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import exp from 'constants';
import { createTestReaction, testGroup, testUser, testVenue } from './testData';

require('dotenv').config();

chai.use(chaiHttp);
chai.should();

const app = createServer();
let server: any;

const userKeys = [
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

const groupKeys = [
  '__v',
  '_id',
  'name',
  'members',
  'invitedMembers',
  'creationTime',
  'expirationDate',
  'returnTime',
];

const venueKeysPost = ['__v', '_id', 'name', 'address', 'location'];

const venueKeysGet = ['__v', '_id', 'name', 'address', 'location', 'reactions'];

const connectToMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      useNewUrlParser: true,
    } as ConnectOptions);
  } catch (error) {
    console.error(error);
  }
};

beforeEach(async () => {
  await connectToMongo();
  server = app.listen(6060);
});

/* USER TESTS */
let userId: string;
describe('testing user actions', () => {
  it('POST /user', done => {
    chai
      .request(server)
      .post('/user')
      .send(testUser)
      .then(res => {
        userId = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(userKeys);
        done();
      });
  });

  it('GET /user/{userId}', done => {
    chai
      .request(server)
      .get('/user/' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(userKeys);
        done();
      });
  });

  it('DELETE /user/{userId}', done => {
    chai
      .request(server)
      .delete('/user/' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

/* GROUP TESTS */
describe('testing group actions', () => {
  let groupId: string;

  it('POST /group', done => {
    chai
      .request(server)
      .post('/group')
      .send(testGroup)
      .then(res => {
        groupId = res.body.group._id;
        expect(res).to.have.status(201);
        expect(res.body.group).to.have.keys(groupKeys);
        done();
      });
  });

  it('GET /group/{groupId}', done => {
    chai
      .request(server)
      .get('/group/' + groupId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(groupKeys);
        done();
      });
  });
});

/* VENUE TESTS */
describe('testing venue actions', () => {
  let venueId: string;

  it('POST /venue', done => {
    chai
      .request(server)
      .post('/venue')
      .send(testVenue)
      .then(res => {
        venueId = res.body.venue._id;
        expect(res).to.have.status(201);
        expect(res.body.venue).to.have.keys(venueKeysPost);
        done();
      });
  });

  it('GET /venue/{venueId}', done => {
    chai
      .request(server)
      .get('/venue/' + venueId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(venueKeysGet);
        done();
      });
  });

  it('DELETE /venue/{userId}', done => {
    chai
      .request(server)
      .get('/venue/' + venueId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

/* REACTION TESTS */

describe('testing reaction actions', () => {
  let userId: string;

  it('POST /user for reaction test', done => {
    chai
      .request(server)
      .post('/user')
      .send(testUser)
      .then(res => {
        userId = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(userKeys);
        done();
      });
  });

  let venueId: string;

  it('POST /venue for reaction test', done => {
    chai
      .request(server)
      .post('/venue')
      .send(testVenue)
      .then(res => {
        venueId = res.body.venue._id;
        expect(res).to.have.status(201);
        expect(res.body.venue).to.have.keys(venueKeysPost);
        done();
      });
  });

  it('POST /reaction', done => {
    const testReaction = createTestReaction(userId, venueId);

    chai
      .request(server)
      .post('/reaction')
      .send(testReaction)
      .then(res => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('GET /venue/{venueId}', done => {
    chai
      .request(server)
      .get('/venue/' + venueId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(venueKeysGet);
        done();
      });
  });
});

afterEach(async () => {
  try {
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    server.close();
  }
});
