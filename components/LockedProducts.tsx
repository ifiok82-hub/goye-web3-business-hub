'use client';
import React, { useState, useEffect } from 'react';
import ProductCardWithImage, { ProductData } from './ProductCardWithImage';

export const FLAGSHIP_PRODUCTS: ProductData[] = [
  {
    id: 1,
    name: 'Business ID Registration',
    desc: '5-Level Verifiable Cryptographic Identity for trusted global trade onboarding.',
    price: 2,
    iconName: 'fingerprint',
  },
  {
    id: 2,
    name: 'AI Assistant Setup',
    desc: 'Autonomous AI enterprise agents for lead capture, intake, and customer workflows.',
    price: 3,
    iconName: 'bot',
  },
  {
    id: 3,
    name: 'Marketplace Listing',
    desc: 'Web3 Global Marketplace verified storefront listing for B2B buyers and partners.',
    price: 1,
    image: '/images/marketplace.jpg',
    iconName: 'store',
  },
  {
    id: 4,
    name: 'Supply Chain Tracking',
    desc: 'End-to-end provenance verification and serialized shipment batch records.',
    price: 2,
    iconName: 'package',
  },
  {
    id: 5,
    name: 'Academy Certification',
    desc: 'Accredited Web3 commerce and AI developer certification track.',
    price: 1,
    image: '/images/academy.jpg',
    iconName: 'graduation',
  },
  {
    id: 6,
    name: 'Enterprise Compliance Kit',
    desc: 'Exportable audit logs, corporate KYB packets, and regulatory reporting.',
    price: 4,
    image: '/images/compliance.jpg',
    iconName: 'compliance',
  },
  {
    id: 7,
    name: 'Escrow Contracts',
    desc: 'Automated milestone-based commercial agreements with verifiable audit trails.',
    price: 2,
    iconName: 'handshake',
  },
  {
    id: 8,
    name: 'Invoicing & Settlement',
    desc: 'Cryptographic invoicing with timestamped commercial verification receipts.',
    price: 1,
    image: '/images/contracts_invoices_1791792093198.jpg',
    iconName: 'receipt',
  },
  {
    id: 9,
    name: 'Trade Assurance Protocol',
    desc: 'Structured dispute resolution and bonded transaction milestone protection.',
    price: 3,
    iconName: 'scale',
  },
  {
    id: 10,
    name: 'Corporate Business Profile',
    desc: 'Public verifiable business registry profile built for international partners.',
    price: 2,
    iconName: 'building',
  },
  {
    id: 11,
    name: 'Website Development',
    desc: 'Launch high-conversion enterprise websites integrated with modern AI tools.',
    price: 3,
    iconName: 'globe',
  },
  {
    id: 12,
    name: 'E-Commerce Systems',
    desc: 'Turnkey digital storefronts engineered for high-growth African and global markets.',
    price: 4,
    iconName: 'shopping',
  },
  {
    id: 13,
    name: 'AI Business Automation',
    desc: '24/7 AI reception, automated lead qualification, and seamless WhatsApp handoff.',
    price: 5,
    image: '/images/ai-business.jpg',
    iconName: 'cpu',
  },
  {
    id: 14,
    name: 'Cryptographic Business ID',
    desc: 'Establish cross-border corporate trust with tamper-evident identity credentials.',
    price: 3,
    iconName: 'key',
  },
  {
    id: 15,
    name: 'Production Web Engineering',
    desc: 'Custom full-stack web architecture, API integrations, and cloud reliability.',
    price: 3,
    iconName: 'code',
  },
];

export const PRODUCTS = FLAGSHIP_PRODUCTS;

export default function LockedProducts() {
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      if (typeof window === 'undefined') return;
      try {
        const saved = window.localStorage.getItem('purchased_products');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr)) {
            setUnlockedCount(arr.length);
          }
        }
      } catch {
        // Ignore restricted storage in sandboxed iframes
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              15 Flagship Products & Infrastructure
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#F5D061] border border-[#D4AF37]/30 font-semibold">
              Enterprise Suite
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Clear, modular digital business infrastructure ready for instant enterprise deployment.
          </p>
        </div>
        <div className="text-xs sm:text-sm font-mono text-slate-300 shrink-0 bg-[#0E162B] px-4 py-2 rounded-xl border border-slate-800">
          Unlocked: <strong className="text-[#F5D061] font-bold">{unlockedCount}</strong> / 15
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FLAGSHIP_PRODUCTS.map((p) => (
          <ProductCardWithImage key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
