import {
  EMERGENCY_CONTACT_KEYS,
  GROUP_KEYS,
  GROUP_KEYS_ALL,
  NOTIFICATION_KEYS,
  NOTIFICATION_KEYS_ALL,
  PING_KEYS_ALL,
  USER_KEYS,
  USER_KEYS_ALL,
  VENUE_KEYS,
  VENUE_KEYS_ALL,
} from './constants';

/**
 * Verifies if a given object has all the specified keys.
 *
 * @param obj the object to verify.
 * @param mandatoryKeys the keys to check for in the object.
 *
 * @example param1: const person1: Person = { name: 'John', age: 20, email: 'john1234@gmail.com'};
 *          param2: const requiredKeys: Array<keyof Person> = ['name', 'age', 'email'];
 *
 * @return a comma-separated, formatted string of any missing or extra keys, or an empty string if all keys are present.
 */
export const verifyKeys = (obj: any, keys: string[][]): String => {
  const mandatoryKeys = keys[0];
  const allKeys = keys[1];

  const missingKeys = mandatoryKeys.filter(
    key => !obj.hasOwnProperty(key) || !obj[key]
  );
  const extraKeys = Object.keys(obj).filter(key => !allKeys.includes(key));
  const missingKeysString =
    missingKeys.length > 0
      ? 'Missing keys: ' + missingKeys.join(', ') + '. '
      : '';
  const extraKeysString =
    extraKeys.length > 0 ? 'Extra keys: ' + extraKeys.join(', ') + '.' : '';

  return missingKeysString + extraKeysString;
};

/**
 * A map of the necessary and all possible keys for each type of object.
 */
export const KeyValidationType: { [key: string]: string[][] } = {
  USERS: [USER_KEYS, USER_KEYS_ALL],
  GROUPS: [GROUP_KEYS, GROUP_KEYS_ALL],
  VENUES: [VENUE_KEYS, VENUE_KEYS_ALL],
  NOTIFICATIONS: [NOTIFICATION_KEYS, NOTIFICATION_KEYS_ALL],
  EMERGENCY_CONTACTS: [EMERGENCY_CONTACT_KEYS, EMERGENCY_CONTACT_KEYS],
  PING: [PING_KEYS_ALL, PING_KEYS_ALL],
};
