import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  createTestReaction,
  REACTION_KEYS,
  TEST_USER_1,
  TEST_VENUE,
  USER_KEYS,
  VENUE_KEYS,
} from './testData';
import { ObjectId } from 'mongodb';
import { decodeEmoji } from '../utils/venue.utils';

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

before(async () => {
  await connectToMongo();
  server = app.listen(6061);
});

describe('testing venue with reactions', () => {
  let userId: string;
  it('POST /user for reaction test', done => {
    chai
      .request(server)
      .post('/users/')
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
      .post('/venues/')
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
    const testReaction = createTestReaction(userId, '🔥');
    chai
      .request(server)
      .post('/venues/' + venueId + '/reaction')
      .send(testReaction)
      .then(res => {
        emoji1 = testReaction.emoji;
        expect(res).to.have.status(200);
        done();
      });
  });

  let emoji2: string;
  it('POST /reaction/ #2', done => {
    const testReaction = createTestReaction(userId, '🎉');
    chai
      .request(server)
      .post('/venues/' + venueId + '/reaction')
      .send(testReaction)
      .then(res => {
        emoji2 = testReaction.emoji;
        expect(res).to.have.status(200);
        done();
      });
  });

  let emoji3: string;
  let userId3: string;
  it('POST /reaction/ #3', done => {
    const testReaction = createTestReaction(12345, '💩');
    chai
      .request(server)
      .post('/venues/' + venueId + '/reaction')
      .send(testReaction)
      .then(res => {
        emoji3 = testReaction.emoji;
        userId3 = testReaction.userId.toString();
        expect(res).to.have.status(200);
        done();
      });
  });

  let emoji4: string;
  let userId4: string;
  it('POST /reaction/ #4', done => {
    const testReaction = createTestReaction(54321, '🛡');
    chai
      .request(server)
      .post('/venues/' + venueId + '/reaction')
      .send(testReaction)
      .then(res => {
        userId4 = testReaction.userId.toString();
        emoji4 = testReaction.emoji;
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /venue/{venueId}/', done => {
    chai
      .request(server)
      .get('/venues/' + venueId + '/?userId=' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        expect(res.body.venue.reactions['🔥']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🔥'].count).to.equal(1);
        expect(res.body.venue.reactions['🔥'].didReact).to.equal(true);
        expect(res.body.venue.reactions['🎉']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🎉'].count).to.equal(1);
        expect(res.body.venue.reactions['🎉'].didReact).to.equal(true);
        expect(res.body.venue.reactions['🛡']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🛡'].count).to.equal(1);
        expect(res.body.venue.reactions['🛡'].didReact).to.equal(false);
        expect(res.body.venue.reactions['💩']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['💩'].count).to.equal(1);
        expect(res.body.venue.reactions['💩'].didReact).to.equal(false);
        expect(res.body.venue.reactions['⚠️']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['⚠️'].count).to.equal(0);
        expect(res.body.venue.reactions['⚠️'].didReact).to.equal(false);
        done();
      });
  });

  it('DELETE /reaction/ #1', done => {
    chai
      .request(server)
      .delete(
        '/venues/' +
          venueId +
          '/reaction/?userId=' +
          userId +
          '&emoji=' +
          decodeEmoji(emoji1)
      )
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('DELETE /reaction/ #3', done => {
    chai
      .request(server)
      .delete(
        '/venues/' +
          venueId +
          '/reaction/?userId=' +
          userId3 +
          '&emoji=' +
          decodeEmoji(emoji3)
      )
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /venue/{venueId}/', done => {
    chai
      .request(server)
      .get('/venues/' + venueId + '/?userId=' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        expect(res.body.venue.reactions['🔥']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🔥'].count).to.equal(0);
        expect(res.body.venue.reactions['🔥'].didReact).to.equal(false);
        expect(res.body.venue.reactions['🎉']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🎉'].count).to.equal(1);
        expect(res.body.venue.reactions['🎉'].didReact).to.equal(true);
        expect(res.body.venue.reactions['🛡']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🛡'].count).to.equal(1);
        expect(res.body.venue.reactions['🛡'].didReact).to.equal(false);
        expect(res.body.venue.reactions['💩']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['💩'].count).to.equal(0);
        expect(res.body.venue.reactions['💩'].didReact).to.equal(false);
        expect(res.body.venue.reactions['⚠️']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['⚠️'].count).to.equal(0);
        expect(res.body.venue.reactions['⚠️'].didReact).to.equal(false);
        done();
      });
  });

  it('DELETE /reaction/ #2', done => {
    chai
      .request(server)
      .delete(
        '/venues/' +
          venueId +
          '/reaction/?userId=' +
          userId +
          '&emoji=' +
          decodeEmoji(emoji2)
      )
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('DELETE /reaction/ #4', done => {
    chai
      .request(server)
      .delete(
        '/venues/' +
          venueId +
          '/reaction/?userId=' +
          userId4 +
          '&emoji=' +
          decodeEmoji(emoji4)
      )
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /venue/{venueId}/', done => {
    chai
      .request(server)
      .get('/venues/' + venueId + '/?userId=' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        expect(res.body.venue.reactions['🔥']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🔥'].count).to.equal(0);
        expect(res.body.venue.reactions['🔥'].didReact).to.equal(false);
        expect(res.body.venue.reactions['🎉']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🎉'].count).to.equal(0);
        expect(res.body.venue.reactions['🎉'].didReact).to.equal(false);
        expect(res.body.venue.reactions['🛡']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['🛡'].count).to.equal(0);
        expect(res.body.venue.reactions['🛡'].didReact).to.equal(false);
        expect(res.body.venue.reactions['💩']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['💩'].count).to.equal(0);
        expect(res.body.venue.reactions['💩'].didReact).to.equal(false);
        expect(res.body.venue.reactions['⚠️']).to.have.keys(REACTION_KEYS);
        expect(res.body.venue.reactions['⚠️'].count).to.equal(0);
        expect(res.body.venue.reactions['⚠️'].didReact).to.equal(false);
        done();
      });
  });

  it('DELETE /venue/{userId}', done => {
    chai
      .request(server)
      .get('/venues/' + venueId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('DELETE /user/{userId}', done => {
    chai
      .request(server)
      .delete('/users/' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

/* VENUE TESTS WITH REACTION*/
describe('testing venue without reactions', () => {
  let userId: string;
  it('POST /user for group creation test', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_1)
      .then(res => {
        userId = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let venueId: string;
  it('POST /venue', done => {
    chai
      .request(server)
      .post('/venues/')
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
      .get('/venues/' + venueId + '/?userId=' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        done();
      });
  });

  it('Update /venue/{venueId}/', done => {
    chai
      .request(server)
      .patch('/venues/' + venueId)
      .send({ name: 'New venue name' })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('Update /venue/{venueId}/ incorrectly formatted data', done => {
    chai
      .request(server)
      .patch('/venues/' + venueId)
      .send({ badData: 'fakeStuff' })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /venue/{venueId}/ verify keys are still correct', done => {
    chai
      .request(server)
      .get('/venues/' + venueId + '/?userId=' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        done();
      });
  });

  it('UPDATE /venues/ incorrect id', done => {
    chai
      .request(server)
      .patch('/venues/' + new ObjectId(1234).toString())
      .send({ name: 'Test' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('UPDATE /venues invalid id', done => {
    chai
      .request(server)
      .patch('/venues/' + 'FAKEID')
      .send({ name: 'Test' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('GET /venue/{venueId}/', done => {
    chai
      .request(server)
      .get('/venues/' + venueId + '/?userId=' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        expect(res.body.venue.name).to.equal('New venue name');
        done();
      });
  });

  it('DELETE /venue/{userId}', done => {
    chai
      .request(server)
      .get('/venues/' + venueId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('testing venue errors', () => {
  it('GET /venue/{venueId} Invalid ID', done => {
    chai
      .request(server)
      .get('/venues/' + 'FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('GET /venue/{venueId} Incorrect ID', done => {
    chai
      .request(server)
      .get('/venues/' + new ObjectId(1234).toString())
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.venue).to.equal(undefined);
        done();
      });
  });

  it('POST /venue incorrectly formatted data', done => {
    chai
      .request(server)
      .post('/venues/')
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('DELETE /venue/{venueId} Invalid ID', done => {
    chai
      .request(server)
      .delete('/venues/' + 'FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('DELETE /venue/{venueId} Incorrect ID', done => {
    chai
      .request(server)
      .delete('/venues/' + new ObjectId(1234).toString())
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

after(async () => {
  try {
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    server.close();
  }
});
