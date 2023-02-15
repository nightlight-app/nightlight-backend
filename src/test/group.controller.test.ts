import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { GROUP_KEYS, TEST_GROUP } from './testData';

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
      .post('/group')
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
      .get('/group/' + groupId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        done();
      });
  });

  it('DELETE /group/{groupId}', done => {
    chai
      .request(server)
      .delete('/group/' + groupId)
      .send()
      .then(res => {
        expect(res).to.have.status(204);
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
