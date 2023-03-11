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
import { Server } from 'http';
import { nightlightQueue } from '../queue/setup/queue.setup';

require('dotenv').config();

chai.use(chaiHttp);
chai.should();

const app = createServer();
let server: Server;

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
  it('should create a new user via POST /users/ (user2)', done => {
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
  it('should create a new venue via POST /venues/ (venue1)', done => {
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
  it('should add a reaction via POST /venues/:venueId/reaction (🔥)', done => {
    const testReaction = createTestReaction(userId, '🔥');
    chai
      .request(server)
      .post(`/venues/${venueId}/reaction`)
      .send(testReaction)
      .then(res => {
        emoji1 = testReaction.emoji;
        expect(res).to.have.status(200);
        done();
      });
  });

  let emoji2: string;
  it('should add a reaction via POST /venues/:venueId/reaction (🎉)', done => {
    const testReaction = createTestReaction(userId, '🎉');
    chai
      .request(server)
      .post(`/venues/${venueId}/reaction`)
      .send(testReaction)
      .then(res => {
        emoji2 = testReaction.emoji;
        expect(res).to.have.status(200);
        done();
      });
  });

  let emoji3: string;
  let userId3: string;
  it('should add a reaction via POST /venues/:venueId/reaction (💩)', done => {
    const testReaction = createTestReaction(12345, '💩');
    chai
      .request(server)
      .post(`/venues/${venueId}/reaction`)
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
  it('should add a reaction via POST /venues/:venueId/reaction (🛡 )', done => {
    const testReaction = createTestReaction(54321, '🛡');
    chai
      .request(server)
      .post(`/venues/${venueId}/reaction`)
      .send(testReaction)
      .then(res => {
        userId4 = testReaction.userId.toString();
        emoji4 = testReaction.emoji;
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should retrieve venue reactions with correct counts via GET /venues/:venueId/', done => {
    chai
      .request(server)
      .get(`/venues/${venueId}/`)
      .query({ userId })
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

  it('should delete a reaction for user1 via DELETE /venues/:venueId/reaction/', done => {
    chai
      .request(server)
      .delete(`/venues/${venueId}/reaction/`)
      .query({ userId, emoji: decodeEmoji(emoji1) })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should delete a reaction for user3 via DELETE /venues/:venueId/reaction/', done => {
    chai
      .request(server)
      .delete(`/venues/${venueId}/reaction/`)
      .query({ userId: userId3, emoji: decodeEmoji(emoji3) })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should retrieve venue reactions with correct counts via GET /venues/:venueId/', done => {
    chai
      .request(server)
      .get(`/venues/${venueId}/`)
      .query({ userId: userId })
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

  it('should delete a reaction for user1 via DELETE /venues/:venueId/reaction/ (userId, emoji)', done => {
    chai
      .request(server)
      .delete(`/venues/${venueId}/reaction/`)
      .query({ userId: userId, emoji: decodeEmoji(emoji2) })
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should delete a reaction for user4 via DELETE /venues/:venueId/reaction/', done => {
    chai
      .request(server)
      .delete(`/venues/${venueId}/reaction/`)
      .query({ userId: userId4, emoji: decodeEmoji(emoji4) })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should retrieve venue reactions with correct counts via GET /venues/{venueId}/ (venue1)', done => {
    chai
      .request(server)
      .get(`/venues/${venueId}/`)
      .query({ userId: userId })
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

  it('should delete a venue via DELETE /venues/{venueId}/ (venue1)', done => {
    chai
      .request(server)
      .delete(`/venues/${venueId}/`)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should delete a user via DELETE /users/{userId}/ (user1)', done => {
    chai
      .request(server)
      .delete(`/users/${userId}/`)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

/* VENUE TESTS WITH REACTION*/
describe('testing venue without reactions', () => {
  let userId: string;
  it('should create a new user via POST /users/', done => {
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
  it('should create a new venue via POST /venues/', done => {
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

  it('should retrieve venue details via GET /venues/:venueId with userId parameter', done => {
    chai
      .request(server)
      .get(`/venues/${venueId}`)
      .query({ userId: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        done();
      });
  });

  it('should update venue name via PATCH /venues/{venueId} (venue1)', done => {
    chai
      .request(server)
      .patch(`/venues/${venueId}`)
      .send({ name: 'New venue name' })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fail to update venue with incorrectly formatted data via PATCH /venues/{venueId} (venue1)', done => {
    chai
      .request(server)
      .patch(`/venues/${venueId}`)
      .send({ badData: { data: 'fakeStuff' } })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should verify that venue keys are still correct via GET /venues/{venueId}/ (venue1)', done => {
    chai
      .request(server)
      .get(`/venues/${venueId}/`)
      .query({ userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        done();
      });
  });

  it('should fail to update venue with incorrect id via PATCH /venues/{venueId}', done => {
    chai
      .request(server)
      .patch('/venues/1234')
      .send({ name: 'Test' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should fail to update venue with invalid id via PATCH /venues/{venueId}', done => {
    chai
      .request(server)
      .patch('/venues/FAKEID')
      .send({ name: 'Test' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should get venue details via GET /venues/:venueId/ (user1)', done => {
    chai
      .request(server)
      .get(`/venues/${venueId}/`)
      .query({ userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venue).to.have.keys(VENUE_KEYS);
        done();
      });
  });

  it('should get a list of venues via GET /venues/ with count=10&page=1 (user1)', done => {
    chai
      .request(server)
      .get('/venues/')
      .query({ userId, count: 10, page: 1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venues).to.have.length(10);
        expect(res.body.venues[0]).to.have.keys(VENUE_KEYS);
        done();
      });
  });

  it('should return a 400 error via GET /venues/ with count=0&page=1 (user1)', done => {
    chai
      .request(server)
      .get('/venues/')
      .query({ userId, count: 0, page: 1 })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should get a list of venues with count=1&page=3 via GET /venues/ (user1)', done => {
    chai
      .request(server)
      .get('/venues/')
      .query({ userId, count: 1, page: 3 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.venues).to.have.length(1);
        done();
      });
  });

  it('should delete a venue via DELETE /venues/:venueId (user1)', done => {
    chai
      .request(server)
      .delete(`/venues/${venueId}`)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('testing venue errors', () => {
  it('should return 400 if ID is invalid via GET /venues/:venueId', done => {
    chai
      .request(server)
      .get('/venues/FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return 400 and undefined venue if ID is incorrect via GET /venues/:venueId', done => {
    chai
      .request(server)
      .get('/venues/' + new ObjectId(1234).toString())
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.venue).to.equal(undefined);
        done();
      });
  });

  it('should return 500 if data is incorrectly formatted via POST /venues/', done => {
    chai
      .request(server)
      .post('/venues/')
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should return 400 if ID is invalid via DELETE /venues/:venueId', done => {
    chai
      .request(server)
      .delete('/venues/FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return 400 if ID is incorrect via DELETE /venues/:venueId', done => {
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
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    await server.close();
  }
});
