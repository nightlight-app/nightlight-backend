import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  SAVED_GROUP,
  SAVED_GROUP_KEYS,
  TEST_USER_1,
  TEST_USER_2,
  UPDATE_USER_1_TO_USER_2,
  USER_KEYS,
} from './testData';
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

before(async () => {
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
      .get('/users/?userId=' + userId)
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

/* TEST SAVE GROUPS */
describe('testing save groups', () => {
  it('POST /user for save groups', done => {
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

  it('PATCH /user/{userId}/saveGroup', done => {
    chai
      .request(server)
      .patch('/users/' + userId + '/saveGroup')
      .send(SAVED_GROUP)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  let groupId: string;
  it('GET /user/{userId} for save groups', done => {
    chai
      .request(server)
      .get('/users/?userId=' + userId)
      .then(res => {
        groupId = res.body.user.savedGroups[2]._id;
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        expect(res.body.user.savedGroups[2]).to.have.keys(SAVED_GROUP_KEYS);
        expect(res.body.user.savedGroups[2].name).to.equal('Test group');
        expect(res.body.user.savedGroups[2].users).to.have.length(3);
        done();
      });
  });

  it('PATCH /user/{userId}/deleteSavedGroup', done => {
    chai
      .request(server)
      .patch('/users/' + userId + '/deleteSavedGroup/?savedGroupId=' + groupId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /user/{userId} for save group deleted', done => {
    chai
      .request(server)
      .get('/users/?userId=' + userId)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        expect(res.body.user.savedGroups).to.have.length(2);
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

/* TEST SAVE GROUPS */
describe('testing save groups', () => {
  const testData = { ...TEST_USER_1 };
  let userId2: string;
  it('POST /user2 for save groups', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_2)
      .then(res => {
        userId2 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        testData.friends.push(new mongoose.Types.ObjectId(userId2!));
        done();
      });
  });

  let userId3: string;
  it('POST /user3 for save groups', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_2)
      .then(res => {
        userId3 = res.body.user._id;
        testData.friends.push(new mongoose.Types.ObjectId(userId3!));
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  it('POST /user1 for save groups', done => {
    chai
      .request(server)
      .post('/users/')
      .send(testData)
      .then(res => {
        userId = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  it('GET /user/{userId}/getFriends', done => {
    chai
      .request(server)
      .get('/users/' + userId + '/getFriends')
      .then(res => {
        console.log(res.error.message);
        expect(res).to.have.status(200);
        expect(res.body.friends).to.have.length(2);
        done();
      });
  });
});

/* TEST USER ERRORS */
describe('testing user errors', () => {
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

  it('GET /user/{userId} Invalid ID', done => {
    chai
      .request(server)
      .get('/users/?userId=' + 'FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('POST /user for save groups', done => {
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

  it('GET /user/{userId} Incorrect ID', done => {
    chai
      .request(server)
      .get('/users/?userId=' + new ObjectId(1234))
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
      .patch('/users/' + userId)
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /user/{userId} verify keys are still correct', done => {
    chai
      .request(server)
      .get('/users/?userId=' + userId)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  it('UPDATE /user incorrect id', done => {
    chai
      .request(server)
      .patch('/users/' + new ObjectId(1234))
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
      .delete('/users/' + new ObjectId(1234))
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

after(async () => {
  try {
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    server.close();
  }
});
