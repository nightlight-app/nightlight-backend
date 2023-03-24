import { assert } from 'chai';
import { User } from '../interfaces/User.interface';
import {
  GROUP_KEYS,
  NOTIFICATION_KEYS,
  USER_KEYS,
  VENUE_KEYS,
} from '../utils/constants';
import { verifyKeys } from '../utils/validation.utils';
import {
  TEST_GROUP1,
  TEST_NOTIFICATION,
  TEST_USER_1,
  TEST_VENUE,
} from './data/testData';

describe('testing validation utils', () => {
  it('should validate keys in an object (user)', done => {
    assert(
      verifyKeys({ ...TEST_USER_1, _id: 'test', __v: 1 }, USER_KEYS) === null
    );
    done();
  });

  it('should validate keys in an object (group)', done => {
    assert(
      verifyKeys({ ...TEST_GROUP1, _id: 'test', __v: 1 }, GROUP_KEYS) === null
    );
    done();
  });

  it('should validate keys in an object (notification)', done => {
    assert(
      verifyKeys(
        { ...TEST_NOTIFICATION, _id: 'test', __v: 1 },
        NOTIFICATION_KEYS
      ) === null
    );
    done();
  });

  it('should validate keys in an object (venue)', done => {
    assert(
      verifyKeys({ ...TEST_VENUE, _id: 'test', __v: 1 }, VENUE_KEYS) === null
    );
    done();
  });

  it('should return an error if keys are missing (user)', done => {
    const badUser = {
      ...TEST_USER_1,
      _id: 'test',
      __v: 1,
    } as any;
    delete badUser?.email;
    assert(verifyKeys(badUser, USER_KEYS) !== null);
    done();
  });

  it('should return an error if keys are missing (group)', done => {
    const badGroup = {
      ...TEST_GROUP1,
      _id: 'test',
      __v: 1,
    } as any;
    delete badGroup?.name;
    assert(verifyKeys(badGroup, GROUP_KEYS) !== null);
    done();
  });

  it('should return an error if keys are missing (notification)', done => {
    const badNotification = {
      ...TEST_NOTIFICATION,
      _id: 'test',
      __v: 1,
    } as any;
    delete badNotification?.title;
    assert(verifyKeys(badNotification, USER_KEYS) !== null);
    done();
  });

  it('should return an error if keys are missing (venue)', done => {
    const badVenue = {
      ...TEST_VENUE,
      _id: 'test',
      __v: 1,
    } as any;
    delete badVenue?.name;
    assert(verifyKeys(badVenue, USER_KEYS) !== null);
    done();
  });
});
