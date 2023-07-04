import {
  TEST_GROUP1,
  TEST_NOTIFICATION,
  TEST_USER_1,
  TEST_VENUE,
} from './data/testData';
import { KeyValidationType, verifyKeys } from '../utils/validation.utils';
import { assert } from 'chai';

describe('testing validation utils', () => {
  it('should validate keys in an object (user)', done => {
    assert(
      verifyKeys(
        { ...TEST_USER_1, _id: 'test', __v: 1 },
        KeyValidationType.USERS
      ) === ''
    );
    done();
  });

  it('should validate keys in an object (group)', done => {
    assert(
      verifyKeys(
        { ...TEST_GROUP1, _id: 'test', __v: 1 },
        KeyValidationType.GROUPS
      ) === ''
    );
    done();
  });

  it('should validate keys in an object (notification)', done => {
    assert(
      verifyKeys(
        { ...TEST_NOTIFICATION, _id: 'test', __v: 1 },
        KeyValidationType.NOTIFICATIONS
      ) === ''
    );
    done();
  });

  it('should validate keys in an object (venue)', done => {
    assert(
      verifyKeys(
        { ...TEST_VENUE, _id: 'test', __v: 1 },
        KeyValidationType.VENUES
      ) === ''
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
    assert(verifyKeys(badUser, KeyValidationType.USERS) !== '');
    done();
  });

  it('should return an error if keys are missing (group)', done => {
    const badGroup = {
      ...TEST_GROUP1,
      _id: 'test',
      __v: 1,
    } as any;
    delete badGroup?.name;
    assert(verifyKeys(badGroup, KeyValidationType.GROUPS) !== '');
    done();
  });

  it('should return an error if keys are missing (notification)', done => {
    const badNotification = {
      ...TEST_NOTIFICATION,
      _id: 'test',
      __v: 1,
      bleh: 'bleh',
    } as any;
    delete badNotification?.title;
    console.log(verifyKeys(badNotification, KeyValidationType.NOTIFICATIONS));
    assert(verifyKeys(badNotification, KeyValidationType.NOTIFICATIONS) !== '');
    done();
  });

  it('should return an error if keys are missing (venue)', done => {
    const badVenue = {
      ...TEST_VENUE,
      _id: 'test',
      __v: 1,
    } as any;
    delete badVenue?.name;
    assert(verifyKeys(badVenue, KeyValidationType.VENUES) !== '');
    done();
  });
});
