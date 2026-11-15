import type { NextFunction, Request, Response } from 'express';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const getFirebaseAdminAuth = () => {
  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
  return getAuth(app);
};

export interface AuthenticatedRequest extends Request {
  firebaseUser?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.firebaseUser = await getFirebaseAdminAuth().verifyIdToken(authorization.slice(7));
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};
