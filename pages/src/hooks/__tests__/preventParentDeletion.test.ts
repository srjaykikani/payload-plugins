import { preventParentDeletion } from '../preventParentDeletion.js'
import { CollectionConfig } from 'payload'

// Mock payload request and collection config for testing
const mockPayload = {
  db: { name: '@payloadcms/db-mongodb' },
  config: {
    collections: [
      {
        slug: 'pages',
        page: {
          parent: {
            name: 'parent',
            collection: 'pages'
          }
        }
      }
    ]
  },
  count: jest.fn()
}

const mockReq = {
  payload: mockPayload
}

const mockCollection: CollectionConfig = {
  slug: 'pages',
  fields: [],
  custom: {
    pagesPluginConfig: {
      baseFilter: undefined
    }
  }
}

// Mock the asPageCollectionConfigOrThrow function
jest.mock('../collections/PageCollectionConfig.js', () => ({
  asPageCollectionConfigOrThrow: jest.fn(() => ({
    parent: {
      name: 'parent',
      collection: 'pages'
    }
  }))
}))

describe('preventParentDeletion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow deletion when no child documents exist', async () => {
    mockPayload.count.mockResolvedValue({ totalDocs: 0 })

    await expect(
      preventParentDeletion({
        req: mockReq as any,
        id: 'parent-doc-id',
        collection: mockCollection as any
      })
    ).resolves.not.toThrow()
  })

  it('should prevent deletion when child documents exist', async () => {
    mockPayload.count.mockResolvedValue({ totalDocs: 2 })

    await expect(
      preventParentDeletion({
        req: mockReq as any,
        id: 'parent-doc-id',
        collection: mockCollection as any
      })
    ).rejects.toThrow(
      'Cannot delete this document because it is referenced as a parent by 2 document(s)'
    )
  })

  it('should apply check for SQLite adapters', async () => {
    const sqlitePayload = {
      ...mockPayload,
      db: { name: '@payloadcms/db-sqlite' }
    }
    sqlitePayload.count.mockResolvedValue({ totalDocs: 0 })

    const sqliteReq = { payload: sqlitePayload }

    await expect(
      preventParentDeletion({
        req: sqliteReq as any,
        id: 'parent-doc-id',
        collection: mockCollection as any
      })
    ).resolves.not.toThrow()

    expect(sqlitePayload.count).toHaveBeenCalled()
  })

  it('should apply check for PostgreSQL adapters', async () => {
    const postgresPayload = {
      ...mockPayload,
      db: { name: '@payloadcms/db-postgres' }
    }
    postgresPayload.count.mockResolvedValue({ totalDocs: 0 })

    const postgresReq = { payload: postgresPayload }

    await expect(
      preventParentDeletion({
        req: postgresReq as any,
        id: 'parent-doc-id',
        collection: mockCollection as any
      })
    ).resolves.not.toThrow()

    expect(postgresPayload.count).toHaveBeenCalled()
  })

  it('should skip check for unsupported adapters', async () => {
    const unsupportedPayload = {
      ...mockPayload,
      db: { name: '@payloadcms/db-unsupported' }
    }

    const unsupportedReq = { payload: unsupportedPayload }

    await expect(
      preventParentDeletion({
        req: unsupportedReq as any,
        id: 'parent-doc-id',
        collection: mockCollection as any
      })
    ).resolves.not.toThrow()

    expect(unsupportedPayload.count).not.toHaveBeenCalled()
  })
})