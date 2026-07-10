import React from 'react';

const Logo = ({ className = 'w-12 h-12', animate = true }) => {
  return (
    <svg
      className={`${className}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.15))' }}
    >
      <defs>
        <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="purpleGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal Outer Ring */}
      <polygon
        points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5"
        stroke="url(#orangeGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(249, 115, 22, 0.02)"
        opacity="0.8"
      />

      {/* Rotating Inner Orbit */}
      <circle
        cx="50"
        cy="50"
        r="30"
        stroke="url(#purpleGrad)"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.85"
      >
        {animate && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="24s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Central Sales Graph Bars */}
      <g filter="url(#glow)">
        {/* Bar 1 */}
        <rect
          x="35"
          y="48"
          width="6"
          height="18"
          rx="2"
          fill="url(#purpleGrad)"
        />
        {/* Bar 2 */}
        <rect
          x="47"
          y="36"
          width="6"
          height="30"
          rx="2"
          fill="url(#orangeGrad)"
        />
        {/* Bar 3 */}
        <rect
          x="59"
          y="26"
          width="6"
          height="40"
          rx="2"
          fill="url(#orangeGrad)"
        />
      </g>

      {/* Floating Sparkles/Nodes */}
      <circle cx="38" cy="48" r="1" fill="#FFF" />
      <circle cx="50" cy="36" r="1" fill="#FFF" />
      <circle cx="62" cy="26" r="1" fill="#FFF" />

      {/* Connecting Trend Line */}
      <path
        d="M38 48 L50 36 L62 26"
        stroke="#FFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 2"
        opacity="0.8"
      />
    </svg>
  );
};

export default Logo;
