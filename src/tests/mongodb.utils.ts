/**
 * Automatically reads MONGODB_URI and replaces the connected database with
 * the testing database (default name: 'test') to prevent accidental purging
 * of data in the production/development/stage database.
 *
 * @example MONGODB_URI = 'mongodb://localhost:27017/development'
 * @returns 'mongodb://localhost:27017/test'
 */
export const useTestingDatabase = () => {
  if (process.env.MONGODB_URI)
    // replace the last part of the URI with 'test'
    return process.env.MONGODB_URI.replace(/\/[^/]+$/, '/test');
  else return process.env.MONGODB_URI || '';
};
