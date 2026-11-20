'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#060B18',
          color: '#f1f5f9',
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <img
            src="/logo.png"
            alt="GOYE Web3 Business Hub"
            width={72}
            height={72}
            style={{ borderRadius: '14px', objectFit: 'cover', marginBottom: '16px' }}
          />
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>
            GOYE Web3 Business Hub
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 18px' }}>
            Loading GOYE workspace...
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: '#D4AF37',
              color: '#0A1128',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Reload Hub
          </button>
        </div>
      </body>
    </html>
  );
}
