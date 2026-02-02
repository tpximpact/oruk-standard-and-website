import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import type { ObjectId } from 'mongodb'
import { ServiceRepository } from '../service-repository'
import { ServiceDocument } from '@/models/service'
import { ValidationError } from '@/lib/mongodb-errors'

let mockCollection: {
  insertOne: Mock
  findOne: Mock
  find: Mock
  updateOne: Mock
  deleteOne: Mock
  findOneAndUpdate: Mock
}

vi.mock('@/lib/mongodb', () => {
  const getMongoClient = vi.fn(() =>
    Promise.resolve({
      db: () => ({
        collection: () => mockCollection
      })
    } as any)
  )

  const getCollection = vi.fn((_name: string) => Promise.resolve(mockCollection))

  return { getMongoClient, getCollection }
})

describe('ServiceRepository', () => {
  let repository: ServiceRepository
  // Lightweight ObjectId-like stub so tests don't import the ESM `mongodb` runtime
  const testId = { toHexString: () => '507f1f77bcf86cd799439011' } as unknown as ObjectId
  const testService: ServiceDocument = {
    _id: testId,
    name: { value: 'Test Service' },
    publisher: { value: 'Test Publisher', url: 'https://test-publisher.com' },
    description: { value: 'Test Description' },
    developer: { value: 'Test Developer', url: 'https://test-developer.com' },
    service: { value: 'Test Service', url: 'https://test-service.com' },
    email: { value: 'test@example.com' },
    schemaVersion: { value: '3.0' },
    active: false,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    mockCollection = {
      insertOne: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn()
      }),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
      findOneAndUpdate: vi.fn()
    } as any
    repository = new ServiceRepository()
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new service', async () => {
      const insertData = {
        name: 'Test Service',
        publisher: 'Test Publisher',
        publisherUrl: 'https://test-publisher.com',
        description: 'Test Description',
        developer: 'Test Developer',
        developerUrl: 'https://test-developer.com',
        service: 'Test Service',
        serviceUrl: 'https://test-service.com',
        contactEmail: 'test@example.com',
        active: false
      }
      mockCollection.insertOne.mockResolvedValueOnce({ acknowledged: true, insertedId: testId })
      mockCollection.findOne.mockResolvedValueOnce(testService)

      const result = await repository.create(insertData)

      expect(mockCollection.insertOne).toHaveBeenCalled()
      expect(result).toEqual(
        expect.objectContaining({
          id: testId.toHexString(),
          name: insertData.name,
          publisher: insertData.publisher
        })
      )
    })

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        name: '',
        publisher: 'Test'
      } as any

      const createPromise = repository.create(invalidData)
      await expect(createPromise).rejects.toThrow(ValidationError)
    })
  })

  describe('findByPublisher', () => {
    it('should find services by publisher', async () => {
      const mockCursor = {
        toArray: vi.fn().mockResolvedValue([testService] as never)
      }
      mockCollection.find.mockReturnValueOnce(mockCursor as any)

      const results = await repository.findByPublisher('Test Publisher')

      expect(mockCollection.find).toHaveBeenCalledWith({ publisher: { value: 'Test Publisher' } })
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual(
        expect.objectContaining({
          id: testId.toHexString(),
          publisher: 'Test Publisher'
        })
      )
    })
  })

  describe('findByEmail', () => {
    it('should find services by contact email', async () => {
      const mockCursor = {
        toArray: vi.fn().mockResolvedValue([testService] as never)
      }
      mockCollection.find.mockReturnValueOnce(mockCursor as any)

      const results = await repository.findByEmail('test@example.com')

      expect(mockCollection.find).toHaveBeenCalledWith({ email: { value: 'test@example.com' } })
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual(
        expect.objectContaining({
          id: testId.toHexString(),
          contactEmail: 'test@example.com'
        })
      )
    })
  })

  describe('updateStatus', () => {
    it('should update service status', async () => {
      const updatedService = {
        ...testService,
        status: 'approved',
        statusNote: 'Approved by admin',
        updatedAt: expect.any(Date)
      }
      mockCollection.findOneAndUpdate.mockResolvedValueOnce(updatedService)

      const result = await repository.updateStatus(
        testId.toHexString(),
        'approved',
        'Approved by admin'
      )

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalled()
      expect(result).toEqual(
        expect.objectContaining({
          id: testId.toHexString(),
          status: 'approved',
          statusNote: 'Approved by admin'
        })
      )
    })

    it('should return null when service not found', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValueOnce(null)

      const result = await repository.updateStatus('000000000000000000000000', 'approved')

      expect(result).toBeNull()
    })
  })

  describe('search', () => {
    it('should search services with query', async () => {
      const mockCursor = {
        toArray: vi.fn().mockResolvedValue([testService] as never)
      }
      mockCollection.find.mockReturnValueOnce(mockCursor as any)

      const results = await repository.search('Test')

      expect(mockCollection.find).toHaveBeenCalledWith({
        $or: [
          { 'name.value': { $regex: 'Test', $options: 'i' } },
          { 'description.value': { $regex: 'Test', $options: 'i' } },
          { 'publisher.value': { $regex: 'Test', $options: 'i' } }
        ]
      })
      expect(results).toHaveLength(1)
    })
  })
})
