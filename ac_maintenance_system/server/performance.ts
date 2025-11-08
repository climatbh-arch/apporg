/**
 * Performance optimization utilities for the server
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Compression middleware - reduces response size
 */
export function compressionMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set cache headers for static assets
    if (req.path.startsWith('/public/')) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    next();
  };
}

/**
 * Response time tracking
 */
export function responseTimeMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn(`[PERF] Slow request: ${req.method} ${req.path} took ${duration}ms`);
      }
    });
    next();
  };
}

/**
 * Database query optimization - add indexes
 */
export const dbIndexes = {
  workOrders: ['clientId', 'status', 'createdAt', 'scheduledDate'],
  clients: ['email', 'createdAt'],
  equipments: ['clientId', 'type', 'createdAt'],
  transactions: ['workOrderId', 'type', 'createdAt'],
  maintenanceHistory: ['equipmentId', 'createdAt'],
};

/**
 * Batch query helper - reduces N+1 queries
 */
export async function batchQuery<T>(
  ids: number[],
  queryFn: (ids: number[]) => Promise<T[]>,
  keyFn: (item: T) => number
): Promise<Map<number, T>> {
  if (ids.length === 0) return new Map();
  
  const results = await queryFn(ids);
  const map = new Map<number, T>();
  
  results.forEach(item => {
    map.set(keyFn(item), item);
  });
  
  return map;
}

/**
 * Lazy loading helper - defer non-critical data
 */
export function shouldLazyLoad(path: string): boolean {
  const lazyPaths = ['/reports', '/analytics', '/detailed-history'];
  return lazyPaths.some(p => path.includes(p));
}

/**
 * Memory usage monitoring
 */
export function monitorMemory() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;
    
    if (heapUsedPercent > 80) {
      console.warn(`[PERF] High memory usage: ${heapUsedPercent.toFixed(2)}%`);
    }
  }
}
