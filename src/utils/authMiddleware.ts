import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload;
}

export const authenticate = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};
