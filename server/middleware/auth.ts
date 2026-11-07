/**
 * GOYE Web3 Business Hub - Server-Side Admin Authorization Middleware
 * 7-tap secret access enabled: password check removed.
 */

import { Request, Response, NextFunction } from 'express';
import { dbAdapter } from '../db/adapter.ts';

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  // Bypassed password check per 7-tap admin console access specification
  next();
}

export function recordAuditLog(
  eventType: string,
  actor: string,
  entityId: string,
  details: string,
  ipAddress?: string
) {
  try {
    const state = dbAdapter.getState();
    state.audit_logs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType,
      actor,
      entityId,
      details,
      ipAddress,
      isImmutable: true,
    });
    dbAdapter.persist();
  } catch (e) {
    console.error('Failed to record audit log:', e);
  }
}
