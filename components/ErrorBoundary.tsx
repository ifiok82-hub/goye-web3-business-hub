'use client';
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Prevent blank white screen on unexpected runtime errors
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{ backgroundColor: '#060B18', color: '#f1f5f9' }}
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4"
        >
          <img
            src="/logo.png"
            alt="GOYE Web3 Business Hub"
            width={64}
            height={64}
            className="w-16 h-16 rounded-xl object-cover border border-slate-700/70"
          />
          <h1 className="text-xl font-bold text-white">Loading GOYE...</h1>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0B0E14] font-bold text-sm cursor-pointer"
          >
            Reload Hub
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
