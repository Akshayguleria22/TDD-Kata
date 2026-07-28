// backend/src/utils/auth.ts
import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  role: string;
}

/**
 * Generate a JWT token with userId and role in the payload.
 * @param userId - The user's ID
 * @param role - The user's role (admin | user)
 * @param expiresIn - Token expiration time (default: '7d')
 * @returns Signed JWT token string
 */
export const generateToken = (
  userId: string,
  role: string,
  expiresIn: string = '7d'
): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const options: SignOptions = { expiresIn } as SignOptions;

  return jwt.sign({ userId, role }, secret, options);
};

/**
 * Verify and decode a JWT token.
 * @param token - The JWT token to verify
 * @returns Decoded payload or null if invalid/expired
 */
export const verifyToken = (token: string): TokenPayload | null => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};
