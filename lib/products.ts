export type ProductIconName =
  | 'fingerprint'
  | 'bot'
  | 'store'
  | 'package'
  | 'graduation'
  | 'compliance'
  | 'handshake'
  | 'receipt'
  | 'scale'
  | 'building'
  | 'globe'
  | 'shopping'
  | 'cpu'
  | 'key'
  | 'code';

export interface ProductData {
  id: number;
  name: string;
  desc: string;
  price: number;
  memo: string;
  image: string;
  iconName: ProductIconName;
}

export const FLAGSHIP_PRODUCTS: ProductData[] = [
  {
    id: 1,
    name: 'Business ID Registration',
    desc: '5-Level Verifiable Cryptographic Identity for trusted global trade onboarding.',
    price: 2,
    memo: 'GOYE #1 Business ID',
    image: '/products/product-1.jpg',
    iconName: 'fingerprint',
  },
  {
    id: 2,
    name: 'AI Assistant Setup',
    desc: 'Autonomous AI enterprise agents for lead capture, intake, and customer workflows.',
    price: 3,
    memo: 'GOYE #2 AI Assistant',
    image: '/products/product-2.jpg',
    iconName: 'bot',
  },
  {
    id: 3,
    name: 'Marketplace Listing',
    desc: 'Web3 Global Marketplace verified storefront listing for B2B buyers and partners.',
    price: 1,
    memo: 'GOYE #3 Marketplace',
    image: '/products/product-3.jpg',
    iconName: 'store',
  },
  {
    id: 4,
    name: 'Supply Chain Tracking',
    desc: 'End-to-end provenance verification and serialized shipment batch records.',
    price: 2,
    memo: 'GOYE #4 Supply Chain',
    image: '/products/product-4.jpg',
    iconName: 'package',
  },
  {
    id: 5,
    name: 'Academy Certification',
    desc: 'Accredited Web3 commerce and AI developer certification track.',
    price: 1,
    memo: 'GOYE #5 Academy Cert',
    image: '/products/product-5.jpg',
    iconName: 'graduation',
  },
  {
    id: 6,
    name: 'Enterprise Compliance Kit',
    desc: 'Exportable audit logs, corporate KYB packets, and regulatory reporting.',
    price: 4,
    memo: 'GOYE #6 Compliance Kit',
    image: '/products/product-6.jpg',
    iconName: 'compliance',
  },
  {
    id: 7,
    name: 'Escrow Contracts',
    desc: 'Automated milestone-based commercial agreements with verifiable audit trails.',
    price: 2,
    memo: 'GOYE #7 Escrow Contract',
    image: '/products/product-7.jpg',
    iconName: 'handshake',
  },
  {
    id: 8,
    name: 'Invoicing & Settlement',
    desc: 'Cryptographic invoicing with timestamped commercial verification receipts.',
    price: 1,
    memo: 'GOYE #8 Invoicing',
    image: '/products/product-8.jpg',
    iconName: 'receipt',
  },
  {
    id: 9,
    name: 'Trade Assurance Protocol',
    desc: 'Structured dispute resolution and bonded transaction milestone protection.',
    price: 3,
    memo: 'GOYE #9 Trade Assure',
    image: '/products/product-9.jpg',
    iconName: 'scale',
  },
  {
    id: 10,
    name: 'Corporate Business Profile',
    desc: 'Public verifiable business registry profile built for international partners.',
    price: 2,
    memo: 'GOYE #10 Corp Profile',
    image: '/products/product-10.jpg',
    iconName: 'building',
  },
  {
    id: 11,
    name: 'Website Development',
    desc: 'Launch high-conversion enterprise websites integrated with modern AI tools.',
    price: 3,
    memo: 'GOYE #11 Website Dev',
    image: '/products/product-11.jpg',
    iconName: 'globe',
  },
  {
    id: 12,
    name: 'E-Commerce Systems',
    desc: 'Turnkey digital storefronts engineered for high-growth African and global markets.',
    price: 4,
    memo: 'GOYE #12 E-Commerce',
    image: '/products/product-12.jpg',
    iconName: 'shopping',
  },
  {
    id: 13,
    name: 'AI Business Automation',
    desc: '24/7 AI reception, automated lead qualification, and seamless WhatsApp handoff.',
    price: 5,
    memo: 'GOYE #13 AI Automation',
    image: '/products/product-13.jpg',
    iconName: 'cpu',
  },
  {
    id: 14,
    name: 'Cryptographic Business ID',
    desc: 'Establish cross-border corporate trust with tamper-evident identity credentials.',
    price: 3,
    memo: 'GOYE #14 Crypto ID',
    image: '/products/product-14.jpg',
    iconName: 'key',
  },
  {
    id: 15,
    name: 'Production Web Engineering',
    desc: 'Custom full-stack web architecture, API integrations, and cloud reliability.',
    price: 3,
    memo: 'GOYE #15 Web Eng',
    image: '/products/product-15.jpg',
    iconName: 'code',
  },
];

export function getProductById(productId: unknown): ProductData | undefined {
  const numId = typeof productId === 'number' ? productId : Number(productId);
  if (!Number.isInteger(numId) || numId <= 0) return undefined;
  return FLAGSHIP_PRODUCTS.find((p) => p.id === numId);
}
