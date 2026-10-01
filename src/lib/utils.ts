import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import type { InsightLevel, InterventionStatus, InterventionType, AccountStatus } from './types';

/** Tailwind class merger */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date string to a human-readable format */
export function formatDate(dateStr: string | null | undefined, fmt = 'MMM d, yyyy') {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), fmt);
  } catch {
    return '—';
  }
}

/** Format date as relative time */
export function timeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '—';
  }
}

/** Convert a snake_case or underscore string to Title Case */
export function toTitleCase(str: string) {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Truncate text to a given length */
export function truncate(text: string, length = 80) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '…';
}

/** Insight level → label + colour classes */
export function insightLevelMeta(level: InsightLevel) {
  const map: Record<InsightLevel, { label: string; bg: string; text: string; dot: string }> = {
    good: {
      label: 'Good',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    attention_required: {
      label: 'Needs Attention',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    declining: {
      label: 'Declining',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
    },
    critical: {
      label: 'Critical',
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
    },
  };
  return map[level] ?? map.good;
}

/** Intervention status → label + colour */
export function interventionStatusMeta(status: InterventionStatus) {
  const map: Record<InterventionStatus, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
    in_progress: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-700' },
    completed: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-600' },
  };
  return map[status] ?? map.pending;
}

/** Intervention type → label */
export function interventionTypeLabel(type: InterventionType) {
  const map: Record<InterventionType, string> = {
    academic: 'Academic',
    attendance_engagement: 'Attendance',
    financial: 'Financial',
    personal_support: 'Personal',
    career: 'Career',
  };
  return map[type] ?? toTitleCase(type);
}

/** Account status → colours */
export function statusMeta(status: AccountStatus) {
  return status === 'active'
    ? { label: 'Active', bg: 'bg-emerald-100', text: 'text-emerald-700' }
    : { label: status === 'inactive' ? 'Inactive' : 'Suspended', bg: 'bg-red-100', text: 'text-red-700' };
}

/** Generate a random alphanumeric password */
export function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Build a query string from an object (skips undefined/null) */
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** Calculate percentage attendance rate from attended & total classes */
export function calculateAttendanceRate(attended: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((attended / total) * 10000) / 100;
}

/** Classify risk level score into 'low' | 'medium' | 'high' */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.65) return 'high';
  if (score >= 0.35) return 'medium';
  return 'low';
}

/** Insight level to semantic color class name */
export function getInsightColor(level: InsightLevel): string {
  switch (level) {
    case 'good':
      return 'text-emerald-700 bg-emerald-50';
    case 'attention_required':
      return 'text-amber-700 bg-amber-50';
    case 'declining':
      return 'text-orange-700 bg-orange-50';
    case 'critical':
      return 'text-red-700 bg-red-50';
    default:
      return 'text-slate-700 bg-slate-50';
  }
}
