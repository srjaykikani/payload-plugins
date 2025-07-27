'use client'

import { Banner, Pill, SearchIcon, useConfig, useDebounce, usePayloadAPI } from '@payloadcms/ui'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { SearchResult } from '../../types/SearchResult.js'

import './SearchModal.css'

export const SearchModal: React.FC<{ handleClose: () => void }> = ({ handleClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 300)
  const {
    config: {
      routes: { admin, api },
    },
  } = useConfig()
  const [{ data }, { setParams }] = usePayloadAPI(`${api}/search`, {})
  const resultsRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setSelectedIndex(-1)
      return
    }

    setParams({
      depth: 1,
      limit: 10,
      sort: '-priority',
      where: {
        title: {
          like: debouncedQuery,
        },
      },
    })
  }, [debouncedQuery, setParams])

  useEffect(() => {
    if (data?.docs && Array.isArray(data.docs)) {
      setResults(data.docs as SearchResult[])
      setSelectedIndex(-1)
    }
  }, [data])

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      let collectionSlug: string | undefined
      let documentId: string | undefined

      if (result.doc && 'relationTo' in result.doc && 'value' in result.doc) {
        const { relationTo, value } = result.doc
        collectionSlug = relationTo
        documentId = typeof value === 'string' ? value : value?.id
      } else if (result.collectionSlug) {
        collectionSlug = result.collectionSlug
        documentId = result.id
      } else if (result.collectionName) {
        collectionSlug = result.collectionName.toLowerCase()
        documentId = result.id
      }

      if (collectionSlug && documentId) {
        window.location.href = `${admin}/collections/${collectionSlug}/${documentId}`
      }
    },
    [admin],
  )

  useEffect(() => {
    // Manual keyboard handling instead of useHotkey to avoid modal state conflicts
    // useHotkey is designed for opening modals, not navigation within open modals
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement && e.key !== 'Escape') {
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter' && selectedIndex !== -1) {
        e.preventDefault()
        handleResultClick(results[selectedIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [results, selectedIndex, handleClose, handleResultClick])

  useEffect(() => {
    if (selectedIndex !== -1 && resultsRef.current) {
      const selectedItem = resultsRef.current.children[selectedIndex]
      if (selectedItem instanceof HTMLLIElement) {
        selectedItem.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const getCollectionDisplayName = (result: SearchResult) => {
    if (result.collectionName) {
      return result.collectionName
    }
    if (result.collectionSlug) {
      return result.collectionSlug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    if (result.doc && 'relationTo' in result.doc) {
      return result.doc.relationTo
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    return 'Unknown'
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) {
      return text
    }

    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi')

    if (!regex.test(text)) {
      return text
    }

    regex.lastIndex = 0
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <span className="search-modal__highlighted-text" key={index}>
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div
      aria-label="Close search modal"
      className="search-modal__overlay"
      onClick={handleClose}
      onKeyDown={(e) => e.key === 'Enter' && handleClose()}
      role="button"
      tabIndex={0}
    >
      <div
        aria-label="Search modal content"
        className="search-modal__content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="button"
        tabIndex={0}
      >
        <div className="search-modal__header">
          <div className="search-modal__input-wrapper">
            <span className="search-modal__search-icon">
              <SearchIcon />
            </span>
            <input
              aria-label="Search for documents"
              className="search-modal__input-field"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && results.length > 0) {
                  e.preventDefault()
                  if (e.key === 'ArrowDown') {
                    setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
                  } else if (e.key === 'ArrowUp') {
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
                  }
                } else if (e.key === 'Enter' && selectedIndex !== -1) {
                  e.preventDefault()
                  handleResultClick(results[selectedIndex])
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  handleClose()
                }
              }}
              placeholder="Search..."
              ref={inputRef}
              type="text"
              value={query}
            />
            <span className="search-modal__escape-hint">ESC</span>
          </div>
        </div>

        <div className="search-modal__results-container">
          {data?.isLoading && (
            <div className="search-modal__loading-indicator">
              <div className="search-modal__spinner"></div>
              <p>Searching...</p>
            </div>
          )}
          {data?.isError && (
            <Banner type="error">An error occurred while searching. Please try again.</Banner>
          )}
          {!data?.isLoading && !data?.isError && results.length === 0 && debouncedQuery && (
            <div className="search-modal__no-results-message">
              <p>No results found for "{debouncedQuery}"</p>
              <p className="search-modal__no-results-hint">
                Try different keywords or check your spelling
              </p>
            </div>
          )}
          <ul className="search-modal__results-list" ref={resultsRef}>
            {results.map((result, index) => (
              <li
                className={`search-modal__result-item-container ${
                  selectedIndex === index ? 'selected' : ''
                }`}
                key={result.id}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <button
                  aria-label={`Open ${result.title} in ${getCollectionDisplayName(result)}`}
                  className="search-modal__result-item-button"
                  onClick={() => handleResultClick(result)}
                  onKeyDown={(e) => e.key === 'Enter' && handleResultClick(result)}
                  type="button"
                >
                  <div className="search-modal__result-content">
                    <span className="search-modal__result-title">
                      {highlightSearchTerm(result.title, query)}
                    </span>
                    <Pill>{highlightSearchTerm(getCollectionDisplayName(result), query)}</Pill>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="search-modal__footer">
          <div className="search-modal__keyboard-shortcuts">
            <div className="search-modal__shortcut-item">
              <span className="search-modal__shortcut-key">↑↓</span>
              <span className="search-modal__shortcut-description">to navigate</span>
            </div>
            <div className="search-modal__shortcut-item">
              <span className="search-modal__shortcut-key">←</span>
              <span className="search-modal__shortcut-description">to select</span>
            </div>
            <div className="search-modal__shortcut-item">
              <span className="search-modal__shortcut-key">esc</span>
              <span className="search-modal__shortcut-description">to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
