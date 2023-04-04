import mongoose, { ConnectOptions } from 'mongoose';
import createServer from '../server';
import chai, { assert, expect } from 'chai';
import {
  sendNotifications,
  sendNotificationToUser,
} from '../utils/notification.utils';
import { ObjectId } from 'mongodb';
import { NOTIFICATION_KEYS_TEST } from './data/testData';
import { useTestingDatabase } from './mongodb.utils';
require('dotenv').config();

chai.should();

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
});

describe('test notification utils', () => {
  it('should send notification to user database via POST /notifications', done => {
    sendNotifications(
      [new ObjectId().toString()],
      'Test Title',
      'Test Body',
      { notificationType: 'test' },
      false,
      0
    ).then(notification => {
      assert.isNotNull(notification);
      assert(notification[0].title === 'Test Title');
      assert(notification[0].body === 'Test Body');
      assert(notification[0].data.notificationType === 'test');
      assert(notification[0].delay === 0);
      done();
    });
  });

  it('should send multiple notifications to user database via POST /notifications', done => {
    sendNotifications(
      [
        new ObjectId(123456).toString(),
        new ObjectId(76543).toString(),
        new ObjectId(26373).toString(),
      ],
      'Test Title',
      'Test Body',
      { notificationType: 'test' },
      false,
      0
    ).then(notifications => {
      assert.isArray(notifications);
      assert.lengthOf(notifications, 3);
      assert(notifications[0].title === 'Test Title');
      assert(notifications[0].body === 'Test Body');
      assert(notifications[0].data.notificationType === 'test');
      assert(notifications[0].delay === 0);
      assert(notifications[1].title === 'Test Title');
      assert(notifications[1].body === 'Test Body');
      assert(notifications[1].data.notificationType === 'test');
      assert(notifications[1].delay === 0);
      assert(notifications[0].userId !== notifications[1].userId);
      assert(notifications[2].userId !== notifications[1].userId);
      assert(notifications[2].userId !== notifications[0].userId);
      assert(notifications[2].title === 'Test Title');
      assert(notifications[2].body === 'Test Body');
      assert(notifications[2].data.notificationType === 'test');
      assert(notifications[2].delay === 0);
      done();
    });
  });

  it('should return undefined if no userIds are provided via POST /notifications', done => {
    sendNotifications(
      [],
      'Test Title',
      'Test Body',
      { notificationType: 'test' },
      false,
      0
    ).then(notification => {
      assert(notification.length === 0);
      done();
    });
  });

  it('should return undefined if userId is qn empty array via POST /notifications', done => {
    sendNotifications(
      [],
      'Test Title',
      'Test Body',
      { notificationType: 'test' },
      false,
      0
    ).then(notification => {
      assert(notification.length === 0);
      done();
    });
  });
});

describe('test notification utils errors', () => {
  it('should return undefined if userId is invalid via POST /notifications', done => {
    sendNotifications(
      ['invalidId'],
      'Test Title',
      'Test Body',
      { notificationType: 'test' },
      false
    ).then(notifications => {
      assert(notifications.length === 0);
      done();
    });
  });

  it('should send notifications to the valid IDs in the array and ignore the invalid ones via POST /notifications', done => {
    sendNotifications(
      [
        new ObjectId(123456).toString(),
        'BAD ID',
        new ObjectId(26373).toString(),
      ],
      'Test Title',
      'Test Body',
      { notificationType: 'test' },
      false
    ).then(notifications => {
      assert.isArray(notifications);
      assert.lengthOf(notifications, 2);
      assert(notifications[0].title === 'Test Title');
      assert(notifications[0].body === 'Test Body');
      assert(notifications[0].data.notificationType === 'test');
      assert(notifications[0].delay === 0);
      assert(notifications[1].title === 'Test Title');
      assert(notifications[1].body === 'Test Body');
      assert(notifications[1].data.notificationType === 'test');
      assert(notifications[1].delay === 0);
      assert(notifications[0].userId !== notifications[1].userId);
      done();
    });
  });
});

after(async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
});
