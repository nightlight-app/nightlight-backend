import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Define a custom interface for the request object with the `decodedFirebaseToken` property
interface CustomRequest extends Request {
  decodedFirebaseToken?: admin.auth.DecodedIdToken;
}

// Initialize Firebase app
admin.initializeApp();

export const authenticateFirebaseToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Get the Authorization header from the request
  const authHeader = req.headers['authorization'];

  // Check if the Authorization header is present
  if (!authHeader) {
    return res.status(401).send('Authorization header is missing');
  }

  // Check if the Authorization header has the Bearer scheme
  const bearerToken = authHeader.split(' ')[1];
  if (!bearerToken) {
    return res.status(401).send('Bearer token is missing');
  }

  // Verify the Firebase token using the Firebase Admin SDK
  admin
    .auth()
    .verifyIdToken(bearerToken)
    .then(decodedToken => {
      // Add the decoded Firebase token to the request object
      req.decodedFirebaseToken = decodedToken;
      next();
    })
    .catch(error => {
      console.error('Error verifying Firebase token:', error);
      return res.status(401).send('Invalid Firebase token');
    });
};
