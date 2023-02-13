import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import exp from 'constants';
import {
  createSecondTestReaction,
  createTestReaction,
  GROUP_KEYS,
  PARTIAL_EMOJI_COUNT_1,
  PARTIAL_EMOJI_COUNT_2,
  PARTIAL_EMOJI_COUNT_3,
  TEST_GROUP,
  TEST_USER_1,
  TEST_USER_2,
  TEST_VENUE,
  UPDATE_USER_1_TO_USER_2,
  USER_KEYS,
  VENUE_KEYS_EMOJIS,
  VENUE_KEYS_GET,
  VENUE_KEYS_POST,
} from './testData';
import { fillEmojiCount } from '../utils/venue.utils';
import { EMOJIS } from '../utils/constants';

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
  server = app.listen(6060);
});

/* USER TESTS */
let userId: string;
describe('testing user actions', () => {
  it('POST /user', done => {
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

  it('GET /user/{userId}', done => {
    chai
      .request(server)
      .get('/user/' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  it('UPDATE /user/{userId}', done => {
    chai
      .request(server)
      .patch('/user/' + userId)
      .send(UPDATE_USER_1_TO_USER_2)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);

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
      .send(TEST_GROUP)
      .then(res => {
        groupId = res.body.group._id;
        expect(res).to.have.status(201);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
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
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        done();
      });
  });

  it('DELETE /group/{groupId}', done => {
    chai
      .request(server)
      .delete('/group/' + groupId)
      .send()
      .then(res => {
        expect(res).to.have.status(204);
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
      .send(TEST_VENUE)
      .then(res => {
        venueId = res.body.venue._id;
        expect(res).to.have.status(201);
        expect(res.body.venue).to.have.keys(VENUE_KEYS_POST);
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
        expect(res.body.venue).to.have.keys(VENUE_KEYS_GET);
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
        expect(res.body.venue).to.have.keys(VENUE_KEYS_POST);
        done();
      });
  });

  let reactionId1: string;
  it('POST /reaction/ #1', done => {
    const testReaction = createTestReaction(userId, venueId);
    chai
      .request(server)
      .post('/reaction')
      .send(testReaction)
      .then(res => {
        reactionId1 = res.body.reaction._id;
        expect(res).to.have.status(201);
        done();
      });
  });

  let reactionId2: string;
  it('POST /reaction/ #2', done => {
    const testReaction = createSecondTestReaction(userId, venueId);
    chai
      .request(server)
      .post('/reaction/')
      .send(testReaction)
      .then(res => {
        reactionId2 = res.body.reaction._id;
        expect(res).to.have.status(201);
        done();
      });
  });

  let reactionId3: string;
  it('POST /reaction/ #3', done => {
    const testReaction = createSecondTestReaction(userId, venueId);
    chai
      .request(server)
      .post('/reaction')
      .send(testReaction)
      .then(res => {
        reactionId3 = res.body.reaction._id;
        expect(res).to.have.status(201);
        done();
      });
  });

  it('DELETE /reaction/ #1', done => {
    chai
      .request(server)
      .delete('/reaction/' + reactionId1)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
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
        expect(res.body.venue).to.have.keys(VENUE_KEYS_GET);
        expect(res.body.venue.reactions['🎉']).to.equal(2);
        done();
      });
  });

  it('DELETE /reaction/ #2', done => {
    chai
      .request(server)
      .delete('/reaction/' + reactionId2)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('DELETE /reaction/ #3', done => {
    chai
      .request(server)
      .delete('/reaction/' + reactionId3)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('testing util functions', () => {
  it('UTIL fillEmojiCount empty', done => {
    const result = fillEmojiCount([]);
    assert.hasAllKeys(result, EMOJIS);
    done();
  });

  it('UTIL fillEmojiCount mostly empty', done => {
    const result = fillEmojiCount(PARTIAL_EMOJI_COUNT_1);
    assert.hasAllKeys(result, EMOJIS);
    done();
  });

  it('UTIL fillEmojiCount mostly full', done => {
    const result = fillEmojiCount(PARTIAL_EMOJI_COUNT_2);
    assert.hasAllKeys(result, EMOJIS);
    done();
  });

  it('UTIL fillEmojiCount full', done => {
    const result = fillEmojiCount(PARTIAL_EMOJI_COUNT_3);
    assert.hasAllKeys(result, EMOJIS);
    done();
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
