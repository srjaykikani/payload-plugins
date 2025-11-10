import React from 'react'

export const HomeIcon: React.FC<{
  readonly ariaLabel?: string
  readonly className?: string
  readonly size?: number
}> = ({ ariaLabel, className, size = 16 }) => {
  return (
    <svg
      aria-label={ariaLabel}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
