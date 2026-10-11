-- =========================================================================
-- GOYE Web3 Business Hub - Production Relational Schema
-- Standard SQL DDL (PostgreSQL / Cloud SQL Compatible)
-- =========================================================================

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER',
    phone VARCHAR(64),
    pi_uid VARCHAR(128) UNIQUE,
    pi_username VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. businesses
CREATE TABLE IF NOT EXISTS businesses (
    id VARCHAR(64) PRIMARY KEY, -- e.g. GOYE-BIZ-2026-000001
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    category VARCHAR(128) NOT NULL,
    country VARCHAR(128) NOT NULL DEFAULT 'Nigeria',
    state VARCHAR(128) NOT NULL,
    address TEXT,
    website VARCHAR(255),
    phone VARCHAR(64),
    email VARCHAR(255) NOT NULL,
    registration_info VARCHAR(255),
    verification_level SMALLINT NOT NULL DEFAULT 1 CHECK (verification_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. business_profiles
CREATE TABLE IF NOT EXISTS business_profiles (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    bio TEXT,
    social_links JSONB,
    business_hours VARCHAR(255),
    support_email VARCHAR(255),
    whatsapp_handoff_number VARCHAR(64),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. business_ids
CREATE TABLE IF NOT EXISTS business_ids (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    qr_verification_reference VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

-- 5. business_verifications
CREATE TABLE IF NOT EXISTS business_verifications (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    notes TEXT,
    submitted_documents JSONB,
    reviewed_by VARCHAR(64),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(128) NOT NULL,
    price_ngn NUMERIC(15, 2) NOT NULL,
    price_usd NUMERIC(15, 2) NOT NULL,
    price_pi NUMERIC(15, 4),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. services
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(128) NOT NULL,
    price_ngn NUMERIC(15, 2) NOT NULL,
    price_usd NUMERIC(15, 2) NOT NULL,
    price_pi NUMERIC(15, 4),
    delivery_time_days INT NOT NULL DEFAULT 5,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. orders
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_reference VARCHAR(64) NOT NULL UNIQUE,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(64),
    seller_business_id VARCHAR(64) NOT NULL REFERENCES businesses(id),
    item_id VARCHAR(64) NOT NULL,
    item_title VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
    payment_provider VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'PAID', 'FAILED', 'CANCELLED')),
    payment_reference VARCHAR(128),
    reconciled_by VARCHAR(64),
    reconciled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. order_items
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL,
    item_title VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(15, 2) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL
);

-- 10. payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_provider VARCHAR(64) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'PAID', 'FAILED', 'REJECTED')),
    external_reference VARCHAR(128),
    txid VARCHAR(128),
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    evidence_submitted_at TIMESTAMP WITH TIME ZONE,
    evidence_notes TEXT,
    verified_by VARCHAR(64),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. payment_events
CREATE TABLE IF NOT EXISTS payment_events (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    raw_payload JSONB,
    verified_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. payment_providers
CREATE TABLE IF NOT EXISTS payment_providers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(64) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    environment VARCHAR(32) NOT NULL,
    currency VARCHAR(64) NOT NULL,
    status VARCHAR(64) NOT NULL,
    verification_method TEXT,
    notes TEXT
);

-- 13. invoices
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(64) PRIMARY KEY, -- e.g. INV-2026-0104
    seller_business_id VARCHAR(64) NOT NULL REFERENCES businesses(id),
    seller_name VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_company VARCHAR(255),
    subtotal NUMERIC(15, 2) NOT NULL,
    tax_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 7.5,
    tax_amount NUMERIC(15, 2) NOT NULL,
    total NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
    due_date DATE NOT NULL,
    notes TEXT,
    payment_method VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Draft', 'Sent', 'Pending', 'Under Review', 'Paid', 'Cancelled', 'Expired')),
    payment_evidence_reference VARCHAR(128),
    payment_evidence_notes TEXT,
    evidence_submitted_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    reconciled_by VARCHAR(64),
    qr_verification_reference VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. invoice_items
CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR(64) PRIMARY KEY,
    invoice_id VARCHAR(64) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(15, 2) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL
);

-- 15. contracts
CREATE TABLE IF NOT EXISTS contracts (
    id VARCHAR(64) PRIMARY KEY, -- e.g. CTR-2026-0089
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_business_id VARCHAR(64),
    provider_business_id VARCHAR(64) NOT NULL REFERENCES businesses(id),
    provider_name VARCHAR(255) NOT NULL,
    service_description TEXT NOT NULL,
    deliverables JSONB NOT NULL,
    total_value NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
    start_date DATE NOT NULL,
    deadline_date DATE NOT NULL,
    payment_terms TEXT NOT NULL,
    cancellation_terms TEXT NOT NULL,
    dispute_instructions TEXT NOT NULL,
    provider_signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    client_signed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Active', 'Completed', 'Disputed', 'Terminated')),
    legal_disclaimer TEXT NOT NULL,
    contract_hash VARCHAR(128) NOT NULL UNIQUE,
    qr_verification_reference VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. contract_parties
CREATE TABLE IF NOT EXISTS contract_parties (
    id VARCHAR(64) PRIMARY KEY,
    contract_id VARCHAR(64) NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL,
    party_name VARCHAR(255) NOT NULL,
    party_email VARCHAR(255) NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE
);

-- 17. ai_agents
CREATE TABLE IF NOT EXISTS ai_agents (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    capabilities JSONB NOT NULL,
    tier_required VARCHAR(32) NOT NULL DEFAULT 'FREE',
    default_model VARCHAR(64) NOT NULL DEFAULT 'gemini-3.8-flash',
    system_prompt_base TEXT NOT NULL,
    sample_inquiries JSONB NOT NULL
);

-- 18. ai_agent_configs
CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    agent_id VARCHAR(64) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    custom_prompt TEXT,
    lead_capture_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_handoff_number VARCHAR(64),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. ai_conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    session_id VARCHAR(128) NOT NULL,
    user_message TEXT NOT NULL,
    assistant_reply TEXT NOT NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'rules_engine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. marketplace_listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id VARCHAR(64) PRIMARY KEY,
    seller_business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    seller_business_name VARCHAR(255) NOT NULL,
    seller_verification_level SMALLINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(128) NOT NULL,
    price_ngn NUMERIC(15, 2) NOT NULL,
    price_usd NUMERIC(15, 2) NOT NULL,
    price_pi NUMERIC(15, 4),
    deliverables JSONB NOT NULL,
    delivery_time_days INT NOT NULL DEFAULT 5,
    rating_average NUMERIC(3, 2) DEFAULT 5.0,
    completed_deals INT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. documents
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(64) NOT NULL,
    file_hash VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(64),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 22. qr_codes
CREATE TABLE IF NOT EXISTS qr_codes (
    id VARCHAR(64) PRIMARY KEY,
    reference_type VARCHAR(32) NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    verification_endpoint VARCHAR(255) NOT NULL,
    verification_hash VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(64) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(64),
    is_tamper_evident BOOLEAN DEFAULT TRUE
);

-- 25. admin_users & support_tickets
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    role VARCHAR(32) NOT NULL DEFAULT 'COMPLIANCE_OFFICER',
    api_key_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) REFERENCES businesses(id),
    requester_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- INDEXES FOR PRODUCTION QUERY PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_level ON businesses(verification_level);
CREATE INDEX IF NOT EXISTS idx_invoices_seller ON invoices(seller_business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_contracts_provider ON contracts(provider_business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_qr_codes_hash ON qr_codes(verification_hash);
