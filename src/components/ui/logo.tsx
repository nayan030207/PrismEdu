'use client';

import * as React from 'react';

interface PrismLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'color';
  stacked?: boolean;
  edition?: 'ED' | 'EDU';
}

export function PrismLogo({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = false,
  variant = 'color',
  stacked = false,
  edition = 'ED',
}: PrismLogoProps) {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`inline-flex ${stacked ? 'flex-col items-center text-center' : 'items-center'} gap-3 ${className}`}>
      {/* Official PRISM Emblem SVG matching provided screenshot */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          {/* Top Navy Curve of P */}
          <path
            d="M 68 32 C 105 32 175 32 175 90 C 175 145 125 152 98 152 L 98 126 C 115 126 147 122 147 90 C 147 58 105 58 68 58 Z"
            fill={variant === 'light' ? '#64748B' : '#0C182B'}
          />

          {/* Left 3D Prism Upper Light Facet */}
          <path
            d="M 68 32 L 140 100 L 68 178 Z"
            fill="url(#prismTopFacet)"
          />

          {/* Left 3D Prism Lower Dark Facet */}
          <path
            d="M 68 95 L 140 100 L 68 178 Z"
            fill="url(#prismBottomFacet)"
          />

          {/* Graduation Cap in Negative Space */}
          <g transform="translate(92, 58) scale(0.95)">
            <path
              d="M 22 8 L 41 17.5 L 22 27 L 3 17.5 Z"
              fill={variant === 'light' ? '#0F172A' : '#0C182B'}
            />
            <path
              d="M 12 21 L 12 28.5 C 12 33.5 32 33.5 32 28.5 L 32 21 Z"
              fill={variant === 'light' ? '#0F172A' : '#0C182B'}
            />
            <circle cx="37" cy="27" r="2.5" fill={variant === 'light' ? '#0F172A' : '#0C182B'} />
            <line x1="36" y1="18" x2="37" y2="25" stroke={variant === 'light' ? '#0F172A' : '#0C182B'} strokeWidth="1.5" strokeLinecap="round" />
          </g>

          <defs>
            <linearGradient id="prismTopFacet" x1="68" y1="32" x2="140" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="60%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="prismBottomFacet" x1="68" y1="95" x2="140" y2="178" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Official Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className={`font-black tracking-tight leading-none ${textSizes[size]}`}>
            <span className={variant === 'light' ? 'text-white' : 'text-[#0C182B]'}>PRISM-</span>
            <span className="text-[#8B5CF6]">{edition}</span>
          </div>
          {showSubtitle && (
            <p className={`font-medium tracking-wide mt-1.5 ${variant === 'light' ? 'text-slate-300' : 'text-slate-600'} ${subSizes[size]}`}>
              Predictive Risk &amp; Intervention System for Monitoring <span className="text-[#8B5CF6] font-bold">ED</span>ucation
            </p>
          )}
        </div>
      )}
    </div>
  );
}
