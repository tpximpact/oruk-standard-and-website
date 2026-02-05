// Repository implementation for Service entity

import type { ObjectId, OptionalUnlessRequiredId } from 'mongodb'
import { BaseRepository } from '@/lib/base-repository'
import {
  ServiceDocument,
  ServiceResponse,
  InsertService,
  insertServiceSchema,
  serviceResponseSchema,
  toServiceResponse,
  ServiceInput
} from '@/models/service'

export class ServiceRepository extends BaseRepository<
  ServiceDocument,
  ServiceResponse,
  InsertService
> {
  protected readonly collectionName = 'services'
  protected readonly responseSchema = serviceResponseSchema
  protected readonly insertSchema = insertServiceSchema
  protected readonly updateSchema = insertServiceSchema.partial()

  async create(data: ServiceInput): Promise<ServiceResponse>
  async create(data: OptionalUnlessRequiredId<InsertService>): Promise<ServiceResponse>
  async create(
    data: ServiceInput | OptionalUnlessRequiredId<InsertService>
  ): Promise<ServiceResponse> {
    const now = new Date()

    // If caller passed an already-formed InsertService (nested), forward directly
    if (typeof (data as any).name !== 'string') {
      return super.create(data as OptionalUnlessRequiredId<InsertService>)
    }

    // Otherwise map the flat ServiceInput into the nested DB shape expected by insertServiceSchema
    const flat = data as ServiceInput
    const insertData: InsertService = {
      name: { value: flat.name },
      comment: flat.comment ? { value: flat.comment } : undefined,
      developer: { value: flat.developer, url: flat.developerUrl },
      publisher: { value: flat.publisher, url: flat.publisherUrl },
      service: { value: flat.serviceUrl, url: flat.serviceUrl },
      description: { value: flat.description },
      email: { value: flat.contactEmail },
      status: 'pending',
      statusNote: undefined,
      schemaVersion: { value: '3.0' },
      statusIsUp: { value: false },
      statusIsValid: { value: false },
      statusOverall: { value: false },
      lastTested: { value: null },
      active: flat.active ?? false,
      createdAt: now,
      updatedAt: now
    }

    return super.create(insertData)
  }

  protected toResponse(doc: ServiceDocument): ServiceResponse {
    //console.log('Converting ServiceDocument to ServiceResponse:', doc)

    return toServiceResponse(doc)
  }

  // Custom methods for Registration entity
  async findByPublisher(publisher: string): Promise<ServiceResponse[]> {
    return this.find({ publisher: { value: publisher } } as any)
  }

  async findByEmail(email: string): Promise<ServiceResponse[]> {
    return this.find({ email: { value: email } } as any)
  }

  async updateStatus(
    id: string | ObjectId,
    status: 'pending' | 'approved' | 'rejected',
    note?: string
  ): Promise<ServiceResponse | null> {
    return this.update(id, {
      status,
      statusNote: note,
      updatedAt: new Date()
    })
  }

  // Example of using query builder
  async search(query: string): Promise<ServiceResponse[]> {
    const filter: any = {
      $or: [
        { 'name.value': { $regex: query, $options: 'i' } },
        { 'description.value': { $regex: query, $options: 'i' } },
        { 'publisher.value': { $regex: query, $options: 'i' } }
      ]
    }
    return this.find(filter)
  }
}
