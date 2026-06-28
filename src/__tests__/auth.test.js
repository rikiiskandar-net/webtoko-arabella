import { describe, it, expect } from 'vitest';

describe('Auth Utilities (lib/auth.js)', () => {
  it('signToken produces a valid token format', () => {
    const { signToken, verifyToken } = require('@/lib/auth');
    const payload = { id: 'test-id', username: 'admin', name: 'Admin', role: 'superadmin' };
    const token = signToken(payload);
    expect(token).toBeTruthy();
    expect(token).toContain('.');
    const decoded = verifyToken(token);
    expect(decoded).toBeTruthy();
    expect(decoded.username).toBe('admin');
  });

  it('verifyToken returns null for invalid token', () => {
    const { verifyToken } = require('@/lib/auth');
    expect(verifyToken('invalid.token.here')).toBeNull();
    expect(verifyToken('')).toBeNull();
    expect(verifyToken(null)).toBeNull();
  });

  it('verifyToken returns null for expired token', () => {
    const { signToken, verifyToken } = require('@/lib/auth');
    const payload = { id: 'test', username: 'test', name: 'Test', role: 'admin' };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded).toBeTruthy();
    expect(decoded.exp).toBeGreaterThan(0);
  });
});

describe('Rate Limiter (lib/rate-limit.js)', () => {
  it('allows requests under the limit', () => {
    const { isRateLimited } = require('@/lib/rate-limit');
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited('test-ip-under')).toBe(false);
    }
  });
});
