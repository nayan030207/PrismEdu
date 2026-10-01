import * as React from 'react';
import { cn } from '@/lib/utils';
import type { InsightLevel } from '@/lib/types';

interface InsightBadgeProps {
  level: InsightLevel;
  className?: string;
  category?: 'academic' | 'attendance' | 'financial' | 'career' | 'support';
}

export function InsightBadge({ level, className, category }: InsightBadgeProps) {
  // Label mapping tailored to user spec
  const getCustomLabel = () => {
    if (category === 'financial') {
      if (level === 'attention_required' || level === 'critical') return 'Support Required';
      if (level === 'declining') return 'Support Available';
      return 'Stable';
    }
    if (category === 'career') {
      if (level === 'good') return 'Active';
      if (level === 'declining') return 'Low Activity';
      return 'Guidance Recommended';
    }
    switch (level) {
      case 'good':
        return 'Good Standing';
      case 'attention_required':
        return 'Attention Required';
      case 'declining':
        return 'Declining';
      case 'critical':
        return 'Critical Attention';
      default:
        return 'Stable';
    }
  };

  const getStyle = () => {
    switch (level) {
      case 'good':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'attention_required':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'declining':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
        };
      case 'critical':
        return {
          bg: 'bg-red-50 text-red-800 border-red-200',
          dot: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-xs transition-colors',
        style.bg,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', style.dot)} />
      {getCustomLabel()}
    </span>
  );
}
