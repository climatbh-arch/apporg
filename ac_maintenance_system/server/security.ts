/**
 * Security and RBAC (Role-Based Access Control) utilities
 */

import { TRPCError } from '@trpc/server';

export type UserRole = 'admin' | 'technician' | 'client' | 'user';

export interface SecureContext {
  user: {
    id: number;
    role: UserRole;
    email?: string;
  } | null;
}

/**
 * Role hierarchy - higher roles inherit lower permissions
 */
export const roleHierarchy: Record<UserRole, number> = {
  'admin': 4,
  'technician': 3,
  'client': 2,
  'user': 1,
};

/**
 * Permission matrix - define what each role can do
 */
export const permissions: Record<UserRole, Set<string>> = {
  'admin': new Set([
    'read:all',
    'write:all',
    'delete:all',
    'manage:users',
    'manage:roles',
    'view:reports',
    'export:data',
  ]),
  'technician': new Set([
    'read:work-orders',
    'write:work-orders',
    'read:clients',
    'read:equipments',
    'read:inventory',
    'write:inventory',
    'view:own-reports',
  ]),
  'client': new Set([
    'read:own-orders',
    'read:own-equipments',
    'view:own-reports',
  ]),
  'user': new Set([
    'read:public',
  ]),
};

/**
 * Check if user has permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return permissions[role]?.has(permission) ?? false;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Middleware to check permissions
 */
export function requirePermission(permission: string) {
  return (ctx: SecureContext) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    if (!hasPermission(ctx.user.role, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Permission denied: ${permission}`,
      });
    }
  };
}

/**
 * Middleware to check role
 */
export function requireRole(role: UserRole) {
  return (ctx: SecureContext) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    if (!hasRole(ctx.user.role, role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Role ${role} required`,
      });
    }
  };
}

/**
 * Security headers configuration
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Hash sensitive data (use bcrypt in production)
 */
export function hashSensitiveData(data: string): string {
  // This is a placeholder - use bcrypt or argon2 in production
  return Buffer.from(data).toString('base64');
}

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
};

/**
 * Audit logging
 */
export function logAuditEvent(
  userId: number,
  action: string,
  resource: string,
  details?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT] ${timestamp} | User: ${userId} | Action: ${action} | Resource: ${resource}`, details);
  // In production, save to database or external logging service
}
