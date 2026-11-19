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
        <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5D061] via-[#D4AF37] to-[#8C6A1B] flex items-center justify-center font-black text-[#0B0E14] text-xl">
            G
          </div>
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
