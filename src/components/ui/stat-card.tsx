import * as React from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number | string;
    label?: string;
    up?: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue' | 'slate';
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'indigo',
  description,
  className,
}: StatCardProps) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-200',
    },
    red: {
      bg: 'bg-red-50 text-red-600',
      border: 'hover:border-red-200',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-200',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-600',
      border: 'hover:border-slate-300',
    },
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <Card className={cn('p-5 transition-all hover:shadow-md', selectedColor.border, className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={cn('p-2.5 rounded-lg', selectedColor.bg)}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
        {trend && (
          <div
            className={cn(
              'flex items-center text-xs font-semibold',
              trend.up ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {trend.up ? (
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
            )}
            <span>{trend.value}</span>
            {trend.label && <span className="ml-1 text-slate-400 font-normal">{trend.label}</span>}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-1.5 text-xs text-slate-500">{description}</p>
      )}
    </Card>
  );
}
