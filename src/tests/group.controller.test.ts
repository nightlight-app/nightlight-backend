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
  TEST_USER_5,
  USER_KEYS,
} from './testData';
import { ObjectId } from 'mongodb';
import { Server } from 'http';
import { nightlightQueue } from '../queue/setup/queue.setup';

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
  server = app.listen(6060);
  await nightlightQueue.drain();
});

describe('testing group actions', () => {
  let userIdFriend1: string;
  it('should create user1 via POST /users/ (friend1)', done => {
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
  it('should create user2 via POST /users/ (friend2)', done => {
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
  it('should create user3 via POST /users/ (friend3)', done => {
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
  it('should create user4 via POST /users/ (friend4)', done => {
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

  let userIdFriend5: string;
  it('should create user5 via POST /users/ (friend5)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_5)
      .then(res => {
        userIdFriend5 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let userIdMain: string;
  it('should create main user with 5 friends via POST /users/', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_3)
      .query({
        friends: [
          userIdFriend1,
          userIdFriend2,
          userIdFriend3,
          userIdFriend4,
          userIdFriend5,
        ],
      })
      .then(res => {
        userIdMain = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS);
        done();
      });
  });

  let groupId: string;
  it('should create a new group via POST /groups/ (group2)', done => {
    chai
      .request(server)
      .post('/groups/')
      .query({ userId: userIdMain })
      .send({
        ...TEST_GROUP2,
        invitedMembers: [userIdFriend1, userIdFriend2, userIdFriend5],
        members: [userIdMain],
      })
      .then(res => {
        groupId = res.body.group._id;
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        done();
      });
  });

  it('should get the created group via GET /groups/{groupId}', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        expect(res.body.group.invitedMembers).to.include(userIdFriend5);
        done();
      });
  });

  it('should get the first invited friend user object via GET /users/{userId}', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userId: userIdFriend1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        expect(res.body.user.invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should get the second invited friend user object via GET /users/{userId}', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userId: userIdFriend2 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        expect(res.body.user.invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should get the third invited friend user object via GET /users/{userId} (friend5)', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userId: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys(USER_KEYS);
        expect(res.body.user.invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should invite a new member to a group via PATCH /group/{groupId}/inviteMembers', done => {
    chai
      .request(server)
      .patch(`/groups/${groupId}/inviteMembers`)
      .send([userIdFriend3])
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should get a group by id via GET /group/{groupId}', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        expect(res.body.group.invitedMembers).to.include(userIdFriend3);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend4);
        expect(res.body.group.invitedMembers).to.include(userIdFriend5);
        done();
      });
  });

  it('should remove a member invitation via PATCH /group/{groupId}/removeMemberInvitation', done => {
    chai
      .request(server)
      .patch(`/groups/${groupId}/removeMemberInvitation`)
      .query({ userId: userIdFriend3 })
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should get a group by id after member invitation removed via GET /group/{groupId}', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend3);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend4);
        expect(res.body.group.invitedMembers).to.include(userIdFriend5);
        done();
      });
  });

  it('should accept a group invitation via PATCH /users/{userId}/acceptGroupInvitation', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend2}/acceptGroupInvitation`)
      .query({ groupId: groupId })
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should accept group invitation and add member to group (userIdFriend5)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend5}/acceptGroupInvitation`)
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return group information after invitation accepted', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.members).to.include(userIdFriend2);
        expect(res.body.group.members).to.include(userIdFriend5);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        done();
      });
  });

  it('should return user information before leaving group (userIdFriend5)', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys([...USER_KEYS, 'currentGroup']);
        expect(res.body.user.invitedGroups).to.have.length(0);
        expect(res.body.user.currentGroup).to.equal(groupId);
        done();
      });
  });

  it('should allow user to leave group (userIdFriend5)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend5}/leaveGroup`)
      .query({ groupId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return user information after leaving group (userIdFriend5)', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys([...USER_KEYS]);
        expect(res.body.user.invitedGroups).to.have.length(0);
        expect(res.body.user.currentGroup).to.be.undefined;
        done();
      });
  });

  it('should return group information after user leaves group', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.members).to.include(userIdFriend2);
        expect(res.body.group.members).to.not.include(userIdFriend5);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        done();
      });
  });

  it('should return user information after invitation accepted (userIdFriend2)', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userIdFriend2 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.user).to.have.keys([...USER_KEYS, 'currentGroup']);
        expect(res.body.user.invitedGroups).to.have.length(0);
        expect(res.body.user.currentGroup).to.equal(groupId);
        done();
      });
  });

  it('should return group information before group expires', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS);
        setTimeout(function () {
          done();
        }, 6000);
      });
  });

  it('should return group information after group expires', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

describe('testing group errors', () => {
  let userId: string;
  it('should create a new user via POST /users/ (user1)', done => {
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

  it('should return a 400 status for GET /groups/:groupId with an invalid ID', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: 'FAKEID' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return a 400 status for GET /groups/:groupId with an incorrect ID', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: new ObjectId(1234).toString() })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.venue).to.equal(undefined);
        done();
      });
  });

  it('should return a 500 status for POST /groups/ with incorrectly formatted data', done => {
    chai
      .request(server)
      .post('/groups/')
      .query({ userId: userId })
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should return a 400 status for DELETE /groups/:groupId with an invalid ID', done => {
    chai
      .request(server)
      .delete('/groups/FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return a 400 status for DELETE /groups/:groupId with an incorrect ID', done => {
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
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    await server.close();
  }
});
