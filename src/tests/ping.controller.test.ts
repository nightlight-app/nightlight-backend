import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { Server } from 'http';
import { ObjectId } from 'mongodb';
import { TEST_USER_1, TEST_USER_2 } from './data/testData';
import { useTestingDatabase } from '../../src/config/mongodb.config';
import Group from '../models/Group.model';
import User from '../models/User.model';
import Venue from '../models/Venue.model';
import Notification from '../models/Notification.model';
import { PingStatus } from '../interfaces/Ping.interface';
import { nightlightQueue } from '../queue/setup/queue.setup';
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
  server = app.listen(6066);
  await User.deleteMany({});
  await Group.deleteMany({});
  await Venue.deleteMany({});
  await Notification.deleteMany({});
  await nightlightQueue.drain();
});

describe('test pings controller', () => {
  let userId1: string;
  it('should create a new user (sender) via POST /users', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_2)
      .then(res => {
        userId1 = res.body.user._id;
        const user = res.body.user;
        expect(res).to.have.status(201);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(TEST_USER_2.email);
        done();
      })
      .catch(err => done(err));
  });

  let userId2: string;
  it('should create a new user (recipient) via POST /users', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_1)
      .then(res => {
        userId2 = res.body.user._id;
        const user = res.body.user;
        expect(res).to.have.status(201);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(TEST_USER_1.email);
        done();
      })
      .catch(err => done(err));
  });

  let pingId: string;
  it('should create a new ping via POST /pings', done => {
    const now = new Date();
    const future = new Date(now.getTime() + 10 * 60 * 1000);

    chai
      .request(server)
      .post('/pings/')
      .send({
        senderId: userId1,
        recipientId: userId2,
        message: 'Hello world!',
        expirationDatetime: future.toUTCString(),
      })
      .then(res => {
        const ping = res.body.ping;
        pingId = ping._id;
        expect(res).to.have.status(201);
        expect(ping).to.be.an('object');
        expect(ping).to.have.property('_id');
        expect(ping.senderId).to.equal(userId1);
        expect(ping.recipientId).to.equal(userId2);
        done();
      })
      .catch(err => done(err));
  });

  it('should get recipient with pings via GET /users/:userId', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId2 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(TEST_USER_1.email);
        expect(user.receivedPings).to.be.an('array');
        expect(user.receivedPings).to.have.length(1);
        expect(user.receivedPings[0]._id).to.equal(pingId);
        done();
      })
      .catch(err => done(err));
  });

  it('should get sender with pings via GET /users/:userId', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId1 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(TEST_USER_2.email);
        expect(user.sentPings).to.be.an('array');
        expect(user.sentPings).to.have.length(1);
        expect(user.sentPings[0]._id).to.equal(pingId);
        done();
      })
      .catch(err => done(err));
  });

  it('should respond to ping via PATCH /pings/:pingId/respond', done => {
    chai
      .request(server)
      .patch(`/pings/${pingId}/respond`)
      .send({
        response: PingStatus.RESPONDED_OKAY,
      })
      .then(res => {
        const ping = res.body.ping;
        expect(res).to.have.status(200);
        expect(ping).to.be.an('object');
        expect(ping).to.have.property('_id');
        expect(ping.senderId).to.equal(userId1);
        expect(ping.recipientId).to.equal(userId2);
        expect(ping.status).to.equal(PingStatus.RESPONDED_OKAY);
        done();
      })
      .catch(err => done(err));
  });

  it('should respond to ping via PATCH /pings/:pingId/respond', done => {
    chai
      .request(server)
      .patch(`/pings/${pingId}/respond`)
      .send({
        response: PingStatus.RESPONDED_NOT_OKAY,
      })
      .then(res => {
        const ping = res.body.ping;
        expect(res).to.have.status(200);
        expect(ping).to.be.an('object');
        expect(ping).to.have.property('_id');
        expect(ping.senderId).to.equal(userId1);
        expect(ping.recipientId).to.equal(userId2);
        expect(ping.status).to.equal(PingStatus.RESPONDED_NOT_OKAY);
        done();
      })
      .catch(err => done(err));
  });

  let pingId2: string;
  it('should create a new ping for expiration via POST /pings', done => {
    const now = new Date();
    const future = new Date(now.getTime() + 10 * 60 * 1000);

    chai
      .request(server)
      .post('/pings/')
      .send({
        senderId: userId1,
        recipientId: userId2,
        message: 'Hello world 2!',
        expirationDatetime: future.toUTCString(),
      })
      .then(res => {
        const ping = res.body.ping;
        pingId = ping._id;
        expect(res).to.have.status(201);
        expect(ping).to.be.an('object');
        expect(ping).to.have.property('_id');
        expect(ping.senderId).to.equal(userId1);
        expect(ping.recipientId).to.equal(userId2);
        setTimeout(function () {
          done();
        }, 6000);
      })
      .catch(err => done(err));
  });

  it('should get sender after expiration with pings via GET /users/:userId', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId1 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(TEST_USER_2.email);
        expect(user.sentPings).to.have.length(2);
        expect(user.sentPings[1].status).to.equal(PingStatus.EXPIRED);
        done();
      })
      .catch(err => done(err));
  });

  it('should get recipient after expiration with pings via GET /users/:userId', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId2 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(TEST_USER_1.email);
        expect(user.receivedPings).to.have.length(2);
        expect(user.receivedPings[1].status).to.equal(PingStatus.EXPIRED);
        done();
      })
      .catch(err => done(err));
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
