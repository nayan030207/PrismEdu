'use client';

import * as React from 'react';
import { CoreSpinLoader } from '@/components/ui/core-spin-loader';
import { PrismLogo } from '@/components/ui/logo';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = 'Loading PRISM-EDU analytics...', fullScreen = true }: LoadingScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-slate-950/95 text-white backdrop-blur-xl transition-all duration-300 ${
        fullScreen ? 'fixed inset-0 z-50 min-h-screen w-full' : 'w-full py-16 rounded-2xl border border-slate-800 bg-slate-950/90'
      }`}
    >
      {/* Ambient background glows */}
      <div className="absolute h-72 w-72 rounded-full bg-purple-600/20 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute h-56 w-56 rounded-full bg-indigo-500/15 blur-2xl animate-pulse pointer-events-none delay-500" />

      <div className="relative z-10 flex flex-col items-center space-y-4 px-4 text-center">
        {/* Core Spin Loader Animation */}
        <CoreSpinLoader />

        {/* Official PRISM-EDU Logo Branding */}
        <div className="pt-2">
          <PrismLogo size="md" showSubtitle={true} variant="light" className="justify-center" />
        </div>

        {/* Status Message */}
        {message && (
          <p className="text-xs font-medium text-slate-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
