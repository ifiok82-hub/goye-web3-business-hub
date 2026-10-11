/**
 * GOYE Web3 Business Hub - Relational Database Schema Types
 * Comprehensive data models for all 25 entities across the platform.
 */

export type VerificationLevel = 1 | 2 | 3 | 4 | 5;
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PaymentStatus = 'PENDING' | 'UNDER_REVIEW' | 'PAID' | 'FAILED' | 'REJECTED' | 'CANCELLED';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Pending' | 'Under Review' | 'Paid' | 'Cancelled' | 'Expired';
export type ContractStatus = 'Draft' | 'Sent' | 'Active' | 'Completed' | 'Disputed' | 'Terminated';
export type OrderStatus = 'PENDING' | 'UNDER_REVIEW' | 'PAID' | 'FAILED' | 'CANCELLED';

// 1. users
export interface UserRecord {
  id: string; // USR-XXXXXX
  email: string;
  name: string;
  role: 'USER' | 'MERCHANT' | 'ADMIN' | 'COMPLIANCE';
  phone?: string;
  piUid?: string;
  piUsername?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. businesses
export interface BusinessRecord {
  id: string; // GOYE-BIZ-2026-XXXXXX (Primary Key)
  name: string;
  tagline: string;
  description: string;
  category: string;
  country: string;
  state: string;
  address: string;
  website: string;
  phone: string;
  email: string;
  registrationInfo: string;
  verificationLevel: VerificationLevel;
  createdAt: string;
  updatedAt: string;
}

// 3. business_profiles
export interface BusinessProfileRecord {
  id: string;
  businessId: string; // Foreign Key -> businesses.id
  bio: string;
  socials: {
    x?: string;
    linkedin?: string;
    whatsapp?: string;
    facebook?: string;
  };
  businessHours: string;
  supportEmail: string;
  whatsappHandoffNumber: string;
  updatedAt: string;
}

// 4. business_ids
export interface BusinessIdRecord {
  id: string; // Unique GOYE Business ID
  businessId: string; // Foreign Key -> businesses.id
  mintedAt: string;
  qrVerificationReference: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
}

// 5. business_verifications
export interface BusinessVerificationRecord {
  id: string;
  businessId: string; // Foreign Key -> businesses.id
  level: VerificationLevel;
  status: VerificationStatus;
  notes: string;
  submittedDocuments: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// 6. products
export interface ProductRecord {
  id: string;
  businessId: string; // Foreign Key -> businesses.id
  title: string;
  description: string;
  category: string;
  priceNGN: number;
  priceUSD: number;
  pricePi?: number;
  status: 'active' | 'archived';
  createdAt: string;
}

// 7. services
export interface ServiceRecord {
  id: string;
  businessId: string; // Foreign Key -> businesses.id
  title: string;
  description: string;
  category: string;
  priceNGN: number;
  priceUSD: number;
  pricePi?: number;
  deliveryTimeDays: number;
  status: 'active' | 'archived';
  createdAt: string;
}

// 8. orders
export interface OrderRecord {
  id: string; // ORD-XXXXXX
  orderReference: string; // Unique reference
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  sellerBusinessId: string; // Foreign Key -> businesses.id
  itemId: string;
  itemTitle: string;
  amount: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP' | 'PI';
  paymentProvider: string;
  status: OrderStatus;
  paymentReference?: string;
  reconciledBy?: string;
  reconciledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 9. order_items
export interface OrderItemRecord {
  id: string;
  orderId: string; // Foreign Key -> orders.id
  itemId: string;
  itemTitle: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 10. payments
export interface PaymentRecord {
  id: string;
  orderId: string; // Foreign Key -> orders.id
  paymentProvider: 'pi_network' | 'bank_transfer' | 'paystack' | 'flutterwave' | 'usdc' | 'usdt';
  amount: number;
  currency: string;
  status: PaymentStatus;
  externalReference?: string;
  txid?: string;
  idempotencyKey: string;
  evidenceSubmittedAt?: string;
  evidenceNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

// 11. payment_events
export interface PaymentEventRecord {
  id: string;
  paymentId: string; // Foreign Key -> payments.id
  eventType: string;
  rawPayload: any;
  verifiedBy?: string;
  createdAt: string;
}

// 12. payment_providers
export interface PaymentProviderRecord {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  environment: string;
  currency: string;
  status: string;
  verificationMethod: string;
  notes: string;
}

// 13. invoices
export interface InvoiceRecord {
  id: string; // INV-2026-XXXX (Primary Key)
  sellerBusinessId: string; // Foreign Key -> businesses.id
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  total: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP' | 'PI';
  dueDate: string;
  notes: string;
  paymentMethod: string;
  status: InvoiceStatus;
  paymentEvidenceReference?: string;
  paymentEvidenceNotes?: string;
  evidenceSubmittedAt?: string;
  paidAt?: string;
  reconciledBy?: string;
  qrVerificationReference: string;
  createdAt: string;
  updatedAt: string;
}

// 14. invoice_items
export interface InvoiceItemRecord {
  id: string;
  invoiceId: string; // Foreign Key -> invoices.id
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 15. contracts
export interface ContractRecord {
  id: string; // CTR-2026-XXXX (Primary Key)
  title: string;
  clientName: string;
  clientEmail: string;
  clientBusinessId?: string;
  providerBusinessId: string; // Foreign Key -> businesses.id
  providerName: string;
  serviceDescription: string;
  deliverables: string[];
  totalValue: number;
  currency: string;
  startDate: string;
  deadlineDate: string;
  paymentTerms: string;
  cancellationTerms: string;
  disputeInstructions: string;
  providerSignedAt: string;
  clientSignedAt?: string;
  status: ContractStatus;
  legalDisclaimer: string;
  contractHash: string;
  qrVerificationReference: string;
  createdAt: string;
  updatedAt: string;
}

// 16. contract_parties
export interface ContractPartyRecord {
  id: string;
  contractId: string; // Foreign Key -> contracts.id
  role: 'PROVIDER' | 'CLIENT' | 'MEDIATOR';
  partyName: string;
  partyEmail: string;
  signedAt?: string;
}

// 17. ai_agents
export interface AIAgentRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  capabilities: string[];
  tierRequired: 'FREE' | 'STARTER' | 'BUSINESS' | 'PRO' | 'ENTERPRISE';
  defaultModel: string;
  systemPromptBase: string;
  sampleInquiries: string[];
}

// 18. ai_agent_configs
export interface AIAgentConfigRecord {
  id: string;
  businessId: string; // Foreign Key -> businesses.id
  agentId: string; // Foreign Key -> ai_agents.id
  enabled: boolean;
  customPrompt?: string;
  leadCaptureEnabled: boolean;
  whatsappHandoffNumber?: string;
  updatedAt: string;
}

// 19. ai_conversations
export interface AIConversationRecord {
  id: string;
  businessId: string; // Foreign Key -> businesses.id
  sessionId: string;
  userMessage: string;
  assistantReply: string;
  source: 'gemini' | 'rules_engine';
  createdAt: string;
}

// 20. marketplace_listings
export interface MarketplaceListingRecord {
  id: string; // MKT-2026-XXX
  sellerBusinessId: string; // Foreign Key -> businesses.id
  sellerBusinessName: string;
  sellerVerificationLevel: VerificationLevel;
  title: string;
  description: string;
  category: string;
  priceNGN: number;
  priceUSD: number;
  pricePi?: number;
  deliverables: string[];
  deliveryTimeDays: number;
  ratingAverage: number;
  completedDeals: number;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
}

// 21. documents
export interface DocumentRecord {
  id: string;
  businessId: string; // Foreign Key -> businesses.id
  documentName: string;
  documentType: string;
  fileHash: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// 22. qr_codes
export interface QRCodeRecord {
  id: string;
  referenceType: 'business' | 'invoice' | 'contract';
  referenceId: string;
  verificationEndpoint: string;
  verificationHash: string;
  createdAt: string;
}

// 23. notifications
export interface NotificationRecord {
  id: string;
  recipientEmail: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// 24. audit_logs
export interface AuditLogRecord {
  id: string;
  timestamp: string;
  eventType: string;
  actor: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  isImmutable: boolean;
}

// 25. admin_users & support_tickets
export interface AdminUserRecord {
  id: string;
  username: string;
  role: 'SUPER_ADMIN' | 'COMPLIANCE_OFFICER' | 'RECONCILIATION_OFFICER';
  apiKeyHash: string;
  createdAt: string;
}

export interface SupportTicketRecord {
  id: string;
  businessId?: string;
  requesterEmail: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}
