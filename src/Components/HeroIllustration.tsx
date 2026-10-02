import React from 'react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[540px] aspect-[1/0.95] flex items-center justify-center mx-auto select-none pointer-events-none">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-indigo-600/10 rounded-full blur-3xl -z-10" />

      {/* Main SVG Composition */}
      <svg
        viewBox="0 0 540 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        <defs>
          <linearGradient id="laptopBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="laptopScreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="50%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="docShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="mainPdfSheet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="backPdfSheet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <linearGradient id="cyanArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="redBadge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Floating badge gradients */}
          <linearGradient id="floatWord" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="floatExcel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="floatJpg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="floatShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="floatTools" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          <filter id="bigGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#02142b" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Outer Circular Neon Orbit Lines */}
        <circle cx="270" cy="250" r="210" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.3" />
        <circle cx="270" cy="250" r="170" stroke="#38bdf8" strokeWidth="1" opacity="0.2" />

        {/* Laptop Base Stand & Keyboard */}
        <g id="laptop" filter="url(#cardShadow)">
          {/* Laptop display frame */}
          <rect x="110" y="90" width="320" height="230" rx="16" fill="url(#laptopBase)" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" />
          {/* Screen glow */}
          <rect x="122" y="102" width="296" height="206" rx="10" fill="url(#laptopScreen)" />
          {/* Subtle grid on screen */}
          <line x1="122" y1="170" x2="418" y2="170" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.2" />
          <line x1="122" y1="240" x2="418" y2="240" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.2" />
          {/* Laptop keyboard deck base */}
          <path d="M 60 330 L 480 330 L 460 365 L 80 365 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <path d="M 230 330 L 310 330 L 305 338 L 235 338 Z" fill="#0f172a" />
          {/* Laptop trackpad outline */}
          <rect x="235" y="344" width="70" height="15" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        </g>

        {/* Secondary angled PDF Document in background */}
        <path
          d="M 190 70 L 320 70 L 370 120 L 370 290 A 12 12 0 0 1 358 302 L 190 302 A 12 12 0 0 1 178 290 L 178 82 A 12 12 0 0 1 190 70 Z"
          fill="url(#backPdfSheet)"
          opacity="0.85"
          transform="rotate(-8 274 186)"
          filter="url(#cardShadow)"
        />

        {/* PRIMARY LARGE CENTRAL PDF DOCUMENT */}
        <g id="central-pdf-doc" filter="url(#cardShadow)">
          {/* Front white layered document */}
          <path
            d="M 160 80 L 330 80 L 380 130 L 380 320 A 14 14 0 0 1 366 334 L 160 334 A 14 14 0 0 1 146 320 L 146 94 A 14 14 0 0 1 160 80 Z"
            fill="url(#mainPdfSheet)"
            stroke="#bae6fd"
            strokeWidth="2"
          />

          {/* Top-Right Folded corner with depth */}
          <path
            d="M 330 80 L 330 126 A 4 4 0 0 0 334 130 L 380 130 Z"
            fill="#e0f2fe"
            stroke="#7dd3fc"
            strokeWidth="1.5"
          />

          {/* Cyan swoosh graphic on page */}
          <path
            d="M 150 220 C 190 180, 290 190, 375 250 C 320 220, 220 220, 150 250 Z"
            fill="url(#cyanArc)"
          />
          <path
            d="M 152 238 C 200 205, 300 215, 370 268 C 315 240, 225 235, 152 260 Z"
            fill="#38bdf8"
            opacity="0.65"
          />

          {/* Document Content Abstract Formatting */}
          <rect x="175" y="115" width="100" height="9" rx="4.5" fill="#0284c7" />
          <rect x="175" y="140" width="170" height="6" rx="3" fill="#94a3b8" />
          <rect x="175" y="156" width="140" height="6" rx="3" fill="#cbd5e1" />
          <rect x="175" y="172" width="155" height="6" rx="3" fill="#e2e8f0" />

          {/* Prominent Red PDF Label/Badge on Document */}
          <g filter="url(#cardShadow)">
            <rect x="150" y="270" width="105" height="46" rx="10" fill="url(#redBadge)" stroke="#fca5a5" strokeWidth="1" />
            <text
              x="202.5"
              y="302"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="24"
              fontWeight="900"
              fill="#ffffff"
              textAnchor="middle"
              letterSpacing="1.5"
            >
              PDF
            </text>
          </g>

          {/* Document Gloss Reflection */}
          <path
            d="M 146 94 A 14 14 0 0 1 160 80 L 310 80 L 146 244 Z"
            fill="#ffffff"
            opacity="0.25"
          />
        </g>

        {/* FLOATING ICON 1: Word (Top-Left, close to central doc) */}
        <g id="float-word" className="animate-float" filter="url(#cardShadow)">
          <rect x="42" y="85" width="62" height="62" rx="16" fill="url(#floatWord)" stroke="#93c5fd" strokeWidth="2" />
          {/* Word W glyph */}
          <path d="M 57 104 L 63 126 L 73 111 L 83 126 L 89 104" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* FLOATING ICON 2: Excel (Bottom-Left) */}
        <g id="float-excel" className="animate-float-delayed" filter="url(#cardShadow)">
          <rect x="52" y="260" width="60" height="60" rx="16" fill="url(#floatExcel)" stroke="#86efac" strokeWidth="2" />
          {/* Excel X glyph */}
          <path d="M 69 277 L 95 303 M 95 277 L 69 303" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
        </g>

        {/* FLOATING ICON 3: JPG / Image (Top-Right) */}
        <g id="float-jpg" className="animate-float" filter="url(#cardShadow)">
          <rect x="425" y="90" width="60" height="60" rx="16" fill="url(#floatJpg)" stroke="#fdba74" strokeWidth="2" />
          {/* Image landscape glyph */}
          <circle cx="445" cy="106" r="3.5" fill="#ffffff" />
          <path d="M 437 132 L 449 118 L 460 128 L 467 122 L 474 132" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* FLOATING ICON 4: Security Shield (Bottom-Right) */}
        <g id="float-shield" className="animate-float-delayed" filter="url(#cardShadow)">
          <rect x="420" y="255" width="62" height="62" rx="16" fill="url(#floatShield)" stroke="#6ee7b7" strokeWidth="2" />
          {/* Shield with check */}
          <path d="M 451 271 L 467 277 C 467 293, 451 303, 451 303 C 451 303, 435 293, 435 277 Z" fill="#ffffff" />
          <path d="M 444 286 L 449 291 L 458 281" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* FLOATING ICON 5: Tools / Wand (Center-Top orbit) */}
        <g id="float-tools" className="animate-float" filter="url(#cardShadow)">
          <circle cx="270" cy="38" r="25" fill="url(#floatTools)" stroke="#c4b5fd" strokeWidth="2" />
          <path d="M 262 38 L 278 38 M 270 30 L 270 46" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="264" cy="32" r="1.5" fill="#ffffff" />
          <circle cx="276" cy="44" r="1.5" fill="#ffffff" />
        </g>

        {/* Dynamic Curved Connection Beads */}
        <circle cx="118" cy="148" r="4" fill="#38bdf8" />
        <circle cx="410" cy="170" r="4" fill="#38bdf8" />
        <circle cx="125" cy="275" r="3.5" fill="#34d399" />
        <circle cx="405" cy="285" r="3.5" fill="#34d399" />
      </svg>
    </div>
  );
};
