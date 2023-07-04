import { TEST_USER_2 } from './data/testData';
import createServer from '../server';
import { useTestingDatabase } from '../../src/config/mongodb.config';
import Group from '../models/Group.model';
import User from '../models/User.model';
import Venue from '../models/Venue.model';
import Notification from '../models/Notification.model';
import { ObjectId } from 'mongodb';
import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import type { Server } from 'http';
import type { ConnectOptions } from 'mongoose';
dotenv.config();

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

before(async done => {
  connectToMongo();
  server = app.listen(6065);
  User.deleteMany({});
  Group.deleteMany({});
  Venue.deleteMany({});
  Notification.deleteMany({});
  done();
});

/* NOTIFICATION TESTS */
describe('test notification controller', () => {
  let userId: string;
  it('should create a new user via POST /users', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_2)
      .then(res => {
        userId = res.body.user._id;
        const user = res.body.user;
        expect(res).to.have.status(201);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(TEST_USER_2.email);
        done();
      })
      .catch(err => done(err));
  });

  it('should send notification to user database via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: [userId],
        title: 'Test Title 1',
        body: 'Test Body 1',
        data: { test: 'test 1' },
        delay: 0,
      })
      .then(res => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('should send multiple notifications to user database via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: [
          userId,
          new ObjectId(12345).toString(),
          new ObjectId(54321).toString(),
        ],
        title: 'Test Title 2',
        body: 'Test Body 2',
        data: { test: 'test 2' },
        delay: 0,
      })
      .then(res => {
        expect(res).to.have.status(201);
        done();
      });
  });

  let notificationId1: string;
  it('should get all notifications for user via GET /notifications', done => {
    chai
      .request(server)
      .get(`/notifications`)
      .query({ userId: userId })
      .then(res => {
        notificationId1 = res.body.notifications[0]._id;
        expect(res).to.have.status(200);
        expect(res.body.notifications).to.be.an('array');
        expect(
          res.body.notifications.filter(
            (notification: any) => notification.title === 'Test Title 1'
          )
        ).to.be.an('array');
        expect(
          res.body.notifications.filter(
            (notification: any) => notification.title === 'Test Title 2'
          )
        ).to.be.an('array');
        done();
      });
  });

  it('should delete notification from user database via DELETE /notifications', done => {
    chai
      .request(server)
      .delete(`/notifications/${notificationId1}`)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should get all notifications for user after deletion via GET /notifications', done => {
    chai
      .request(server)
      .get(`/notifications`)
      .query({ userId: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.notifications).to.be.an('array');
        expect(
          res.body.notifications.filter(
            (notification: any) => notification.title === 'Test Title 2'
          )
        ).to.be.an('array');
        done();
      });
  });
});

describe('test notification controller errors', () => {
  it('should return 400 error when sending notification with bad data (missing title) via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: [new ObjectId(12345).toString()],
        body: 'Test Body',
        data: { test: 'test' },
        delay: 0,
      })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('Missing keys: title. ');
        done();
      });
  });

  it('should return 400 error when sending notification with bad data (missing data) via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: [new ObjectId(12345).toString()],
        title: 'Test Title',
        body: 'Test Body',
        delay: 0,
      })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('Missing keys: data. ');
        done();
      });
  });

  it('should have no error when sending notification with invalid id via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: ['bad id'],
        title: 'Test Title',
        body: 'Test Body',
        data: { test: 'test' },
        delay: 0,
      })
      .then(res => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('should return error when sending notification with invalid delay via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: [new ObjectId(12345).toString()],
        title: 'Test Title',
        body: 'Test Body',
        data: { test: 'test' },
        delay: -3,
      })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('Delay must be a positive number.');
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
