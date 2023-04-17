import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  SAVED_GROUP,
  SAVED_GROUP_KEYS,
  SEARCH_USER_1,
  SEARCH_USER_2,
  SEARCH_USER_3,
  TEST_EMERGENCY_CONTACT,
  TEST_USER_1,
  TEST_USER_2,
  TEST_USER_3,
  TEST_USER_4,
  TEST_USER_5,
  UPDATE_USER_1_TO_USER_2,
  USER_KEYS_TEST,
} from './data/testData';
import { ObjectId } from 'mongodb';
import { Server } from 'http';
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
  server = app.listen(6062);
  await User.deleteMany({});
  await Group.deleteMany({});
  await Venue.deleteMany({});
  await Notification.deleteMany({});
});

/* USER TESTS */

describe('testing user actions', () => {
  let userId: string;
  it('should create a new user via POST /users', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_2)
      .then(res => {
        userId = res.body.user._id;
        const user = res.body.user;
        expect(res).to.have.status(201);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(TEST_USER_2.email);
        done();
      })
      .catch(err => done(err));
  });

  it('should fetch a user via GET /users/?userIds={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user._id).to.equal(userId);
        expect(user.email).to.equal(TEST_USER_2.email);
        done();
      })
      .catch(err => done(err));
  });

  it('should update a user via PATCH /users/{userId}', done => {
    chai
      .request(server)
      .patch(`/users/${userId}`)
      .send(UPDATE_USER_1_TO_USER_2)
      .then(res => {
        const user = res.body.user;
        expect(res).to.have.status(200);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(UPDATE_USER_1_TO_USER_2.email);
        expect(user).to.have.keys(USER_KEYS_TEST);
        done();
      })
      .catch(err => done(err));
  });

  it('should update notification token for a user via PATCH /users/{userId}', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/add-notification-token`)
      .send({ notificationToken: 'ExponentPushToken[TestToken1234]' })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });

  it('should remove notification token for a user via PATCH /users/{userId}', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/remove-notification-token`)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });

  let emergencyContactId: string;
  it('should add an emergency contact via PATCH /users/{userId}/add-emergency-contact', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/add-emergency-contact`)
      .send(TEST_EMERGENCY_CONTACT)
      .then(res => {
        emergencyContactId = res.body.emergencyContact._id;
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });

  it('should get user to verify emergency contact via GET /users/', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0].emergencyContacts[0]).to.not.be.undefined;
        expect(res.body.users[0].emergencyContacts[0].name).to.equal(
          TEST_EMERGENCY_CONTACT.name
        );
        expect(res.body.users[0].emergencyContacts[0].phone).to.equal(
          TEST_EMERGENCY_CONTACT.phone
        );
        done();
      })
      .catch(err => done(err));
  });

  it('should update an emergency contact via PATCH /users/{userId}/update-emergency-contact', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/update-emergency-contact`)
      .query({ emergencyContactId: emergencyContactId })
      .send({ name: 'Test User', phone: '+14567891023' })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });

  it('should get user to verify update emergency contact via GET /users/', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0].emergencyContacts[0].name).to.equal('Test User');
        expect(res.body.users[0].emergencyContacts[0].phone).to.equal(
          '+14567891023'
        );
        done();
      })
      .catch(err => done(err));
  });

  it('should get emergency contacts via GET /users/{userId}/get-emergency-contacts', done => {
    chai
      .request(server)
      .get(`/users/${userId}/emergency-contacts`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.emergencyContacts).to.have.length(1);
        done();
      })
      .catch(err => done(err));
  });

  it('should remove an emergency contact via PATCH /users/{userId}/remove-emergency-contact', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/remove-emergency-contact`)
      .query({ emergencyContactId: emergencyContactId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });

  it('should get user to verify emergency contact delete via GET /users/', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0].emergencyContacts).to.have.length(0);
        done();
      })
      .catch(err => done(err));
  });

  it('should activate an emergency for a user via PATCH /users/{userId}/activate-emergency', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/activate-emergency`)
      .then(res => {
        expect(res).to.have.status(200);

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should get user to verify emergency contact delete via GET /users/', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0].isEmergency).to.equal(true);
        done();
      })
      .catch(err => done(err));
  });

  it('should deactivate an emergency for a user via PATCH /users/{userId}/activate-emergency', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/deactivate-emergency`)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });

  it('should get user to verify emergency contact delete via GET /users/', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0].isEmergency).to.equal(false);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should delete a user via DELETE /users/{userId}', done => {
    chai
      .request(server)
      .delete(`/users/${userId}`)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });
});

/* TEST SAVE GROUPS */
describe('testing save groups', () => {
  let userId: string, groupId: string;

  it('should save user via POST /users', done => {
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

  it('should add a savedGroup via PATCH /users/:userId/save-group', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/save-group`)
      .send(SAVED_GROUP)
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch the savedGroups of the user via GET /users/:userId', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: userId })
      .then(res => {
        groupId = res.body.users[0].savedGroups[2]._id;
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        expect(res.body.users[0].savedGroups[2]).to.have.keys(SAVED_GROUP_KEYS);
        expect(res.body.users[0].savedGroups[2].name).to.equal('Test group');
        expect(res.body.users[0].savedGroups[2].users).to.have.length(3);
        done();
      });
  });

  it('should delete a specific savedGroup via PATCH /users/:userId/delete-saved-group', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/delete-saved-group`)
      .query({ savedGroupId: groupId })
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should show the updated user data after deleting the savedGroup via GET /users/:userId', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        expect(res.body.users[0].savedGroups).to.have.length(2);
        done();
      });
  });

  it('should delete a user via DELETE /users/:userId', done => {
    chai
      .request(server)
      .delete(`/users/${userId}`)
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
  it('should create a new user via POST /users/ (user2)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_2)
      .then(res => {
        userId2 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        testData.friends?.push(new mongoose.Types.ObjectId(userId2!));
        done();
      });
  });

  let userId3: string;
  it('should create a new user via POST /users/ (user3)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_2)
      .then(res => {
        userId3 = res.body.user._id;
        testData.friends?.push(new mongoose.Types.ObjectId(userId3!));
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  let userId1: string;
  it('should create a new user via POST /users/ (user1)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(testData)
      .then(res => {
        userId1 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  it('should get a list of friends by user id via GET /users/:userId/friends', done => {
    chai
      .request(server)
      .get(`/users/${userId1}/friends`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.friends).to.have.length(2);
        done();
      });
  });
});

describe('testing friend requests', () => {
  let userId1: string;
  it('should create a new user via POST /users/ (user1)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_4)
      .then(res => {
        userId1 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  let userId2: string;
  it('should create a new user via POST /users/ (user2)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_5)
      .then(res => {
        userId2 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  let userId3: string;
  it('should create a new user via POST /users/ (user3)', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_3)
      .then(res => {
        userId3 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  it('should send a friend request via PATCH /users/:userId/request-friend', done => {
    chai
      .request(server)
      .patch(`/users/${userId1}/request-friend`)
      .query({ friendId: userId2 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // Test remove friend request
  it('should send a friend request via PATCH /users/:userId/request-friend', done => {
    chai
      .request(server)
      .patch(`/users/${userId3}/request-friend`)
      .query({ friendId: userId2 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch a user via GET to check friend requests /users/?userIds={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId2 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user._id).to.equal(userId2);
        expect(user.friendRequests).to.have.length(2);
        done();
      })
      .catch(err => done(err));
  });

  it('should remove a friend request via PATCH /users/:userId/remove-friend-request', done => {
    chai
      .request(server)
      .patch(`/users/${userId3}/remove-friend-request`)
      .query({ friendId: userId2 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch a user via GET to check friend requests /users/?userIds={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId2 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user._id).to.equal(userId2);
        expect(user.friendRequests).to.have.length(1);
        done();
      })
      .catch(err => done(err));
  });

  it('should resend a friend request via PATCH /users/:userId/request-friend', done => {
    chai
      .request(server)
      .patch(`/users/${userId3}/request-friend`)
      .query({ friendId: userId2 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch a user via GET to check sent friend requests /users/?userIds={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId3 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user.sentFriendRequests[0]).to.equal(userId2);
        expect(user.sentFriendRequests).to.have.length(1);
        done();
      })
      .catch(err => done(err));
  });

  it('should accept a friend request via PATCH /users/:userId/accept-friend-request', done => {
    chai
      .request(server)
      .patch(`/users/${userId2}/accept-friend-request`)
      .query({ friendId: userId1 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch a user via GET to check friend requests after accept /users/?userIds={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId2 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user._id).to.equal(userId2);
        expect(user.friendRequests).to.have.length(1);
        done();
      })
      .catch(err => done(err));
  });

  it('should fetch a user via GET to check sent friend requests after accept /users/?userIds={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId1 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user.sentFriendRequests).to.have.length(0);
        done();
      })
      .catch(err => done(err));
  });

  it('should decline a friend request via PATCH /users/:userId/accept-friend-request', done => {
    chai
      .request(server)
      .patch(`/users/${userId2}/decline-friend-request`)
      .query({ friendId: userId3 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch a user via GET to check friend requests after decline /users/?userIds={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userIds: userId2 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user._id).to.equal(userId2);
        expect(user.friendRequests).to.have.length(0);
        done();
      })
      .catch(err => done(err));
  });

  it('should get a list of friends by user id via GET /users/:userId/friends', done => {
    chai
      .request(server)
      .get(`/users/${userId1}/friends`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.friends).to.have.length(1);
        done();
      });
  });

  it('should get a list of friends by user id via GET /users/:userId/friends', done => {
    chai
      .request(server)
      .get(`/users/${userId2}/friends`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.friends).to.have.length(1);
        done();
      });
  });

  // test friend removal
  it('should remove a friend via PATCH /users/:userId/remove-friend', done => {
    chai
      .request(server)
      .patch(`/users/${userId1}/remove-friend`)
      .query({ friendId: userId2 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should get a list of friends by user id via GET /users/:userId/friends', done => {
    chai
      .request(server)
      .get(`/users/${userId2}/friends`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.friends).to.have.length(0);
        done();
      });
  });

  it('should get a list of friends by user id via GET /users/:userId/friends', done => {
    chai
      .request(server)
      .get(`/users/${userId1}/friends`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.friends).to.have.length(0);
        done();
      });
  });
});

describe('testing user search', () => {
  it('should delete all users via mongoose', done => {
    User.deleteMany({}).then(() => done());
  });

  it('should create a new user via POST /users', done => {
    chai
      .request(server)
      .post('/users/')
      .send(SEARCH_USER_1)
      .then(res => {
        const user = res.body.user;
        expect(res).to.have.status(201);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(SEARCH_USER_1.email);
        done();
      })
      .catch(err => done(err));
  });

  it('should create a new user via POST /users', done => {
    chai
      .request(server)
      .post('/users/')
      .send(SEARCH_USER_2)
      .then(res => {
        const user = res.body.user;
        expect(res).to.have.status(201);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(SEARCH_USER_2.email);
        done();
      })
      .catch(err => done(err));
  });

  it('should create a new user via POST /users', done => {
    chai
      .request(server)
      .post('/users/')
      .send(SEARCH_USER_3)
      .then(res => {
        const user = res.body.user;
        expect(res).to.have.status(201);
        expect(user).to.be.an('object');
        expect(user).to.have.property('_id');
        expect(user.email).to.equal(SEARCH_USER_3.email);
        done();
      })
      .catch(err => done(err));
  });

  it('should return a single user via GET /users/search', done => {
    chai
      .request(server)
      .get('/users/search')
      .query({ query: 'Zi', count: 10, page: 1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users).to.have.length(1);
        expect(res.body.users[0].notificationToken).to.be.undefined;
        done();
      })
      .catch(err => done(err));
  });

  it('should return a list of users via GET /users/search', done => {
    chai
      .request(server)
      .get('/users/search')
      .query({ query: 'Eth', count: 10, page: 1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users).to.have.length(2);
        expect(res.body.users[0].notificationToken).to.be.undefined;
        expect(res.body.users[1].notificationToken).to.be.undefined;
        done();
      })
      .catch(err => done(err));
  });

  it('should return one user via GET /users/search', done => {
    chai
      .request(server)
      .get('/users/search')
      .query({ query: 'Rat', count: 10, page: 1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users).to.have.length(1);
        expect(res.body.users[0].notificationToken).to.be.undefined;
        done();
      })
      .catch(err => done(err));
  });

  it('should return no users via GET /users/search', done => {
    chai
      .request(server)
      .get('/users/search')
      .query({ query: 'Rat', count: 10, page: 2 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users).to.have.length(0);
        done();
      })
      .catch(err => done(err));
  });

  it('should return all users via GET /users/search', done => {
    chai
      .request(server)
      .get('/users/search')
      .query({ query: '', count: 100, page: 1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users).to.have.length(3);
        done();
      })
      .catch(err => done(err));
  });

  it('should return a no users via GET /users/search', done => {
    chai
      .request(server)
      .get('/users/search')
      .query({ query: 'TestTestFake', count: 10, page: 1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users).to.have.length(0);
        done();
      })
      .catch(err => done(err));
  });
});

/* TEST USER ERRORS */
describe('testing User Error', () => {
  let userId1: string;
  it('should create a new user with a POST request', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_1)
      .then(res => {
        userId1 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  it('should return a 400 status code for GET request with an invalid user ID', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: 'FAKEID' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should create a new user and save groups with a POST request for save groups', done => {
    chai
      .request(server)
      .post('/users/')
      .send(TEST_USER_1)
      .then(res => {
        userId1 = res.body.user._id;
        expect(res).to.have.status(201);
        expect(res.body.user).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  it('should return a 400 status code for GET request with an incorrect user ID', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: new ObjectId(1234).toString() })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.venue).to.equal(undefined);
        done();
      });
  });

  it('should return a 400 status code for POST request with incorrectly formatted data', done => {
    chai
      .request(server)
      .post('/users/')
      .send({ data: { message: 'This is incorrect' } })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should not update incorrectly formatted data with PATCH request', done => {
    chai
      .request(server)
      .patch(`/users/${userId1}`)
      .send({ firstNameNotRight: 'Test' })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return correct user keys for GET request with valid user ID', done => {
    chai
      .request(server)
      .get('/users/')
      .query({ userIds: userId1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0]).to.have.keys(USER_KEYS_TEST);
        done();
      });
  });

  it('should return a 400 status code for PATCH request with an incorrect user ID', done => {
    chai
      .request(server)
      .patch('/users/' + new ObjectId(1234))
      .send({ firstName: 'Test' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return a 400 status code for PATCH request with an invalid user ID', done => {
    chai
      .request(server)
      .patch('/users/' + 'FAKEID')
      .send({ firstName: 'Test' })
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return a 400 status code for DELETE request with invalid user ID', done => {
    chai
      .request(server)
      .delete('/users/' + 'FAKEID')
      .then(res => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return a 400 status code for DELETE request with incorrect user ID', done => {
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
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  } finally {
    await server.close();
  }
});
