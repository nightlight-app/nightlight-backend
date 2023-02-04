import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import testUser from './testUser';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import exp from 'constants';

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

describe('testing user actions', () => {
  let userId: string;

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

  it('GET /user', done => {
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

  it('DELETE /user', done => {
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
