/**
 * GOYE Web3 Business Hub - Official Server-Side Record Verification Endpoints
 * Provides transparent, safe, public verification for Businesses, Invoices, and Contracts.
 * Never exposes private personal information or unhashed credentials.
 */

import { Router, Request, Response } from 'express';
import { dbAdapter } from '../db/adapter.ts';

const verifyRouter = Router();

/**
 * GET /api/verify/business/:id
 */
verifyRouter.get('/business/:id', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const business = state.businesses.find((b) => b.id === req.params.id);

  if (!business) {
    return res.status(404).json({
      found: false,
      referenceId: req.params.id,
      recordType: 'GOYE Business Profile',
      status: 'RECORD NOT FOUND',
      message: 'No authentic business profile found in GOYE Official Registry matching this ID.',
      checkedAt: new Date().toISOString(),
    });
  }

  const levelLabels: Record<number, string> = {
    1: 'Level 1: Registered Profile',
    2: 'Level 2: Documents Submitted',
    3: 'Level 3: GOYE Reviewed',
    4: 'Level 4: Identity Confirmed',
    5: 'Level 5: Payment Enabled',
  };

  return res.json({
    found: true,
    referenceId: business.id,
    recordType: 'GOYE Business Profile',
    businessName: business.name,
    category: business.category,
    country: business.country,
    state: business.state,
    website: business.website,
    verificationLevel: business.verificationLevel,
    verificationStatusLabel: levelLabels[business.verificationLevel] || 'Level 1: Registered Profile',
    status: 'ACTIVE REGISTERED PROFILE',
    registrationInfo: business.registrationInfo,
    registeredDate: business.createdAt,
    lastVerifiedAt: business.updatedAt,
    officialIssuer: 'GOYE Web3 Business Hub Official Registry',
    verificationEndpoint: `/verify/business/${business.id}`,
    checkedAt: new Date().toISOString(),
  });
});

/**
 * GET /api/verify/invoice/:id
 */
verifyRouter.get('/invoice/:id', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const invoice = state.invoices.find((i) => i.id === req.params.id);

  if (!invoice) {
    return res.status(404).json({
      found: false,
      referenceId: req.params.id,
      recordType: 'Digital Commercial Invoice',
      status: 'RECORD NOT FOUND',
      message: 'No authentic invoice record found in GOYE Registry matching this ID.',
      checkedAt: new Date().toISOString(),
    });
  }

  return res.json({
    found: true,
    referenceId: invoice.id,
    recordType: 'Digital Commercial Invoice',
    sellerName: invoice.sellerName,
    sellerBusinessId: invoice.sellerBusinessId,
    buyerDisplayName: invoice.buyerCompany || invoice.buyerName,
    total: `${invoice.total.toLocaleString()} ${invoice.currency}`,
    dueDate: invoice.dueDate,
    status: invoice.status, // Pending, Under Review, Paid
    isPaid: invoice.status === 'Paid',
    paidAt: invoice.paidAt || null,
    paymentMethod: invoice.paymentMethod,
    issueDate: invoice.createdAt,
    lastVerifiedAt: invoice.updatedAt,
    officialIssuer: 'GOYE Web3 Business Hub Invoicing Protocol',
    verificationEndpoint: `/verify/invoice/${invoice.id}`,
    checkedAt: new Date().toISOString(),
  });
});

/**
 * GET /api/verify/contract/:id
 */
verifyRouter.get('/contract/:id', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const contract = state.contracts.find((c) => c.id === req.params.id);

  if (!contract) {
    return res.status(404).json({
      found: false,
      referenceId: req.params.id,
      recordType: 'Digital Commercial Agreement',
      status: 'RECORD NOT FOUND',
      message: 'No authentic contract record found in GOYE Registry matching this ID.',
      checkedAt: new Date().toISOString(),
    });
  }

  return res.json({
    found: true,
    referenceId: contract.id,
    recordType: 'Digital Commercial Agreement',
    title: contract.title,
    providerName: contract.providerName,
    providerBusinessId: contract.providerBusinessId,
    clientDisplayName: contract.clientName,
    totalValue: `${contract.totalValue.toLocaleString()} ${contract.currency}`,
    startDate: contract.startDate,
    deadlineDate: contract.deadlineDate,
    status: contract.status, // Active, Sent, Draft, Completed
    isClientSigned: Boolean(contract.clientSignedAt),
    signedDate: contract.clientSignedAt || contract.providerSignedAt,
    contractHash: `sha256:${contract.contractHash.slice(0, 32)}...`,
    lastVerifiedAt: contract.updatedAt,
    legalNotice: contract.legalDisclaimer,
    officialIssuer: 'GOYE Web3 Business Hub Contract Protocol',
    verificationEndpoint: `/verify/contract/${contract.id}`,
    checkedAt: new Date().toISOString(),
  });
});

export { verifyRouter };
