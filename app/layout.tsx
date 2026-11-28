import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'GOYEWEB3 Business Hub',
  description: 'AI + Web3 Infrastructure - Build the Business of Tomorrow',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{ backgroundColor: '#060B18', color: '#f1f5f9', margin: 0 }}
        className="bg-[#060B18] text-slate-100 antialiased leading-relaxed tracking-normal"
      >
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
