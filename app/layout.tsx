import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GOYE Web3 Business Hub',
  description:
    'Build Your Business. Take It Online. Add AI. AI + Web3 Business Infrastructure for the Global Digital Economy.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'GOYE Web3 Business Hub',
    description:
      'Build Your Business. Take It Online. Add AI. AI + Web3 Business Infrastructure for the Global Digital Economy.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#060B18] text-slate-100 antialiased leading-relaxed tracking-normal">
        {children}
      </body>
    </html>
  );
}
