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
        expect(res).to.have.status(201);
        expect(ping).to.be.an('object');
        expect(ping).to.have.property('_id');
        expect(ping.senderId).to.equal(userId1);
        expect(ping.recipientId).to.equal(userId2);
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
