/**
 * Security and RBAC tests
 */

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasRole,
  roleHierarchy,
  permissions,
  sanitizeInput,
  isValidEmail,
} from '../security';

describe('RBAC Security', () => {
  describe('Role Hierarchy', () => {
    it('should have correct role hierarchy', () => {
      expect(roleHierarchy.admin).toBeGreaterThan(roleHierarchy.technician);
      expect(roleHierarchy.technician).toBeGreaterThan(roleHierarchy.client);
      expect(roleHierarchy.client).toBeGreaterThan(roleHierarchy.user);
    });
  });

  describe('Permissions', () => {
    it('admin should have all permissions', () => {
      const adminPerms = permissions.admin;
      expect(adminPerms.has('read:all')).toBe(true);
      expect(adminPerms.has('write:all')).toBe(true);
      expect(adminPerms.has('delete:all')).toBe(true);
      expect(adminPerms.has('manage:users')).toBe(true);
    });

    it('technician should have work order permissions', () => {
      const techPerms = permissions.technician;
      expect(techPerms.has('read:work-orders')).toBe(true);
      expect(techPerms.has('write:work-orders')).toBe(true);
      expect(techPerms.has('manage:users')).toBe(false);
    });

    it('client should only have own resource permissions', () => {
      const clientPerms = permissions.client;
      expect(clientPerms.has('read:own-orders')).toBe(true);
      expect(clientPerms.has('read:work-orders')).toBe(false);
      expect(clientPerms.has('manage:users')).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      expect(hasPermission('admin', 'read:all')).toBe(true);
      expect(hasPermission('admin', 'manage:users')).toBe(true);
    });

    it('should return false for user without permission', () => {
      expect(hasPermission('user', 'read:all')).toBe(false);
      expect(hasPermission('user', 'manage:users')).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('admin should have all roles', () => {
      expect(hasRole('admin', 'admin')).toBe(true);
      expect(hasRole('admin', 'technician')).toBe(true);
      expect(hasRole('admin', 'client')).toBe(true);
    });

    it('technician should not have admin role', () => {
      expect(hasRole('technician', 'admin')).toBe(false);
      expect(hasRole('technician', 'technician')).toBe(true);
    });
  });
});

describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      expect(sanitizeInput(input)).toBe('hello world');
    });

    it('should limit length to 1000 characters', () => {
      const input = 'a'.repeat(2000);
      expect(sanitizeInput(input).length).toBeLessThanOrEqual(1000);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });
});
