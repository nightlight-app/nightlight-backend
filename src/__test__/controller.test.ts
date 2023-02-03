import mongoose, { ConnectOptions, models } from 'mongoose';
import supertest from 'supertest';
import createServer from '../server';

require('dotenv').config();

const app = createServer();
let server: any;

beforeEach(done => {
  mongoose.connect(
    process.env.MONGODB_URI || '',
    { useNewUrlParser: true } as ConnectOptions,
    () => done()
  );

  server = app.listen(6060);
});

afterEach(done => {
  mongoose.connection.close(() => done());

  server.close();
});

describe('Test the path', () => {
  test('returns status code 201 if posted successfully', async () => {
    const response = supertest(server)
      .post('/posts')
      .send({ title: 'Test Title', body: 'this is my body' })
      .expect(201);
  });
});
