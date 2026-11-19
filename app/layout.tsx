import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GOYE Web3 Business Hub',
  description:
    'Build. Automate. Trade. Pay. Grow. AI + Web3 Business Infrastructure for the Global Digital Economy.',
  openGraph: {
    title: 'GOYE Web3 Business Hub',
    description:
      'Build. Automate. Trade. Pay. Grow. AI + Web3 Business Infrastructure for the Global Digital Economy.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0E14] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
