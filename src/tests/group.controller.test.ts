import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  GROUP_KEYS_TEST,
  TEST_GROUP2,
  TEST_USER_1,
  TEST_USER_2,
  TEST_USER_3,
  TEST_USER_4,
  TEST_USER_5,
  USER_KEYS_TEST,
} from './data/testData';
import { ObjectId } from 'mongodb';
import { Server } from 'http';
import { nightlightQueue } from '../queue/setup/queue.setup';
import { useTestingDatabase } from '../../src/config/mongodb.config';
import Group from '../models/Group.model';
import User from '../models/User.model';
import Venue from '../models/Venue.model';
import Notification from '../models/Notification.model';

require('dotenv').config();

chai.use(chaiHttp);
chai.should();

const app = createServer({ shouldRunBullBoard: false });
let server: Server;

const connectToMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(useTestingDatabase(), {
      useNewUrlParser: true,
    } as ConnectOptions);
  } catch (error) {
    console.error(error);
  }
};

before(async () => {
  await connectToMongo();
  server = app.listen(6070);
  await nightlightQueue.drain();
  await User.deleteMany({});
  await Group.deleteMany({});
  await Venue.deleteMany({});
  await Notification.deleteMany({});
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  let userIdFriend6: string;
  it('should create user6 via POST /users/ (friend5)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_5)
      .then(res => {
        userIdFriend6 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  let userIdMain: string;
  it('should create main user with 6 friends via POST /users/', done => {
    chai
      .request(server)
      .post('/users/')
      .send({
        ...TEST_USER_3,
        friends: [
          userIdFriend1,
          userIdFriend2,
          userIdFriend3,
          userIdFriend4,
          userIdFriend5,
          userIdFriend6,
        ],
      })
      .then(res => {
        userIdMain = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
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
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
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
      .query({ userIds: userIdFriend1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        expect(res.body.users[0].invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should get the second invited friend user object via GET /users/{userId}', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: userIdFriend2 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        expect(res.body.users[0].invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should get the third invited friend user object via GET /users/{userId} (friend5)', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        expect(res.body.users[0].invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should invite a new member to a group via PATCH /group/{groupId}/invite-members (friend3)', done => {
    chai
      .request(server)
      .patch(`/groups/${groupId}/invite-members`)
      .query({ userId: userIdMain })
      .send({ users: [userIdFriend3] })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should invite a new member to a group via PATCH /group/{groupId}/invite-members (friend6)', done => {
    chai
      .request(server)
      .patch(`/groups/${groupId}/invite-members`)
      .query({ userId: userIdMain })
      .send({ users: [userIdFriend6] })
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
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        expect(res.body.group.invitedMembers).to.include(userIdFriend3);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend4);
        expect(res.body.group.invitedMembers).to.include(userIdFriend5);
        expect(res.body.group.invitedMembers).to.include(userIdFriend6);
        done();
      });
  });

  it('should remove a member invitation via PATCH /group/{groupId}/remove-member-invitation', done => {
    chai
      .request(server)
      .patch(`/groups/${groupId}/remove-member-invitation`)
      .query({ userId: userIdFriend3 })
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should decline a member invitation via PATCH /users/${userId}/decline-group-invitation (friend6)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend6}/decline-group-invitation`)
      .query({ groupId: groupId })
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
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend3);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend4);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend6);
        expect(res.body.group.invitedMembers).to.include(userIdFriend5);
        done();
      });
  });

  it('should accept a group invitation via PATCH /users/{userId}/accept-group-invitation', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend2}/accept-group-invitation`)
      .query({ groupId: groupId })
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch the notifications via GET /users/:userId/notifications', done => {
    chai
      .request(server)
      .get(`/notifications/`)
      .query({ userId: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        const notifications = res.body.notifications;
        // one of the notifications should be the friend request from 3 to 2
        expect(notifications).to.satisfy((nots: any[]) => {
          return nots.some(
            not =>
              not.data.notificationType === 'groupInvite' &&
              not.data.groupId === groupId &&
              not.data.senderId === userIdMain &&
              not.recipientId === userIdFriend5
          );
        });
        done();
      })
      .catch(err => done(err));
  });

  it('should accept group invitation and add member to group (userIdFriend5)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend5}/accept-group-invitation`)
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        setTimeout(() => {
          done();
        }, 2000);
      });
  });

  it('should fetch the notifications after invite accepted via GET /users/:userId/notifications', done => {
    chai
      .request(server)
      .get(`/notifications/`)
      .query({ userId: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        const notifications = res.body.notifications;
        // one of the notifications should be the friend request from 3 to 2
        expect(notifications).to.satisfy((nots: any[]) => {
          return nots.every(
            not =>
              !(
                not.data.notificationType == 'groupInvite' &&
                not.data.groupId == groupId &&
                not.data.senderId == userIdMain &&
                not.recipientId == userIdFriend5
              )
          );
        });
        done();
      })
      .catch(err => done(err));
  });

  it('should return group information after invitation accepted', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
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
      .query({ userIds: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys([
          ...USER_KEYS_TEST,
          'currentGroup',
        ]);
        expect(res.body.users[0].invitedGroups).to.have.length(0);
        expect(res.body.users[0].currentGroup).to.equal(groupId);
        done();
      });
  });

  it('should allow user to leave group (userIdFriend5)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend5}/leave-group`)
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
      .query({ userIds: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys([...USER_KEYS_TEST]);
        expect(res.body.users[0].invitedGroups).to.have.length(0);
        expect(res.body.users[0].currentGroup).to.be.undefined;
        done();
      });
  });

  it('should return group information after user leaves group', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
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
      .query({ userIds: userIdFriend2 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys([
          ...USER_KEYS_TEST,
          'currentGroup',
        ]);
        expect(res.body.users[0].invitedGroups).to.have.length(0);
        expect(res.body.users[0].currentGroup).to.equal(groupId);
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
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
        setTimeout(function () {
          done();
        }, 6000);
      });
  });

  it('should return no group information (400) after group expires', done => {
    chai
      .request(server)
      .get('/groups/')
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should check if user currentGroup is undefined after expiration', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: userIdMain })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0].currentGroup).to.be.undefined;
        expect(res.body.users[0].invitedGroups).to.not.include(groupId);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });
});

describe('testing group deletion after less than 2 members', () => {
  let userIdFriend1: string;
  it('should create user1 via POST /users/ (friend1)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_1)
      .then(res => {
        userIdFriend1 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  let userIdFriend6: string;
  it('should create user6 via POST /users/ (friend5)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_5)
      .then(res => {
        userIdFriend6 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  let userIdMain: string;
  it('should create main user with 6 friends via POST /users/', done => {
    chai
      .request(server)
      .post('/users/')
      .send({
        ...TEST_USER_3,
        friends: [
          userIdFriend1,
          userIdFriend2,
          userIdFriend3,
          userIdFriend4,
          userIdFriend5,
          userIdFriend6,
        ],
      })
      .then(res => {
        userIdMain = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
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
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
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
      .query({ userIds: userIdFriend1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        expect(res.body.users[0].invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should get the second invited friend user object via GET /users/{userId}', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: userIdFriend2 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        expect(res.body.users[0].invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should get the third invited friend user object via GET /users/{userId} (friend5)', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: userIdFriend5 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        expect(res.body.users[0].invitedGroups).to.include(groupId);
        done();
      });
  });

  it('should invite a new member to a group via PATCH /group/{groupId}/invite-members (friend3)', done => {
    chai
      .request(server)
      .patch(`/groups/${groupId}/invite-members`)
      .query({ userId: userIdMain })
      .send({ users: [userIdFriend3] })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should invite a new member to a group via PATCH /group/{groupId}/invite-members (friend6)', done => {
    chai
      .request(server)
      .patch(`/groups/${groupId}/invite-members`)
      .query({ userId: userIdMain })
      .send({ users: [userIdFriend6] })
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
        expect(res.body.group).to.have.keys(GROUP_KEYS_TEST);
        expect(res.body.group.members).to.include(userIdMain);
        expect(res.body.group.invitedMembers).to.include(userIdFriend1);
        expect(res.body.group.invitedMembers).to.include(userIdFriend2);
        expect(res.body.group.invitedMembers).to.include(userIdFriend3);
        expect(res.body.group.invitedMembers).to.not.include(userIdFriend4);
        expect(res.body.group.invitedMembers).to.include(userIdFriend5);
        expect(res.body.group.invitedMembers).to.include(userIdFriend6);
        done();
      });
  });

  it('should accept group invitation and add member to group (userIdFriend1)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend1}/accept-group-invitation`)
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should accept group invitation and add member to group (userIdFriend2)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend2}/accept-group-invitation`)
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should accept group invitation and add member to group (userIdFriend3)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend3}/accept-group-invitation`)
      .query({ groupId: groupId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should allow user to leave group (userIdFriend1)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend1}/leave-group`)
      .query({ groupId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return user information after leaving group (userIdFriend1)', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userIdFriend1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys([...USER_KEYS_TEST]);
        expect(res.body.users[0].invitedGroups).to.have.length(0);
        expect(res.body.users[0].currentGroup).to.be.undefined;
        done();
      });
  });

  it('should allow user to leave group (userIdFriend2)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend2}/leave-group`)
      .query({ groupId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return user information after leaving group (userIdFriend2)', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userIdFriend2 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys([...USER_KEYS_TEST]);
        expect(res.body.users[0].invitedGroups).to.have.length(0);
        expect(res.body.users[0].currentGroup).to.be.undefined;
        done();
      });
  });

  it('should allow user to leave group (userIdFriend3)', done => {
    chai
      .request(server)
      .patch(`/users/${userIdFriend3}/leave-group`)
      .query({ groupId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return user information after leaving group (userIdFriend3)', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userIdFriend3 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys([...USER_KEYS_TEST]);
        expect(res.body.users[0].invitedGroups).to.have.length(0);
        expect(res.body.users[0].currentGroup).to.be.undefined;
        done();
      });
  });

  it('should return no group information after user leaves group (400)', done => {
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
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
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

  it('should return a 400 status for POST /groups/ with incorrectly formatted data', done => {
    chai
      .request(server)
      .post('/groups/')
      .query({ userId: userId })
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(400);
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
