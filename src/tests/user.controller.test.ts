import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { TEST_USER_1, UPDATE_USER_1_TO_USER_2, USER_KEYS } from './testData';
import { ObjectId } from 'mongodb';

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
  server = app.listen(6062);
});

/* USER TESTS */
let userId: string;
describe('testing user actions', () => {
  it('POST /user', done => {
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

  it('GET /user/{userId}', done => {
    chai
      .request(server)
      .get('/users/' + userId)
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
      .patch('/users/' + userId)
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
      .delete('/users/' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('testing user errors', () => {
  it('GET /user/{userId} Invalid ID', done => {
    chai
      .request(server)
      .get('/users/' + 'FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('GET /user/{userId} Incorrect ID', done => {
    chai
      .request(server)
      .get('/users/' + new ObjectId(1234).toString())
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.venue).to.equal(undefined);
        done();
      });
  });

  it('POST /user incorrectly formatted data', done => {
    chai
      .request(server)
      .post('/users/')
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('UPDATE /user incorrectly formatted data', done => {
    chai
      .request(server)
      .patch('/users/' + new ObjectId(1234).toString())
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('UPDATE /user incorrect id', done => {
    chai
      .request(server)
      .patch('/users/' + new ObjectId(1234).toString())
      .send({ firstName: 'Test' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('UPDATE /user invalid id', done => {
    chai
      .request(server)
      .patch('/users/' + 'FAKEID')
      .send({ firstName: 'Test' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('DELETE /user/{userId} Invalid ID', done => {
    chai
      .request(server)
      .delete('/users/' + 'FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('DELETE /user/{userId} Incorrect ID', done => {
    chai
      .request(server)
      .delete('/users/' + new ObjectId(1234).toString())
      .then(res => {
        expect(res).to.have.status(400);
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
