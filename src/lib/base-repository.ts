// Base repository class for MongoDB collections with typed CRUD operations

import type {
  Collection,
  Document,
  Filter,
  ObjectId,
  OptionalUnlessRequiredId,
  WithId
} from 'mongodb'
import { z } from 'zod'
import { getCollection } from './mongodb'
import { ValidationError } from './mongodb-errors'

export abstract class BaseRepository<
  TSchema extends Document,
  TResponse = TSchema,
  TInsert = Omit<TSchema, '_id'>,
  TUpdate = Partial<TInsert>
> {
  protected abstract readonly collectionName: string
  protected abstract readonly responseSchema: z.ZodType<TResponse>
  protected abstract readonly insertSchema: z.ZodType<TInsert>
  protected abstract readonly updateSchema: z.ZodType<TUpdate>

  // Lazy-loaded collection instance
  private _collection: Promise<Collection<TSchema>> | null = null

  protected get collection(): Promise<Collection<TSchema>> {
    if (!this._collection) {
      this._collection = getCollection<TSchema>(this.collectionName)
    }
    return this._collection
  }

  // Convert MongoDB document to response type
  protected abstract toResponse(_doc: WithId<TSchema>): TResponse

  // CRUD Operations
  async findById(id: string | ObjectId): Promise<TResponse | null> {
    // Avoid requiring the `mongodb` runtime at module import time (it may be ESM).
    // Try to construct an ObjectId if available at runtime, otherwise fall back to the string
    let _id: string | ObjectId
    if (typeof id === 'string') {
      try {
        // `require` may throw if the driver is ESM in the environment running the tests
        // In that case we leave the id as the string; tests mock the collection and don't
        // need a real ObjectId instance.

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ObjectId: ObjId } = require('mongodb') as any
        _id = new ObjId(id)
      } catch {
        _id = id
      }
    } else {
      _id = id
    }

    const doc = await (await this.collection).findOne({ _id } as Filter<TSchema>)
    return doc ? this.toResponse(doc) : null
  }

  async find(filter: Filter<TSchema> = {}): Promise<TResponse[]> {
    const docs = await (await this.collection).find(filter).toArray()
    return docs.map(doc => this.toResponse(doc))
  }

  async create(data: OptionalUnlessRequiredId<TInsert>): Promise<TResponse> {
    // Validate with zod schema
    let validated
    try {
      validated = this.insertSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = zodErrorToDictionary(error)
        throw new ValidationError('Validation failed', errors)
      }
      throw error
    }

    const result = await (
      await this.collection
    ).insertOne(validated as OptionalUnlessRequiredId<TSchema>)
    const created = await this.findById(result.insertedId)

    if (!created) {
      throw new Error('Created document not found')
    }

    return created
  }

  async update(id: string | ObjectId, data: TUpdate): Promise<TResponse | null> {
    let _id: string | ObjectId
    if (typeof id === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ObjectId: ObjId } = require('mongodb') as any
        _id = new ObjId(id)
      } catch {
        _id = id
      }
    } else {
      _id = id
    }

    // Validate with zod schema
    let validated
    try {
      validated = this.updateSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = zodErrorToDictionary(error)
        throw new ValidationError('Validation failed', errors)
      }
      throw error
    }

    const result = await (
      await this.collection
    ).findOneAndUpdate(
      { _id } as Filter<TSchema>,
      { $set: { ...validated, updatedAt: new Date() } } as any,
      { returnDocument: 'after' }
    )

    return result ? this.toResponse(result) : null
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    let _id: string | ObjectId
    if (typeof id === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ObjectId: ObjId } = require('mongodb') as any
        _id = new ObjId(id)
      } catch {
        _id = id
      }
    } else {
      _id = id
    }
    const result = await (await this.collection).deleteOne({ _id } as Filter<TSchema>)
    return result.deletedCount === 1
  }

  // Additional utility methods
  async exists(filter: Filter<TSchema>): Promise<boolean> {
    const count = await (await this.collection).countDocuments(filter, { limit: 1 })
    return count > 0
  }

  async count(filter: Filter<TSchema> = {}): Promise<number> {
    return (await this.collection).countDocuments(filter)
  }
}

function zodErrorToDictionary(error: z.ZodError<unknown>) {
  const errors: Record<string, string[]> = {}
  error.issues.forEach(issue => {
    const path = issue.path.join('.') || '_'
    errors[path] = errors[path] || []
    errors[path].push(issue.message)
  })
  return errors
}
