'use client';

import * as React from 'react';
import { CoreSpinLoader } from '@/components/ui/core-spin-loader';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Centered Spin Loader */}
      <div className="py-6 flex items-center justify-center">
        <CoreSpinLoader />
      </div>

      {/* Quick Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
            </div>
            <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        {/* Left Column (Main Widget / Table) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-16 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Side Widgets) */}
        <div className="space-y-6 animate-pulse">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
