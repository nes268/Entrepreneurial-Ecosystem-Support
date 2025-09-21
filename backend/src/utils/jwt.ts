import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';
import { pgPool } from '../config/database';
import { IUser } from '../models/User';
import { IAdmin } from '../models/Admin';
import { JwtPayload, RefreshTokenPayload, UserRole, AdminLevel } from '../types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JwtPayload;
  expired?: boolean;
  error?: string;
}

/**
 * Generate access token for user
 */
export const generateAccessToken = (
  user: IUser, 
  admin?: IAdmin
): string => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    adminLevel: admin?.adminLevel,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (config.jwt.expiresIn || 24 * 60 * 60), // 24 hours default
  };

  return jwt.sign(payload, config.jwt.secret, {
    algorithm: 'HS256',
  });
};

/**
 * Generate refresh token for user
 */
export const generateRefreshToken = async (userId: string): Promise<string> => {
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (config.jwt.refreshExpiresIn || 30 * 24 * 60 * 60 * 1000)); // 30 days default

  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret || config.jwt.secret, {
    algorithm: 'HS256',
  });

  // Store refresh token in PostgreSQL
  try {
    // First get the pg_user id
    const userResult = await pgPool.query(
      'SELECT id FROM pg_users WHERE mongo_user_id = $1',
      [userId]
    );

    if (userResult.rows.length > 0) {
      const pgUserId = userResult.rows[0].id;
      
      // Insert refresh token session
      await pgPool.query(
        `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
         VALUES ($1, $2, $3)`,
        [pgUserId, tokenId, expiresAt]
      );
    }
  } catch (error) {
    console.error('Error storing refresh token:', error);
    // Don't throw - token is still valid even if storage fails
  }

  return refreshToken;
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = async (
  user: IUser, 
  admin?: IAdmin
): Promise<TokenPair> => {
  const accessToken = generateAccessToken(user, admin);
  const refreshToken = await generateRefreshToken(user._id.toString());

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.expiresIn || 24 * 60 * 60,
  };
};

/**
 * Validate access token
 */
export const validateAccessToken = (token: string): TokenValidationResult => {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return {
      valid: true,
      payload,
    };
  } catch (error) {
    const jwtError = error as jwt.JsonWebTokenError;
    
    return {
      valid: false,
      expired: jwtError.name === 'TokenExpiredError',
      error: jwtError.message,
    };
  }
};

/**
 * Validate refresh token
 */
export const validateRefreshToken = async (token: string): Promise<TokenValidationResult & { tokenId?: string }> => {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret || config.jwt.secret) as RefreshTokenPayload;
    
    // Check if refresh token exists in database and is not expired
    const sessionResult = await pgPool.query(
      `SELECT s.*, u.mongo_user_id 
       FROM user_sessions s
       JOIN pg_users u ON s.user_id = u.id
       WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
      [payload.tokenId]
    );

    if (sessionResult.rows.length === 0) {
      return {
        valid: false,
        error: 'Refresh token not found or expired',
      };
    }

    return {
      valid: true,
      payload: {
        userId: payload.userId,
        email: '', // Will be filled by caller
        role: 'individual' as UserRole, // Will be filled by caller
        iat: payload.iat,
        exp: payload.exp,
      },
      tokenId: payload.tokenId,
    };
  } catch (error) {
    const jwtError = error as jwt.JsonWebTokenError;
    
    return {
      valid: false,
      expired: jwtError.name === 'TokenExpiredError',
      error: jwtError.message,
    };
  }
};

/**
 * Revoke refresh token
 */
export const revokeRefreshToken = async (tokenId: string): Promise<boolean> => {
  try {
    const result = await pgPool.query(
      'DELETE FROM user_sessions WHERE refresh_token = $1',
      [tokenId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
};

/**
 * Revoke all refresh tokens for a user
 */
export const revokeAllUserTokens = async (userId: string): Promise<boolean> => {
  try {
    // Get pg_user id first
    const userResult = await pgPool.query(
      'SELECT id FROM pg_users WHERE mongo_user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return false;
    }

    const pgUserId = userResult.rows[0].id;
    
    const result = await pgPool.query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [pgUserId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error revoking all user tokens:', error);
    return false;
  }
};

/**
 * Clean up expired tokens (should be called periodically)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  try {
    const result = await pgPool.query(
      'DELETE FROM user_sessions WHERE expires_at <= NOW()'
    );
    
    console.log(`Cleaned up ${result.rowCount} expired tokens`);
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

/**
 * Get user's active sessions
 */
export const getUserActiveSessions = async (userId: string): Promise<Array<{
  id: number;
  created_at: Date;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
}>> => {
  try {
    // Get pg_user id first
    const userResult = await pgPool.query(
      'SELECT id FROM pg_users WHERE mongo_user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return [];
    }

    const pgUserId = userResult.rows[0].id;
    
    const result = await pgPool.query(
      `SELECT id, created_at, ip_address, user_agent, expires_at 
       FROM user_sessions 
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [pgUserId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting user active sessions:', error);
    return [];
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};