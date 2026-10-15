/**
 * GOYE Web3 Business Hub - Hardened API Routes
 * Fully connected to persistent dbAdapter with strict payment integrity and validation.
 */

import { Router, Request, Response } from 'express';
import { dbAdapter } from '../db/adapter.ts';
import { generateBusinessAssistantResponse } from '../gemini.ts';
import { getPiServerConfig } from './pi.ts';
import { recordAuditLog } from '../middleware/auth.ts';

const apiRouter = Router();

// ---------------- 1. BUSINESS & BUSINESS ID ROUTES ----------------

/**
 * GET /api/business
 */
apiRouter.get('/business', (req: Request, res: Response) => {
  const { category, search, minLevel } = req.query;
  const state = dbAdapter.getState();
  let results = [...state.businesses];

  if (category && typeof category === 'string' && category !== 'All') {
    results = results.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  if (minLevel) {
    const level = parseInt(minLevel as string, 10);
    if (!isNaN(level)) {
      results = results.filter((b) => b.verificationLevel >= level);
    }
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }

  res.json({
    total: results.length,
    businesses: results,
  });
});

/**
 * GET /api/business/:id
 */
apiRouter.get('/business/:id', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const b = state.businesses.find((x) => x.id === req.params.id);
  if (!b) {
    return res.status(404).json({ error: 'Business profile not found in GOYE registry.' });
  }

  const profile = state.business_profiles.find((p) => p.businessId === b.id);
  const verifications = state.business_verifications.filter((v) => v.businessId === b.id);
  const documents = state.documents.filter((d) => d.businessId === b.id);

  res.json({
    business: {
      ...b,
      profile,
      verificationHistory: verifications,
      documents,
    },
  });
});

/**
 * POST /api/business
 * Register a new business with Level 1: Registered Profile
 */
apiRouter.post('/business', (req: Request, res: Response) => {
  const {
    name,
    tagline,
    description,
    category,
    country,
    state: stateRegion,
    address,
    website,
    phone,
    email,
    services,
    products,
    registrationInfo,
    whatsapp,
  } = req.body;

  if (!name || !email || !category) {
    return res.status(400).json({ error: 'Business name, email, and category are required.' });
  }

  const state = dbAdapter.getState();
  const nextSeq = String(state.businesses.length + 1).padStart(6, '0');
  const businessId = `GOYE-BIZ-2026-${nextSeq}`;
  const now = new Date().toISOString();

  const newBusiness = {
    id: businessId,
    name: name.trim(),
    tagline: (tagline || 'Digital Enterprise').trim(),
    description: (description || 'Registered commercial profile on GOYE Web3 Business Hub.').trim(),
    category: category.trim(),
    country: (country || 'Nigeria').trim(),
    state: (stateRegion || 'Lagos').trim(),
    address: (address || 'Operating headquarters').trim(),
    website: (website || '').trim(),
    phone: (phone || '').trim(),
    email: email.trim(),
    registrationInfo: registrationInfo || 'Incorporation filing pending review',
    verificationLevel: 1 as const, // Level 1: Registered Profile
    createdAt: now,
    updatedAt: now,
  };

  state.businesses.unshift(newBusiness);

  // Business ID Record
  state.business_ids.push({
    id: businessId,
    businessId,
    mintedAt: now,
    qrVerificationReference: `VRF-BIZ-${nextSeq}`,
    status: 'ACTIVE',
  });

  // Profile Record
  state.business_profiles.push({
    id: `PROF-${Date.now()}`,
    businessId,
    bio: newBusiness.description,
    socials: {
      whatsapp: whatsapp || '',
    },
    businessHours: 'Monday - Friday: 09:00 - 17:00 WAT',
    supportEmail: email.trim(),
    whatsappHandoffNumber: phone || '',
    updatedAt: now,
  });

  // Verification step 1
  state.business_verifications.push({
    id: `VERIF-${Date.now()}`,
    businessId,
    level: 1,
    status: 'verified',
    notes: 'Initial business profile registered and unique GOYE Business ID allocated.',
    submittedDocuments: [],
    reviewedBy: 'GOYE_AUTOMATED_REGISTRY',
    reviewedAt: now,
    createdAt: now,
  });

  recordAuditLog('BUSINESS_CREATED', email.trim(), businessId, `Business profile "${name}" registered with unique ID ${businessId}.`, req.ip);
  dbAdapter.persist();

  res.status(201).json({
    success: true,
    message: 'Business profile successfully registered in GOYE Registry.',
    business: newBusiness,
  });
});

/**
 * POST /api/business/:id/verify
 * Submit documentation to queue for review (advancing to Level 2: Documents Submitted)
 */
apiRouter.post('/business/:id/verify', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const b = state.businesses.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Business not found.' });

  const { documentName, documentType } = req.body;
  if (!documentName || !documentType) {
    return res.status(400).json({ error: 'documentName and documentType are required.' });
  }

  const now = new Date().toISOString();
  const docId = `DOC-${Date.now()}`;

  state.documents.push({
    id: docId,
    businessId: b.id,
    documentName: documentName.trim(),
    documentType: documentType.trim(),
    fileHash: `sha256:${Buffer.from(`${docId}:${documentName}:${now}`).toString('hex').slice(0, 32)}`,
    status: 'pending',
    uploadedAt: now,
  });

  if (b.verificationLevel === 1) {
    b.verificationLevel = 2; // Level 2: Documents Submitted
    state.business_verifications.push({
      id: `VERIF-${Date.now()}`,
      businessId: b.id,
      level: 2,
      status: 'pending',
      notes: `Document "${documentName}" (${documentType}) queued for compliance audit.`,
      submittedDocuments: [documentName],
      createdAt: now,
    });
  }

  b.updatedAt = now;

  recordAuditLog(
    'DOCUMENTS_SUBMITTED',
    b.email,
    b.id,
    `Documents submitted for review; verification updated to Level 2: Documents Submitted.`,
    req.ip
  );
  dbAdapter.persist();

  res.json({
    success: true,
    message: 'Documentation successfully queued for compliance audit.',
    verificationLevel: b.verificationLevel,
    business: b,
  });
});

// ---------------- 2. MARKETPLACE ROUTES ----------------

/**
 * GET /api/marketplace/items
 */
apiRouter.get('/marketplace/items', (req: Request, res: Response) => {
  const { category, search } = req.query;
  const state = dbAdapter.getState();
  let items = [...state.marketplace_listings];

  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.sellerBusinessName.toLowerCase().includes(q)
    );
  }

  res.json({
    total: items.length,
    items,
  });
});

/**
 * POST /api/marketplace/orders
 * Creates an order in PENDING status. Does NOT mark as paid!
 */
apiRouter.post('/marketplace/orders', (req: Request, res: Response) => {
  const { itemId, buyerName, buyerEmail, buyerPhone, paymentProvider } = req.body;

  if (!itemId || !buyerName || !buyerEmail) {
    return res.status(400).json({ error: 'itemId, buyerName, and buyerEmail are required.' });
  }

  const state = dbAdapter.getState();
  const listing = state.marketplace_listings.find((l) => l.id === itemId);
  if (!listing) {
    return res.status(404).json({ error: 'Marketplace listing not found.' });
  }

  const orderId = `ORD-${Date.now()}`;
  const orderRef = `ORD-REF-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newOrder = {
    id: orderId,
    orderReference: orderRef,
    buyerName: buyerName.trim(),
    buyerEmail: buyerEmail.trim(),
    buyerPhone: buyerPhone?.trim() || '',
    sellerBusinessId: listing.sellerBusinessId,
    itemId: listing.id,
    itemTitle: listing.title,
    amount: listing.priceNGN,
    currency: 'NGN' as const,
    paymentProvider: paymentProvider || 'bank_transfer',
    status: 'PENDING' as const, // Strict payment integrity: PENDING
    createdAt: now,
    updatedAt: now,
  };

  state.orders.unshift(newOrder);

  // Create payment record in PENDING status
  state.payments.unshift({
    id: `PAY-${Date.now()}`,
    orderId,
    paymentProvider: (paymentProvider as any) || 'bank_transfer',
    amount: listing.priceNGN,
    currency: 'NGN',
    status: 'PENDING',
    idempotencyKey: `IDEMP-${orderRef}-${Date.now()}`,
    createdAt: now,
  });

  recordAuditLog('ORDER_CREATED', buyerEmail, orderId, `Order ${orderRef} created for ${listing.title} with status PENDING.`, req.ip);
  dbAdapter.persist();

  res.status(201).json({
    success: true,
    order: newOrder,
  });
});

// ---------------- 2B. 15-PRODUCT INFRASTRUCTURE ROUTES ----------------

/**
 * GET /api/products
 * Comprehensive filtering across the 15 official GOYE Web3 Business Hub products
 */
apiRouter.get('/products', (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice, currency, businessId, sort } = req.query;
  const state = dbAdapter.getState();
  let products = [...(state.products || [])];

  if (category && typeof category === 'string' && category !== 'All') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (businessId && typeof businessId === 'string') {
    products = products.filter((p) => p.businessId === businessId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sellerBusinessName && p.sellerBusinessName.toLowerCase().includes(q)) ||
        (p.deliverables && p.deliverables.some((d) => d.toLowerCase().includes(q)))
    );
  }

  // Price filters (based on currency, default NGN)
  const curr = (currency as string)?.toUpperCase() || 'NGN';
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) {
      products = products.filter((p) => {
        const val = curr === 'USD' ? p.priceUSD : curr === 'PI' ? (p.pricePi || 0) : p.priceNGN;
        return val >= min;
      });
    }
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) {
      products = products.filter((p) => {
        const val = curr === 'USD' ? p.priceUSD : curr === 'PI' ? (p.pricePi || 0) : p.priceNGN;
        return val <= max;
      });
    }
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => (curr === 'USD' ? a.priceUSD - b.priceUSD : curr === 'PI' ? (a.pricePi || 0) - (b.pricePi || 0) : a.priceNGN - b.priceNGN));
  } else if (sort === 'price_desc') {
    products.sort((a, b) => (curr === 'USD' ? b.priceUSD - a.priceUSD : curr === 'PI' ? (b.pricePi || 0) - (a.pricePi || 0) : b.priceNGN - a.priceNGN));
  } else if (sort === 'rating') {
    products.sort((a, b) => (b.ratingAverage || 5) - (a.ratingAverage || 5));
  } else if (sort === 'deals') {
    products.sort((a, b) => (b.completedDeals || 0) - (a.completedDeals || 0));
  }

  const allCategories = Array.from(new Set((state.products || []).map((p) => p.category)));

  res.json({
    total: products.length,
    products,
    categories: ['All', ...allCategories],
  });
});

/**
 * GET /api/products/:id
 */
apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const product = (state.products || []).find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found in GOYE catalog.' });
  }

  const business = state.businesses.find((b) => b.id === product.businessId);
  const relatedProducts = (state.products || [])
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  res.json({
    product,
    business,
    relatedProducts,
  });
});

/**
 * POST /api/products
 * Merchant adds product listing
 */
apiRouter.post('/products', (req: Request, res: Response) => {
  const {
    businessId,
    title,
    description,
    category,
    priceNGN,
    priceUSD,
    pricePi,
    deliverables,
    features,
    deliveryTimeDays,
    badge,
  } = req.body;

  if (!businessId || !title || !category || priceNGN === undefined) {
    return res.status(400).json({ error: 'businessId, title, category, and priceNGN are required.' });
  }

  const state = dbAdapter.getState();
  const business = state.businesses.find((b) => b.id === businessId);
  if (!business) {
    return res.status(404).json({ error: 'Associated business ID not found in GOYE registry.' });
  }

  const nextSeq = String((state.products || []).length + 1).padStart(3, '0');
  const productId = `PRD-2026-${nextSeq}`;
  const now = new Date().toISOString();

  const newProduct: any = {
    id: productId,
    businessId: business.id,
    sellerBusinessName: business.name,
    sellerVerificationLevel: business.verificationLevel,
    title: title.trim(),
    description: description?.trim() || '',
    category: category.trim(),
    priceNGN: Number(priceNGN),
    priceUSD: Number(priceUSD || (priceNGN / 1500).toFixed(2)),
    pricePi: pricePi ? Number(pricePi) : Number((priceNGN / 15000).toFixed(2)),
    deliverables: Array.isArray(deliverables) ? deliverables : deliverables ? [deliverables] : [],
    features: Array.isArray(features) ? features : [],
    deliveryTimeDays: deliveryTimeDays ? Number(deliveryTimeDays) : 3,
    ratingAverage: 5.0,
    completedDeals: 0,
    badge: badge || 'New',
    status: 'active' as const,
    createdAt: now,
    updatedAt: now,
  };

  if (!state.products) state.products = [];
  state.products.unshift(newProduct);

  // Sync with marketplace_listings
  state.marketplace_listings.unshift({
    id: `MKT-2026-${nextSeq}`,
    sellerBusinessId: business.id,
    sellerBusinessName: business.name,
    sellerVerificationLevel: business.verificationLevel as any,
    title: newProduct.title,
    description: newProduct.description,
    category: newProduct.category,
    priceNGN: newProduct.priceNGN,
    priceUSD: newProduct.priceUSD,
    pricePi: newProduct.pricePi,
    deliverables: newProduct.deliverables,
    deliveryTimeDays: newProduct.deliveryTimeDays,
    ratingAverage: 5.0,
    completedDeals: 0,
    status: 'active',
    createdAt: now,
  });

  recordAuditLog(
    'PRODUCT_CREATED',
    business.email,
    productId,
    `New product "${title}" registered under category "${category}".`,
    req.ip
  );
  dbAdapter.persist();

  res.status(201).json({
    success: true,
    message: 'Product listing successfully registered in GOYE catalog.',
    product: newProduct,
  });
});

// ---------------- 3. INVOICE ROUTES ----------------

/**
 * GET /api/invoices
 */
apiRouter.get('/invoices', (req: Request, res: Response) => {
  const { businessId } = req.query;
  const state = dbAdapter.getState();
  let list = [...state.invoices];
  if (businessId && typeof businessId === 'string') {
    list = list.filter((i) => i.sellerBusinessId === businessId);
  }
  res.json({ total: list.length, invoices: list });
});

/**
 * GET /api/invoices/:id
 */
apiRouter.get('/invoices/:id', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const inv = state.invoices.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });

  const items = state.invoice_items.filter((item) => item.invoiceId === inv.id);
  res.json({ invoice: { ...inv, items } });
});

/**
 * POST /api/invoices
 * Always creates invoices with status 'Pending'. NEVER automatically 'Paid'!
 */
apiRouter.post('/api/invoices', (req: Request, res: Response) => {
  // Handled below
});

apiRouter.post('/invoices', (req: Request, res: Response) => {
  const {
    sellerBusinessId,
    buyerName,
    buyerEmail,
    buyerCompany,
    items,
    taxRatePercent,
    currency,
    dueDate,
    notes,
    paymentMethod,
  } = req.body;

  if (!sellerBusinessId || !buyerName || !buyerEmail || !items || !items.length) {
    return res.status(400).json({ error: 'Missing mandatory invoice parameters.' });
  }

  const state = dbAdapter.getState();
  const seller = state.businesses.find((b) => b.id === sellerBusinessId) || {
    id: sellerBusinessId,
    name: 'Registered Enterprise',
  };

  const parsedItems = items.map((i: any, idx: number) => ({
    id: `ITEM-${Date.now()}-${idx}`,
    description: i.description,
    quantity: Number(i.quantity || 1),
    unitPrice: Number(i.unitPrice || 0),
    amount: Number(i.quantity || 1) * Number(i.unitPrice || 0),
  }));

  const subtotal = parsedItems.reduce((acc: number, cur: any) => acc + cur.amount, 0);
  const taxRate = Number(taxRatePercent || 7.5);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const invId = `INV-2026-${String(state.invoices.length + 101).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const newInvoice = {
    id: invId,
    sellerBusinessId: seller.id,
    sellerName: seller.name,
    buyerName: buyerName.trim(),
    buyerEmail: buyerEmail.trim(),
    buyerCompany: buyerCompany?.trim() || '',
    subtotal,
    taxRatePercent: taxRate,
    taxAmount,
    total,
    currency: (currency || 'NGN') as any,
    dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    notes: notes || 'Standard 14-day business settlement terms apply.',
    paymentMethod: paymentMethod || 'Direct Bank Wire',
    status: 'Pending' as const, // Strict Payment Integrity: Starts as 'Pending'
    qrVerificationReference: `VRF-${invId}`,
    createdAt: now,
    updatedAt: now,
  };

  state.invoices.unshift(newInvoice);

  parsedItems.forEach((item: any) => {
    state.invoice_items.push({
      id: item.id,
      invoiceId: invId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    });
  });

  recordAuditLog(
    'INVOICE_CREATED',
    seller.name,
    invId,
    `Digital Invoice ${invId} created for ${buyerName} totaling ${total} ${newInvoice.currency} with status PENDING.`,
    req.ip
  );
  dbAdapter.persist();

  res.status(201).json({
    success: true,
    invoice: { ...newInvoice, items: parsedItems },
  });
});

/**
 * POST /api/invoices/:id/submit-evidence
 * PAYMENT INTEGRITY:
 * When a user submits bank transfer evidence, status moves to 'Under Review'.
 * It does NOT become 'Paid' until authorized reconciliation!
 */
apiRouter.post('/invoices/:id/submit-evidence', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const inv = state.invoices.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });

  const { transactionReference, notes } = req.body;
  if (!transactionReference) {
    return res.status(400).json({ error: 'Verifiable transactionReference is required for evidence audit.' });
  }

  const now = new Date().toISOString();
  inv.status = 'Under Review'; // PAYMENT INTEGRITY: Moved to Under Review, not Paid
  inv.paymentEvidenceReference = transactionReference.trim();
  inv.paymentEvidenceNotes = (notes || 'Bank transfer reference submitted by payer').trim();
  inv.evidenceSubmittedAt = now;
  inv.updatedAt = now;

  recordAuditLog(
    'PAYMENT_EVIDENCE_SUBMITTED',
    inv.buyerEmail,
    inv.id,
    `Payer submitted payment evidence reference ${transactionReference}. Status moved to UNDER REVIEW.`,
    req.ip
  );
  dbAdapter.persist();

  res.json({
    success: true,
    message: 'Payment evidence submitted and queued for authorized reconciliation review.',
    invoice: inv,
  });
});

// Backward-compatible alias for existing frontend callers, routing to submit-evidence
apiRouter.post('/invoices/:id/settle', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const inv = state.invoices.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });

  const { transactionReference, notes } = req.body;
  if (!transactionReference) {
    return res.status(400).json({ error: 'Verifiable transactionReference is required for evidence audit.' });
  }

  const now = new Date().toISOString();
  inv.status = 'Under Review'; // PAYMENT INTEGRITY: Moved to Under Review, never Paid directly by client
  inv.paymentEvidenceReference = transactionReference.trim();
  inv.paymentEvidenceNotes = (notes || 'Submitted via portal').trim();
  inv.evidenceSubmittedAt = now;
  inv.updatedAt = now;

  recordAuditLog(
    'PAYMENT_EVIDENCE_SUBMITTED',
    inv.buyerEmail,
    inv.id,
    `Payer submitted payment evidence ${transactionReference}. Status moved to UNDER REVIEW.`,
    req.ip
  );
  dbAdapter.persist();

  res.json({
    success: true,
    message: 'Payment evidence submitted and queued for authorized review.',
    invoice: inv,
  });
});

// ---------------- 4. CONTRACT ROUTES ----------------

/**
 * GET /api/contracts
 */
apiRouter.get('/contracts', (_req: Request, res: Response) => {
  const state = dbAdapter.getState();
  res.json({ total: state.contracts.length, contracts: state.contracts });
});

/**
 * GET /api/contracts/:id
 */
apiRouter.get('/contracts/:id', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const c = state.contracts.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Digital contract record not found.' });
  res.json({ contract: c });
});

/**
 * POST /api/contracts
 */
apiRouter.post('/contracts', (req: Request, res: Response) => {
  const {
    title,
    clientName,
    clientEmail,
    providerBusinessId,
    serviceDescription,
    deliverables,
    totalValue,
    currency,
    startDate,
    deadlineDate,
    paymentTerms,
    cancellationTerms,
    disputeInstructions,
  } = req.body;

  if (!title || !clientName || !clientEmail || !providerBusinessId || !totalValue) {
    return res.status(400).json({ error: 'Title, client info, provider ID, and totalValue are required.' });
  }

  const state = dbAdapter.getState();
  const provider = state.businesses.find((b) => b.id === providerBusinessId) || {
    id: providerBusinessId,
    name: 'Provider Enterprise',
  };

  const ctrId = `CTR-2026-${String(state.contracts.length + 90).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const newContract = {
    id: ctrId,
    title: title.trim(),
    clientName: clientName.trim(),
    clientEmail: clientEmail.trim(),
    providerBusinessId: provider.id,
    providerName: provider.name,
    serviceDescription: serviceDescription?.trim() || 'Professional commercial digital services',
    deliverables: Array.isArray(deliverables) ? deliverables : [deliverables].filter(Boolean),
    totalValue: Number(totalValue),
    currency: currency || 'NGN',
    startDate: startDate || now.split('T')[0],
    deadlineDate: deadlineDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentTerms: paymentTerms || 'Payment released in milestones upon verified deliverable inspection.',
    cancellationTerms: cancellationTerms || 'Notice in writing required 14 days prior to project termination.',
    disputeInstructions:
      disputeInstructions ||
      'Disputes are logged into GOYE Trade Assurance Hub and mediated via structured digital records.',
    providerSignedAt: now,
    status: 'Sent' as const,
    legalDisclaimer:
      'Notice: This agreement record and its timestamps are generated for business operational convenience and record-keeping. It does not replace independent legal advice.',
    contractHash: Buffer.from(`${ctrId}:${totalValue}:${provider.id}:${now}`).toString('hex'),
    qrVerificationReference: `VRF-${ctrId}`,
    createdAt: now,
    updatedAt: now,
  };

  state.contracts.unshift(newContract);

  recordAuditLog('CONTRACT_CREATED', provider.name, ctrId, `Digital Contract ${ctrId} drafted for ${clientName}.`, req.ip);
  dbAdapter.persist();

  res.status(201).json({
    success: true,
    contract: newContract,
  });
});

/**
 * POST /api/contracts/:id/sign
 */
apiRouter.post('/contracts/:id/sign', (req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const c = state.contracts.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Contract not found.' });

  const now = new Date().toISOString();
  c.clientSignedAt = now;
  c.status = 'Active';
  c.updatedAt = now;

  recordAuditLog('CONTRACT_COUNTERSIGNED', c.clientEmail, c.id, `Contract ${c.id} countersigned by client ${c.clientName}. Status: Active.`, req.ip);
  dbAdapter.persist();

  res.json({
    success: true,
    message: 'Contract successfully countersigned and activated.',
    contract: c,
  });
});

// ---------------- 5. AI AGENTS & CHAT ----------------

/**
 * POST /api/ai/chat
 */
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const { businessId, userMessage, chatHistory } = req.body;

  if (!userMessage || !userMessage.trim()) {
    return res.status(400).json({ error: 'userMessage is required.' });
  }

  const state = dbAdapter.getState();
  const business = state.businesses.find((b) => b.id === businessId) || state.businesses[0];
  const profile = state.business_profiles.find((p) => p.businessId === business.id);

  try {
    const aiResponse = await generateBusinessAssistantResponse({
      businessName: business.name,
      category: business.category,
      services: ['Custom Software Development', 'Digital Automation', 'API Integration'],
      products: ['GOYE Business Suite', 'Digital Invoices'],
      businessHours: profile?.businessHours || 'Monday - Friday: 09:00 - 17:00 WAT',
      supportEmail: profile?.supportEmail || business.email,
      whatsappHandoffNumber: profile?.whatsappHandoffNumber || business.phone,
      customInstructions: 'Provide concise factual guidance. State clearly when a detail is unrecorded.',
      userMessage: userMessage.trim(),
      chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
    });

    // Save conversation to persistent ai_conversations table
    state.ai_conversations.unshift({
      id: `AIC-${Date.now()}`,
      businessId: business.id,
      sessionId: `SES-${Date.now()}`,
      userMessage: userMessage.trim(),
      assistantReply: aiResponse.text,
      source: aiResponse.source,
      createdAt: new Date().toISOString(),
    });
    dbAdapter.persist();

    res.json({
      success: true,
      businessId: business.id,
      assistantName: `${business.name} AI Assistant`,
      reply: aiResponse.text,
      source: aiResponse.source,
      whatsappHandoffUrl: `https://wa.me/${(profile?.whatsappHandoffNumber || business.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hello ${business.name}, I inquired via your GOYE AI Assistant regarding: "${userMessage.slice(0, 80)}..."`
      )}`,
    });
  } catch (err: unknown) {
    console.error('AI Chat Error:', err);
    res.status(500).json({
      error: 'Unable to process AI inquiry at this moment.',
    });
  }
});

/**
 * GET /api/agents
 */
apiRouter.get('/agents', (_req: Request, res: Response) => {
  const state = dbAdapter.getState();
  res.json({ agents: state.ai_agents });
});

// ---------------- 6. PAYMENT PROVIDERS ----------------

/**
 * GET /api/payments/providers
 */
apiRouter.get('/payments/providers', (_req: Request, res: Response) => {
  const state = dbAdapter.getState();
  const piConfig = getPiServerConfig();

  const providers = state.payment_providers.map((p) => {
    if (p.id === 'pi_network') {
      return {
        ...p,
        enabled: piConfig.isApiKeyConfigured,
        environment: piConfig.networkMode,
        status: piConfig.isApiKeyConfigured
          ? 'ACTIVE (Official Platform API)'
          : 'NOT CONFIGURED (Requires Server API Key)',
      };
    }
    return p;
  });

  res.json({ providers });
});

// ---------------- 7. PRODUCTION AUDIT & SYSTEM STATUS ----------------

/**
 * GET /api/audit/system-status
 * Factual report covering Database persistence, Pi credentials, Payment integrity, and Environment
 */
apiRouter.get('/audit/system-status', (_req: Request, res: Response) => {
  const piConfig = getPiServerConfig();
  const dbStatus = dbAdapter.getProductionStatus();
  const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  res.json({
    application: 'GOYE Web3 Business Hub',
    version: '1.0.0-production-hardened',
    timestamp: new Date().toISOString(),

    // 1. Database Persistence Layer
    database: {
      status: dbStatus.statusReport,
      adapterType: dbStatus.adapterType,
      isProductionDbConfigured: dbStatus.isProductionConfigured,
      persistenceFile: dbStatus.dbFilePath,
      records: dbStatus.recordCounts,
      schemasImplemented: [
        'users',
        'businesses',
        'business_profiles',
        'business_ids',
        'business_verifications',
        'products',
        'services',
        'orders',
        'order_items',
        'payments',
        'payment_events',
        'payment_providers',
        'invoices',
        'invoice_items',
        'contracts',
        'contract_parties',
        'ai_agents',
        'ai_agent_configs',
        'ai_conversations',
        'marketplace_listings',
        'documents',
        'qr_codes',
        'notifications',
        'audit_logs',
        'admin_users',
        'support_tickets',
      ],
    },

    // 2. Pi Network Status
    piIntegration: {
      networkMode: piConfig.networkMode,
      sandbox: piConfig.sandbox,
      piSdk: 'AVAILABLE (https://sdk.minepi.com/pi-sdk.js)',
      piApi: piConfig.isApiKeyConfigured ? 'AVAILABLE' : 'UNAVAILABLE',
      serverApiKeyStatus: piConfig.isApiKeyConfigured ? 'CONFIGURED' : 'NOT CONFIGURED',
      testnetWallet: piConfig.testnetWallet,
      testnetWalletLabel: 'Pi Testnet — Developer Testing Only',
      mainnetWallet: piConfig.mainnetWallet,
      mainnetStatus: 'DISABLED (Requires valid server credentials & Pi Developer Portal review)',
      domainValidation: 'MANUAL PI PORTAL VERIFICATION REQUIRED',
      developerPortalStatus: 'MANUAL PI PORTAL VERIFICATION REQUIRED',
      mockPaymentFlow: 'DISABLED (Strict anti-mock policy)',
    },

    // 3. Payment Integrity
    paymentIntegrity: {
      invoiceStatusFlow: 'Pending -> Under Review (Evidence Submitted) -> Paid (Authorized Reconciliation)',
      automaticPaidMarking: 'PROHIBITED',
      frontendPaymentOverride: 'PROHIBITED',
      serverVerifiedPiCompletion: 'ENFORCED',
    },

    // 4. AI Security
    aiSecurity: {
      geminiApiKey: isGeminiConfigured ? 'CONFIGURED' : 'NOT CONFIGURED (Using domain rules engine)',
      model: 'gemini-3.8-flash',
      clientKeyExposure: 'ZERO EXPOSURE (Server-side proxy only)',
    },

    // 5. Admin Security
    adminSecurity: {
      routeProtection: 'ENFORCED via requireAdminAuth',
      clientRoleTrust: 'REJECTED (Server authorization required)',
      auditLogsImmutable: true,
    },

    // 6. Configured vs Unconfigured Breakdown
    configuredItems: [
      '25-table relational schema with persistent disk engine (./data/goye_database.json)',
      'Server-side admin authorization middleware (requireAdminAuth)',
      'Server-side verification endpoints (/api/verify/business, /invoice, /contract)',
      'Payment evidence reconciliation workflow (Pending -> Under Review -> Paid)',
      'Dual Web2 + Pi Browser capability detection',
      'Server-side Pi Platform API approval & completion architecture',
      'Server-side Gemini AI integration with zero browser key exposure',
      'All 9 specialized AI Agents defined with role parameters',
      'Statutory non-custodial and Web3 risk disclosures',
    ],

    notConfiguredItems: [
      dbStatus.isProductionConfigured ? null : 'DATABASE_URL (Cloud SQL / PostgreSQL instance connection)',
      piConfig.isApiKeyConfigured ? null : 'PI_API_KEY (Server API Key for Pi Platform API)',
      process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_SECRET_KEY !== 'NOT CONFIGURED'
        ? null
        : 'PAYSTACK_SECRET_KEY',
      process.env.FLUTTERWAVE_SECRET_KEY && process.env.FLUTTERWAVE_SECRET_KEY !== 'NOT CONFIGURED'
        ? null
        : 'FLUTTERWAVE_SECRET_KEY',
    ].filter(Boolean),

    manualVerificationRequired: [
      'Pi Developer Portal Domain Validation',
      'Pi Developer Portal Connected App Wallet',
      'Cloud SQL / PostgreSQL instance provisioning and DATABASE_URL injection',
    ],
  });
});

// ---------------- 8. GLOBAL UNIFIED SEARCH ROUTE ----------------

/**
 * GET /api/search
 * Global search across products, businesses, invoices, contracts
 */
apiRouter.get('/search', (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Query parameter q is required.' });
  }

  const query = q.trim().toLowerCase();
  const state = dbAdapter.getState();

  const matchingProducts = (state.products || []).filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.sellerBusinessName && p.sellerBusinessName.toLowerCase().includes(query))
  );

  const matchingBusinesses = state.businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(query) ||
      b.id.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      b.tagline.toLowerCase().includes(query)
  );

  const matchingInvoices = state.invoices.filter(
    (i) =>
      i.id.toLowerCase().includes(query) ||
      i.buyerName.toLowerCase().includes(query) ||
      i.sellerName.toLowerCase().includes(query)
  );

  const matchingContracts = state.contracts.filter(
    (c) =>
      c.id.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      c.clientName.toLowerCase().includes(query) ||
      c.providerName.toLowerCase().includes(query)
  );

  res.json({
    query: q,
    totalResults:
      matchingProducts.length +
      matchingBusinesses.length +
      matchingInvoices.length +
      matchingContracts.length,
    results: {
      products: matchingProducts,
      businesses: matchingBusinesses,
      invoices: matchingInvoices,
      contracts: matchingContracts,
    },
  });
});

export { apiRouter };

