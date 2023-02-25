import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  GROUP_KEYS,
  TEST_GROUP2,
  TEST_USER_1,
  TEST_USER_2,
  TEST_USER_3,
  TEST_USER_4,
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
  server = app.listen(6060);
});

describe('testing group actions', () => {
  let userIdFriend1: string;
  it('POST /user1 for group test', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_1)
      .then(res => {
        userIdFriend1 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let userIdFriend2: string;
  it('POST /user1 for group test', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_2)
      .then(res => {
        userIdFriend2 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let userIdFriend3: string;
  it('POST /user1 for group test', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_3)
      .then(res => {
        userIdFriend3 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let userIdFriend4: string;
  it('POST /user1 for group test', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_4)
      .then(res => {
        userIdFriend4 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let userIdMain: string;
  it('POST /user1 for group test', done => {
    chai
      .request(server)
      .post('/users/')
      .send({
        ...TEST_USER_3,
        friends: [userIdFriend1, userIdFriend2, userIdFriend3, userIdFriend4],
      })
      .then(res => {
        userIdMain = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let groupId: string;
  it('POST /group', done => {
    chai
      .request(server)
      .post('/groups/?userId=' + userIdMain)
      .send({
        ...TEST_GROUP2,
        invitedMembers: [userIdFriend1, userIdFriend2],
        members: [userIdMain],
      })
      .then(res => {
        groupId = res.body.group._id;
        expect(res).to.have.status(200);
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
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        done();
      });
  });

  it('GET /user/{userId} for first friend invited', done => {
    chai
      .request(server)
      .get('/users/?userId=' + userIdFriend1)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        expect(res.body.user.invitedGroups).to.include(groupId);
        done();
      });
  });

  it('GET /user/{userId} for second friend invited', done => {
    chai
      .request(server)
      .get('/users/?userId=' + userIdFriend2)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        expect(res.body.user.invitedGroups).to.include(groupId);
        done();
      });
  });

  it('PATCH /group/{groupId}/inviteMembers', done => {
    chai
      .request(server)
      .patch('/groups/' + groupId + '/inviteMembers')
      .send([userIdFriend3])
      .then(res => {
        expect(res).to.have.status(200);
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
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        expect(res.body.group.invitedMembers).to.include(userIdFriend3);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend4);
        done();
      });
  });

  it('PATCH /group/{groupId}/removeMemberInvitation', done => {
    chai
      .request(server)
      .patch(
        '/groups/' +
          groupId +
          '/removeMemberInvitation/?userId=' +
          userIdFriend3
      )
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /group/{groupId} after invitation removed', done => {
    chai
      .request(server)
      .get('/groups/' + groupId)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        done();
      });
  });

  it('PATCH /group/{groupId}/acceptGroupInvitation', done => {
    chai
      .request(server)
      .patch(
        '/users/' + userIdFriend2 + '/acceptGroupInvitation/?groupId=' + groupId
      )
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /group/{groupId} after invitation accepted', done => {
    chai
      .request(server)
      .get('/groups/' + groupId)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.members).to.include(userIdFriend2);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        done();
      });
  });

  it('GET /user/{userId} after invitation accepted', done => {
    chai
      .request(server)
      .get('/users/?userId=' + userIdFriend2)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys([...USER_KEYS, 'currentGroup']);
        expect(res.body.user.invitedGroups).to.have.length(0);
        expect(res.body.user.currentGroup).to.equal(groupId);
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
  let userId: string;
  it('POST /user for group error test', done => {
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
      .post('/groups/?userId=' + userId)
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

after(async () => {
  try {
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    server.close();
  }
});
