import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
      </head>
      <body className="bg-[#0B0E14] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
