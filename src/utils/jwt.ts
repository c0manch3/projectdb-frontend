import type { UserRole } from '../store/types';

// JWT payload interface based on our user data
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  companyId?: string;
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
      console.warn('Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 URL decode
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload) as JWTPayload;
    
    return parsedPayload;
  } catch (error) {
    console.warn('Failed to decode JWT token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWT(token);
    
    if (!payload || !payload.exp) {
      return true;
    }
    
    // Convert exp from seconds to milliseconds and compare with current time
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
  } catch (error) {
    console.warn('Failed to check token expiration:', error);
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
    console.warn('Failed to extract user role from token:', error);
    return null;
  }
};