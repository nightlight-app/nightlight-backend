import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import { createTestUser } from './testData';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

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

describe('testing user actions', () => {
  const userData = createTestUser();

  it('POST /user', done => {
    chai
      .request(server)
      .post('/user')
      .send({ title: 'Test Title', body: userData })
      .then(res => {
        expect(res).to.have.status(201);
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
