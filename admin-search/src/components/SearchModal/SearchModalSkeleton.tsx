import React from 'react'

interface SearchModalSkeletonProps {
  count?: number
}

export const SearchModalSkeleton: React.FC<SearchModalSkeletonProps> = ({ count = 5 }) => {
  return (
    <ul className="search-modal__results-list">
      {Array.from({ length: count }).map((_, index) => (
        <li className="search-modal__result-item-container" key={index}>
          <div className="search-modal__result-item-button skeleton-item">
            <div className="search-modal__result-content">
              <div className="skeleton-title" />
              <div className="skeleton-pill" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
} 