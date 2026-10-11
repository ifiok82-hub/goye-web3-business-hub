/**
 * GOYE Web3 Business Hub - Protected Administrative Routes
 * Secured via requireAdminAuth middleware.
 * Controls verification review queues and payment reconciliation.
 */

import { Router, Request, Response } from 'express';
import { dbAdapter } from '../db/adapter.ts';
import { requireAdminAuth, recordAuditLog } from '../middleware/auth.ts';

const adminRouter = Router();

// Protect all routes with server-side admin authorization
adminRouter.use(requireAdminAuth);

/**
 * GET /api/admin/overview
 */
adminRouter.get('/overview', (_req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const dbStatus = dbAdapter.getProductionStatus();

  const pendingVerifications = state.businesses.filter((b) => b.verificationLevel === 2);
  const invoicesUnderReview = state.invoices.filter((i) => i.status === 'Under Review');

  res.json({
    databaseStatus: dbStatus,
    metrics: {
      totalBusinesses: state.businesses.length,
      pendingVerificationsCount: pendingVerifications.length,
      invoicesUnderReviewCount: invoicesUnderReview.length,
      totalInvoices: state.invoices.length,
      totalContracts: state.contracts.length,
      totalOrders: state.orders.length,
      totalAuditLogs: state.audit_logs.length,
    },
    invoicesUnderReview: invoicesUnderReview.slice(0, 10),
    recentAuditLogs: state.audit_logs.slice(0, 15),
  });
});

/**
 * GET /api/admin/verifications
 */
adminRouter.get('/verifications', (_req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const list = state.businesses.map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category,
    verificationLevel: b.verificationLevel,
    email: b.email,
    registrationInfo: b.registrationInfo,
    updatedAt: b.updatedAt,
  }));
  res.json({ verifications: list });
});

/**
 * POST /api/admin/verifications/:id/review
 * Compliance officer promotes or sets verification level (Level 1 to 5)
 */
adminRouter.post('/verifications/:id/review', (req: Request, res: Response) => {
  const { newLevel, notes, decision } = req.body;
  const state = dbAdapter.getState();
  const business = state.businesses.find((b) => b.id === req.params.id);

  if (!business) {
    return res.status(404).json({ error: 'Business not found.' });
  }

  const levelNum = Number(newLevel);
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 5) {
    return res.status(400).json({ error: 'Invalid verification level. Must be between 1 and 5.' });
  }

  const oldLevel = business.verificationLevel;
  business.verificationLevel = levelNum as any;
  business.updatedAt = new Date().toISOString();

  // Log verification event in business_verifications table
  state.business_verifications.unshift({
    id: `VERIF-${Date.now()}`,
    businessId: business.id,
    level: levelNum as any,
    status: decision === 'reject' ? 'rejected' : 'verified',
    notes: notes || `Compliance audit completed: Level updated from ${oldLevel} to ${levelNum}.`,
    submittedDocuments: [],
    reviewedBy: 'AUTHORIZED_COMPLIANCE_OFFICER',
    reviewedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  // Immutable audit log
  recordAuditLog(
    'ADMIN_VERIFICATION_REVIEW',
    'AUTHORIZED_COMPLIANCE_OFFICER',
    business.id,
    `Business ${business.id} verification level changed from Level ${oldLevel} to Level ${levelNum}. Notes: ${notes || 'None'}.`,
    req.ip
  );

  dbAdapter.persist();

  res.json({
    success: true,
    message: `Business verification successfully updated to Level ${levelNum}.`,
    business,
  });
});

/**
 * GET /api/admin/invoices/review-queue
 */
adminRouter.get('/invoices/review-queue', (_req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const pendingInvoices = state.invoices.filter((i) => i.status === 'Under Review' || i.status === 'Pending');
  res.json({ invoices: pendingInvoices });
});

/**
 * POST /api/admin/invoices/:id/reconcile
 * Authorized administrative settlement reconciliation
 */
adminRouter.post('/invoices/:id/reconcile', (req: Request, res: Response) => {
  const { decision, verifiedReference, notes } = req.body;
  const state = dbAdapter.getState();
  const invoice = state.invoices.find((i) => i.id === req.params.id);

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found.' });
  }

  const now = new Date().toISOString();

  if (decision === 'APPROVE_PAID') {
    // Prohibit administrator legitimacy bypass for Pi Network transactions
    const isPiPayment = (invoice.paymentMethod || '').toLowerCase().includes('pi');
    const associatedOrder = state.orders.find((o) => o.id === invoice.id || o.orderReference === invoice.notes);
    const isPiOrder = associatedOrder?.paymentProvider === 'pi';

    if (isPiPayment || isPiOrder) {
      return res.status(403).json({
        error: 'Administrator manual payment override is prohibited for Pi Network transactions. Pi payments must be verified exclusively through official server-to-server Pi Platform API completion.',
        code: 'PI_MANUAL_OVERRIDE_PROHIBITED',
      });
    }

    if (!verifiedReference) {
      return res.status(400).json({
        error: 'Verified bank/provider transaction reference is mandatory to mark an invoice as PAID.',
      });
    }

    invoice.status = 'Paid';
    invoice.paidAt = now;
    invoice.reconciledBy = 'AUTHORIZED_RECONCILIATION_OFFICER';
    invoice.paymentEvidenceReference = verifiedReference;
    invoice.updatedAt = now;

    // Check if there is an associated order and update it
    const order = state.orders.find((o) => o.id === invoice.id || o.orderReference === invoice.notes);
    if (order) {
      order.status = 'PAID';
      order.reconciledAt = now;
      order.reconciledBy = 'AUTHORIZED_RECONCILIATION_OFFICER';
      order.updatedAt = now;
    }

    recordAuditLog(
      'INVOICE_RECONCILED_PAID',
      'AUTHORIZED_RECONCILIATION_OFFICER',
      invoice.id,
      `Invoice ${invoice.id} formally reconciled as PAID against verified bank/gateway reference: ${verifiedReference}.`,
      req.ip
    );
  } else if (decision === 'REJECT') {
    invoice.status = 'Pending';
    invoice.notes += ` | Evidence rejected: ${notes || 'Payment not found in bank ledger.'}`;
    invoice.updatedAt = now;

    recordAuditLog(
      'INVOICE_PAYMENT_REJECTED',
      'AUTHORIZED_RECONCILIATION_OFFICER',
      invoice.id,
      `Invoice ${invoice.id} payment evidence rejected. Reason: ${notes || 'Unverified bank credit'}.`,
      req.ip
    );
  } else {
    return res.status(400).json({ error: 'decision must be APPROVE_PAID or REJECT.' });
  }

  dbAdapter.persist();

  res.json({
    success: true,
    message: decision === 'APPROVE_PAID' ? 'Invoice marked PAID after authorized reconciliation.' : 'Evidence rejected.',
    invoice,
  });
});

/**
 * GET /api/admin/audit-logs
 */
adminRouter.get('/audit-logs', (_req: Request, res: Response) => {
  const state = dbAdapter.getState();
  res.json({ total: state.audit_logs.length, logs: state.audit_logs });
});

export { adminRouter };
