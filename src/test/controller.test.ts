import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import { createTestUser } from '../testData/testData';
import chai from 'chai';
import chaiHttp from 'chai-http';

require('dotenv').config();

chai.use(chaiHttp);
chai.should();

const app = createServer();
let server: any;

beforeEach(() => {
  mongoose.connect(process.env.MONGODB_URI || '', {
    useNewUrlParser: true,
  } as ConnectOptions);

  server = app.listen(6060);
});

afterEach(() => {
  mongoose.connection.close();
  server.close();
});

describe('testing user actions', () => {
  const userData = createTestUser();

  it('POST /user', () => {
    const response = chai
      .request(server)
      .post('/user')
      .send({ title: 'Test Title', body: userData })
      .end((err, res) => res.should.have.status(201));
  });

  /*
  test('GET /user/:id', async () => {
    const response = supertest(server)
      .post('/user/' + userData.firebaseUid)
      .send({ title: 'Test Title', body: userData })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(response.body.email, 'john.doe@gmail.com');
      });
  });

  test('PATCH /user/:userId', async () => {
    const response = supertest(server)
      .patch('/user/' + userData.firebaseUid)
      .send({
        title: 'Test Title',
        body: { email: 'replaced.email@gmail.com' },
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(response.body.email, 'replaced.email@gmail.com');
      });
  });

  test('DELETE /user/:userId', async () => {
    const response = supertest(server)
      .delete('/user/' + userData.firebaseUid)
      .send()
      .set('Accept', 'application/json')
      .expect(200);
  });
  */
});
