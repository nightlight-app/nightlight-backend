import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { GROUP_KEYS, TEST_GROUP } from './testData';
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
  server = app.listen(6060);
});

describe('testing group actions', () => {
  let groupId: string;

  it('POST /group', done => {
    chai
      .request(server)
      .post('/groups/')
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
      .get('/groups/' + groupId)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        done();
      });
  });

  it('DELETE /group/{groupId}', done => {
    chai
      .request(server)
      .delete('/groups/' + groupId)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('testing group errors', () => {
  it('GET /group/{groupId} Invalid ID', done => {
    chai
      .request(server)
      .get('/groups/' + 'FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('GET /group/{groupId} Incorrect ID', done => {
    chai
      .request(server)
      .get('/groups/' + new ObjectId(1234).toString())
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.venue).to.equal(undefined);
        done();
      });
  });

  it('POST /group incorrectly formatted data', done => {
    chai
      .request(server)
      .post('/groups')
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('DELETE /group/{groupId} Invalid ID', done => {
    chai
      .request(server)
      .delete('/groups/' + 'FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('DELETE /group/{groupId} Incorrect ID', done => {
    chai
      .request(server)
      .delete('/groups/' + new ObjectId(1234).toString())
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
