/**
 * GOYE Web3 Business Hub - Server-Side Admin Authorization Middleware
 * Enforces strict authentication on admin, audit, and reconciliation endpoints.
 * Never trusts role claims from client request bodies.
 */

import { Request, Response, NextFunction } from 'express';
import { dbAdapter } from '../db/adapter.ts';
import { isAdminValid } from '../../lib/adminAuth';

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'];
  const authHeader = req.headers.authorization;

  let providedToken: string | null = null;

  if (typeof adminKey === 'string' && adminKey.trim()) {
    providedToken = adminKey.trim();
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.replace('Bearer ', '').trim();
  }

  // Check if token matches server-side configured admin password
  if (!providedToken || !isAdminValid(providedToken)) {
    // Log unauthorized access attempt in persistent audit logs
    const state = dbAdapter.getState();
    state.audit_logs.unshift({
      id: `AUD-SEC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'UNAUTHORIZED_ADMIN_ATTEMPT',
      actor: (req.ip || 'unknown_ip') as string,
      entityId: req.originalUrl,
      details: `Unauthorized attempt to access protected route ${req.method} ${req.originalUrl}.`,
      ipAddress: req.ip,
      isImmutable: true,
    });
    dbAdapter.persist();

    return res.status(401).json({
      error: 'Invalid password',
      code: 'ADMIN_AUTH_REQUIRED',
      status: 'ACCESS_DENIED',
    });
  }

  // Token is valid
  next();
}

/**
 * Audit Logger Helper
 */
export function recordAuditLog(eventType: string, actor: string, entityId: string, details: string, ip?: string) {
  const state = dbAdapter.getState();
  state.audit_logs.unshift({
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    eventType,
    actor,
    entityId,
    details,
    ipAddress: ip,
    isImmutable: true,
  });
  dbAdapter.persist();
}
