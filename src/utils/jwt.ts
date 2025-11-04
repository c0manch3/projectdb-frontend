import type { UserRole } from '../store/types';

// JWT payload interface based on our user data
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token and extract payload without verification
 * Note: This is for client-side extraction only, server should always verify
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    if (!payload) {
      return null;
    }

    // Base64 URL decode
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload) as JWTPayload;

    return parsedPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param token - JWT token to check
 * @param bufferSeconds - Buffer time in seconds before considering token expired (default: 60s)
 */
export const isTokenExpired = (token: string, bufferSeconds: number = 60): boolean => {
  try {
    const payload = decodeJWT(token);

    if (!payload || !payload.exp) {
      return true;
    }

    // Convert exp from seconds to milliseconds and compare with current time
    // Add buffer time to prevent edge cases where token expires during request
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const bufferTime = bufferSeconds * 1000;

    return currentTime >= (expirationTime - bufferTime);
  } catch (error) {
    return true;
  }
};

/**
 * Extract user role from JWT token
 */
export const getUserRoleFromToken = (token: string): UserRole | null => {
  try {
    const payload = decodeJWT(token);
    return payload?.role || null;
  } catch (error) {
    return null;
  }
};