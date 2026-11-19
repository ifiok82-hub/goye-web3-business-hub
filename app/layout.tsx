import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'GOYEWEB3 Business Hub',
  description: 'AI + Web3 Infrastructure - Build the Business of Tomorrow',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
