import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedException } from '#utils/exceptions';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or invalid authorization header' );
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.userId || decoded.id 
    };
    next();
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired token' );
  }
}