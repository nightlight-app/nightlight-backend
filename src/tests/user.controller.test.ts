import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  SAVED_GROUP,
  SAVED_GROUP_KEYS,
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
  server = app.listen(6062);
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

  it('should fetch a user via GET /users/?userId={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId })
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
      .patch(`/users/${userId}/addNotificationToken`)
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
      .patch(`/users/${userId}/removeNotificationToken`)
      .send()
      .then(res => {
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });

  let emergencyContactId: string;
  it('should add an emergency contact via PATCH /users/{userId}/addEmergencyContact', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/addEmergencyContact`)
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
      .query({ userId: userId })
      .then(res => {
        console.log(res.body.users[0]);
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

  it('should remove an emergency contact via PATCH /users/{userId}/removeEmergencyContact', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/removeEmergencyContact`)
      .query({ emergencyContactId: emergencyContactId })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      })
      .catch(err => done(err));
  });

  it('should get user to verify emergency contact via GET /users/', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.users[0].emergencyContacts).to.have.length(0);
        done();
      })
      .catch(err => done(err));
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

  it('should add a savedGroup via PATCH /users/:userId/saveGroup', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/saveGroup`)
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
      .query({ userId: userId })
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

  it('should delete a specific savedGroup via PATCH /users/:userId/deleteSavedGroup', done => {
    chai
      .request(server)
      .patch(`/users/${userId}/deleteSavedGroup`)
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
      .query({ userId: userId })
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

  it('should send a friend request via PATCH /users/:userId/requestFriend', done => {
    chai
      .request(server)
      .patch(`/users/${userId1}/requestFriend`)
      .query({ friendId: userId2 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should send a friend request via PATCH /users/:userId/requestFriend', done => {
    chai
      .request(server)
      .patch(`/users/${userId3}/requestFriend`)
      .query({ friendId: userId2 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch a user via GET to check friend requests /users/?userId={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId2 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user._id).to.equal(userId2);
        expect(user.friendRequests).to.have.length(2);
        done();
      })
      .catch(err => done(err));
  });

  it('should accept a friend request via PATCH /users/:userId/acceptFriendRequest', done => {
    chai
      .request(server)
      .patch(`/users/${userId2}/acceptFriendRequest`)
      .query({ friendId: userId1 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch a user via GET to check friend requests after accept /users/?userId={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId2 })
      .then(res => {
        const user = res.body.users[0];
        expect(res).to.have.status(200);
        expect(user._id).to.equal(userId2);
        expect(user.friendRequests).to.have.length(1);
        done();
      })
      .catch(err => done(err));
  });

  it('should decline a friend request via PATCH /users/:userId/acceptFriendRequest', done => {
    chai
      .request(server)
      .patch(`/users/${userId2}/declineFriendRequest`)
      .query({ friendId: userId3 })
      .then(res => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fetch a user via GET to check friend requests after decline /users/?userId={userId}', done => {
    chai
      .request(server)
      .get(`/users/`)
      .query({ userId: userId2 })
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
  it('should remove a friend via PATCH /users/:userId/removeFriend', done => {
    chai
      .request(server)
      .patch(`/users/${userId1}/removeFriend`)
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
      .query({ userId: 'FAKEID' })
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
      .query({ userId: new ObjectId(1234).toString() })
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
      .query({ userId: userId1 })
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
