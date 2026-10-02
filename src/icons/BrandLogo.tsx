import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  subtitle = 'All PDF Tools in One Place',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="logoBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="logoBackDoc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#075985" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="logoFrontDoc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="logoCyanSwoosh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="logoPdfBadge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0284c7" floodOpacity="0.4" />
          </filter>
          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Back layered 3D document */}
        <path
          d="M 38 18 L 86 18 L 104 36 L 104 108 A 8 8 0 0 1 96 116 L 38 116 A 8 8 0 0 1 30 108 L 30 26 A 8 8 0 0 1 38 18 Z"
          fill="url(#logoBackDoc)"
          transform="rotate(-5 67 67)"
        />

        {/* Main front glossy white/cyan document */}
        <g filter="url(#logoShadow)">
          <path
            d="M 28 20 L 78 20 L 98 40 L 98 106 A 8 8 0 0 1 90 114 L 28 114 A 8 8 0 0 1 20 106 L 20 28 A 8 8 0 0 1 28 20 Z"
            fill="url(#logoFrontDoc)"
            stroke="#bae6fd"
            strokeWidth="1.5"
          />

          {/* Folded Top Corner */}
          <path
            d="M 78 20 L 78 38 A 2 2 0 0 0 80 40 L 98 40 Z"
            fill="#e0f2fe"
            stroke="#7dd3fc"
            strokeWidth="1"
          />

          {/* Cyan Dynamic Swoosh Curve */}
          <path
            d="M 22 74 C 42 58, 72 62, 96 84 C 78 72, 45 72, 22 86 Z"
            fill="url(#logoCyanSwoosh)"
          />
          <path
            d="M 23 80 C 44 68, 74 72, 94 92 C 78 80, 48 80, 23 90 Z"
            fill="#38bdf8"
            opacity="0.8"
          />

          {/* Document Content Abstract Lines */}
          <rect x="30" y="34" width="38" height="4.5" rx="2.25" fill="#0284c7" />
          <rect x="30" y="44" width="46" height="3" rx="1.5" fill="#94a3b8" />
          <rect x="30" y="52" width="36" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="30" y="60" width="42" height="3" rx="1.5" fill="#e2e8f0" />

          {/* PDF Red Ribbon Badge */}
          <g filter="url(#badgeShadow)">
            <rect x="22" y="88" width="42" height="20" rx="5" fill="url(#logoPdfBadge)" />
            <text
              x="43"
              y="102.5"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="11"
              fontWeight="900"
              fill="#ffffff"
              textAnchor="middle"
              letterSpacing="0.8"
            >
              PDF
            </text>
          </g>

          {/* Glossy top-left highlight */}
          <path
            d="M 20 28 A 8 8 0 0 1 28 20 L 74 20 L 20 74 Z"
            fill="#ffffff"
            opacity="0.35"
          />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-xl tracking-tight leading-none text-white drop-shadow-sm flex items-center gap-1">
            Smart <span className="text-cyan-400 bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">PDF</span> Studio
          </span>
          {subtitle && (
            <span className="text-[11px] font-medium text-slate-400 tracking-wide mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
