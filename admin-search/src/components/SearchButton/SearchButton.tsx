'use client'
import { Button, SearchIcon, useHotkey } from '@payloadcms/ui'
import { useState } from 'react'

import { SearchModal } from '../SearchModal/SearchModal.js'

export function SearchButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useHotkey(
    {
      cmdCtrlKey: true,
      editDepth: 1,
      keyCodes: ['k'],
    },
    (e) => {
      e.preventDefault()
      setIsModalOpen(true)
    },
  )

  return (
    <>
      <Button
        buttonStyle="icon-label"
        onClick={() => setIsModalOpen(true)}
        size="small"
        tooltip="Search (⌘K)"
      >
        <SearchIcon />
      </Button>

      {isModalOpen && <SearchModal handleClose={() => setIsModalOpen(false)} />}
    </>
  )
}
