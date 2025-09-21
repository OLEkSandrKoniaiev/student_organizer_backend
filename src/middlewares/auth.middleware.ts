import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_ACCESS_SECRET) {
      console.error('JWT_ACCESS_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Internal server configuration error' });
    }

    // jwt.verify не тільки декодує, але й перевіряє підпис та термін дії
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as JwtPayload;

    // Це захищає від ситуації, коли токен ще дійсний, а користувача вже видалили.
    const currentUser = await UserRepository.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ message: 'User belonging to this token does no longer exist' });
    }

    req.user = { _id: decoded.id };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    if (error instanceof Error) {
      if (error.message.includes('Bad control character')) {
        return res.status(401).json({ error: error.message });
      }
    }
    console.error('Unexpected error in auth middleware:', error);
    return res.status(500).json({ message: 'An internal server error occurred' });
  }
};
