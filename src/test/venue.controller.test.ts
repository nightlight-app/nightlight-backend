import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  createSecondTestReaction,
  createTestReaction,
  TEST_USER_1,
  TEST_VENUE,
  USER_KEYS,
  VENUE_KEYS,
} from './testData';
import { mapEmoji } from '../utils/venue.utils';

require('dotenv').config();

chai.use(chaiHttp);
chai.should();

const app = createServer();
let server: any;

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
  server = app.listen(6061);
});

describe('testing venue with reactions', () => {
  let userId: string;

  it('POST /user for reaction test', done => {
    chai
      .request(server)
      .post('/user')
      .send(TEST_USER_1)
      .then(res => {
        userId = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let venueId: string;

  it('POST /venue for reaction test', done => {
    chai
      .request(server)
      .post('/venue')
      .send(TEST_VENUE)
      .then(res => {
        venueId = res.body.venue._id;
        expect(res).to.have.status(201);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        done();
      });
  });

  let emoji1: string;
  it('POST /reaction/ #1', done => {
    const testReaction = createTestReaction(userId);
    chai
      .request(server)
      .post('/venue/' + venueId + '/reaction')
      .send(testReaction)
      .then(res => {
        emoji1 = testReaction.emoji;
        expect(res).to.have.status(200);
        done();
      });
  });

  let emoji2: string;
  it('POST /reaction/ #2', done => {
    const testReaction = createSecondTestReaction(userId);
    chai
      .request(server)
      .post('/venue/' + venueId + '/reaction')
      .send(testReaction)
      .then(res => {
        emoji2 = testReaction.emoji;
        expect(res).to.have.status(200);
        done();
      });
  });

  it('DELETE /reaction/ #1', done => {
    chai
      .request(server)
      .delete(
        '/venue/' +
          venueId +
          '/reaction/?userId=' +
          userId +
          '&emoji=' +
          mapEmoji(emoji1)
      )
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('DELETE /reaction/ #2', done => {
    chai
      .request(server)
      .delete(
        '/venue/' +
          venueId +
          '/reaction/?userId=' +
          userId +
          '&emoji=' +
          mapEmoji(emoji2)
      )
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

/* VENUE TESTS WITH REACTION*/
describe('testing venue without reactions', () => {
  let venueId: string;

  it('POST /venue', done => {
    chai
      .request(server)
      .post('/venue')
      .send(TEST_VENUE)
      .then(res => {
        venueId = res.body.venue._id;
        expect(res).to.have.status(201);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        done();
      });
  });

  it('GET /venue/{venueId}/', done => {
    chai
      .request(server)
      .get('/venue/' + venueId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
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

afterEach(async () => {
  try {
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    server.close();
  }
});
