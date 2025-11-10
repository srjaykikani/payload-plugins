import React from 'react'

export const BreadcrumbsIcon: React.FC<{
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
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 5L6 8L3 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 5L12 8L9 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
