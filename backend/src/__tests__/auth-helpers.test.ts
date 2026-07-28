// backend/src/__tests__/auth-helpers.test.ts
import { generateToken, verifyToken } from '../utils/auth';

describe('JWT Auth Helpers', () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token string', () => {
      const token = generateToken('user123', 'user');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should embed userId and role in the token payload', () => {
      const token = generateToken('user456', 'admin');
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded!.userId).toBe('user456');
      expect(decoded!.role).toBe('admin');
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload for a valid token', () => {
      const token = generateToken('user789', 'user');
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded!.userId).toBe('user789');
      expect(decoded!.role).toBe('user');
    });

    it('should return null for an invalid token', () => {
      const decoded = verifyToken('invalid.token.string');

      expect(decoded).toBeNull();
    });

    it('should return null for an expired token', () => {
      // Generate a token with 0 seconds expiry (already expired)
      const token = generateToken('user000', 'user', '0s');
      const decoded = verifyToken(token);

      expect(decoded).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw if JWT_SECRET is not defined', () => {
      const secret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateToken('user', 'user')).toThrow('JWT_SECRET is not defined');

      process.env.JWT_SECRET = secret;
    });
  });
});
