/**
 * Verifies if a given object has all the specified keys.
 *
 * @param {<T>} the type of the object to verify.
 * @param obj the object to verify.
 * @param keys the keys to check for in the object.
 *
 * @example param1: const person1: Person = { name: 'John', age: 20, email: 'john1234@gmail.com'};
 *          param2: const requiredKeys: Array<keyof Person> = ['name', 'age', 'email'];
 *
 * @return a comma-separated string of any missing keys, or null if all keys are present.
 */
export const verifyKeys = <T extends Record<string, any>>(
  obj: T,
  keys: Array<keyof T>
): string | null => {
  const missingKeys = keys.filter(key => !obj.hasOwnProperty(key) || !obj[key]);
  return missingKeys.length > 0 ? missingKeys.join(', ') : null;
};
