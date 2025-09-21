import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '1h';

export class JwtService {
  static generateAccessToken(userId: string): string {
    if (!JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined in environment variables.');
    }
    if (!JWT_ACCESS_EXPIRES_IN) {
      throw new Error('JWT_ACCESS_EXPIRES_IN is not defined in environment variables.');
    }
    return jwt.sign(
      { id: userId } as object,
      JWT_ACCESS_SECRET as jwt.PrivateKey,
      { expiresIn: JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions,
    );
  }

  static verifyAccessToken(token: string): jwt.JwtPayload {
    if (!JWT_ACCESS_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    return jwt.verify(token, JWT_ACCESS_SECRET) as jwt.JwtPayload;
  }
}
