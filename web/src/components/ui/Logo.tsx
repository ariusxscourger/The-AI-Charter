import React from "react"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function Logo({ className = "", size = "md", animated = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={`${sizeClasses[size]} ${className} select-none`}
      aria-hidden="true"
    >
      <defs>
        {/* Gradient for shield background */}
        <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D3748" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>

        {/* Glow effect filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Outer Shield Shape with dynamic scale */}
      <polygon
        points="50,5 92,24 92,60 50,95 8,60 8,24"
        fill="url(#shield-gradient)"
        stroke="#76E1A7"
        strokeWidth="3"
        strokeLinejoin="round"
        className="filter drop-shadow-[0_0_8px_rgba(118,225,167,0.3)]"
      />

      {/* Neural network nodes and links */}
      <g stroke="#76E1A7" strokeWidth="1.5" opacity="0.75" className={animated ? "animate-pulse" : ""}>
        {/* Connections */}
        <line x1="50" y1="25" x2="30" y2="45" />
        <line x1="50" y1="25" x2="70" y2="45" />
        <line x1="30" y1="45" x2="35" y2="70" />
        <line x1="70" y1="45" x2="65" y2="70" />
        <line x1="35" y1="70" x2="50" y2="82" />
        <line x1="65" y1="70" x2="50" y2="82" />
        <line x1="30" y1="45" x2="70" y2="45" strokeWidth="0.75" strokeDasharray="3,3" />
        <line x1="50" y1="25" x2="50" y2="52" />
      </g>

      {/* Central Charter Scroll / Core node */}
      <g className={animated ? "animate-[bounce_3s_ease-in-out_infinite]" : ""}>
        {/* The Scroll Body */}
        <path d="M38,38 H62 C65,38 65,42 62,42 H38 C35,42 35,38 38,38 Z" fill="#38B0E8" filter="url(#glow)" />
        <path
          d="M40,42 H60 V65 C60,67 55,68 50,68 C45,68 40,67 40,65 Z"
          fill="#FAF8F5"
          stroke="#1F2937"
          strokeWidth="1.5"
        />
        {/* Charter Text Lines (stylized) */}
        <line x1="45" y1="48" x2="55" y2="48" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="45" y1="53" x2="55" y2="53" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="45" y1="58" x2="52" y2="58" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Pulsing Outer Nodes */}
      <circle cx="50" cy="25" r="4" fill="#76E1A7" className={animated ? "animate-ping [animation-duration:2s]" : ""} />
      <circle cx="50" cy="25" r="3" fill="#FAF8F5" stroke="#76E1A7" strokeWidth="1.5" />

      <circle cx="30" cy="45" r="3" fill="#76E1A7" />
      <circle cx="70" cy="45" r="3" fill="#76E1A7" />

      <circle cx="35" cy="70" r="3" fill="#76E1A7" />
      <circle cx="65" cy="70" r="3" fill="#76E1A7" />
    </svg>
  )
}
