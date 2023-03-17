import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { Server } from 'http';
import { ObjectId } from 'mongodb';
require('dotenv').config();

chai.use(chaiHttp);
chai.should();

const app = createServer({ shouldRunBullBoard: false });
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
  server = app.listen(6065);
});

/* NOTIFICATION TESTS */
describe('test notification controller', () => {
  it('should send notification to user database via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: [new ObjectId(12345).toString()],
        title: 'Test Title',
        body: 'Test Body',
        data: { test: 'test' },
        notificationType: 'test',
        delay: 0,
      })
      .then(res => {
        expect(res).to.have.status(201);
        done();
      });
  });
});

describe('test notification controller errors', () => {
  it('should return error when sending notification with bad data (missing title) via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: [new ObjectId(12345).toString()],
        body: 'Test Body',
        data: { test: 'test' },
        notificationType: 'test',
        delay: 0,
      })
      .then(res => {
        expect(res).to.have.status(500);
        expect(res.body.message).to.equal(
          'Missing required fields to create notification for database.'
        );
        done();
      });
  });

  it('should return error when sending notification with bad data (missing data) via POST /notifications', done => {
    chai
      .request(server)
      .post('/notifications')
      .send({
        userIds: [new ObjectId(12345).toString()],
        title: 'Test Title',
        body: 'Test Body',
        notificationType: 'test',
        delay: 0,
      })
      .then(res => {
        expect(res).to.have.status(500);
        expect(res.body.message).to.equal(
          'Missing required fields to create notification for database.'
        );
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
        notificationType: 'test',
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
        notificationType: 'test',
        delay: -3,
      })
      .then(res => {
        expect(res).to.have.status(500);
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
