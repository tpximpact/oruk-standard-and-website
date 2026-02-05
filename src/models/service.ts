// Service entity model with zod validation

import { z } from 'zod'
import type { ObjectId } from 'mongodb'

// Shared base fields for a Service (user-supplied fields)
export const serviceBaseFieldsSchema = z.object({
  name: z.string().min(1).max(191),
  publisher: z.string().min(1).max(191),
  publisherUrl: z.url().max(191),
  description: z.string().min(1).max(1024),
  comment: z.string().max(1024).optional(),
  developer: z.string().min(1).max(191),
  developerUrl: z.url().max(191),
  serviceUrl: z.url().max(191),
  contactEmail: z.email().max(191),
  lastTested: z.date().optional(),
  active: z.boolean().optional().default(false)
})

// Narrow schema for client/server input (form + action)
export const serviceInputSchema = serviceBaseFieldsSchema

// Schema for inserting a new service into the DB (nested { value, url } shape)
export const insertServiceSchema = z.object({
  name: z.object({ value: z.string().min(1).max(191) }),
  comment: z.object({ value: z.string().max(1024).optional() }).optional(),
  developer: z.object({ value: z.string().min(1).max(191), url: z.url().max(191) }),
  publisher: z.object({ value: z.string().min(1).max(191), url: z.url().max(191) }),
  service: z.object({ value: z.string().min(1).max(191), url: z.url().max(191) }),
  description: z.object({ value: z.string().min(1).max(1024) }),
  email: z.object({ value: z.email().max(191) }),
  status: z.enum(['pending', 'approved', 'rejected']),
  statusNote: z.string().max(1024).optional(),
  schemaVersion: z.object({ value: z.string().max(191) }),
  statusIsUp: z.object({ value: z.boolean().optional().default(false) }).optional(),
  statusIsValid: z.object({ value: z.boolean().optional().default(false) }).optional(),
  statusOverall: z.object({ value: z.boolean().optional().default(false) }).optional(),
  lastTested: z.object({ value: z.date().nullable().optional() }).optional(),
  active: z.boolean().optional().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Schema for the complete service document (includes _id)
export const serviceDocumentSchema = insertServiceSchema.extend({
  // Avoid importing mongodb runtime in tests (which is ESM). Validate by shape instead.
  _id: z.custom<ObjectId>(
    (v): v is ObjectId =>
      typeof v === 'object' && v !== null && typeof (v as any).toHexString === 'function'
  )
})

// Response schema for API (serializes _id as string)
export const serviceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  publisher: z.string(),
  publisherUrl: z.string(),
  description: z.string(),
  comment: z.string().optional(),
  developer: z.string(),
  developerUrl: z.string(),
  service: z.string(),
  serviceUrl: z.string(),
  contactEmail: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  statusNote: z.string().optional(),
  statusOverall: z.boolean().optional().default(false),
  createdAt: z.date(),
  lastTested: z.date().optional(),
  updatedAt: z.date(),
  updateLink: z.string(),
  active: z.boolean().optional().default(false),
  schemaVersion: z.string().optional(),
  statusIsUp: z.boolean().optional().default(false),
  statusIsValid: z.boolean().optional().default(false)
})

// TypeScript types inferred from schemas
export type InsertService = z.infer<typeof insertServiceSchema>
export type ServiceInput = z.infer<typeof serviceInputSchema>
export type ServiceDocument = z.infer<typeof serviceDocumentSchema>
export type ServiceResponse = z.infer<typeof serviceResponseSchema>

// Helper to convert a ServiceDocument to ServiceResponse
export function toServiceResponse(doc: ServiceDocument): ServiceResponse {
  return {
    id: doc._id.toHexString(),
    name: doc.name.value,
    publisher: doc.publisher.value,
    publisherUrl: doc.publisher.url,
    description: doc.description.value,
    comment: doc.comment?.value,
    developer: doc.developer.value,
    developerUrl: doc.developer.url,
    service: doc.service.value,
    serviceUrl: doc.service.url,
    contactEmail: doc.email?.value,
    status: doc.status,
    statusNote: doc.statusNote,
    statusOverall: Boolean(doc.statusOverall?.value),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    lastTested: doc.lastTested?.value ?? undefined,
    updateLink: `/developers/register/${doc._id.toHexString()}`,
    active: doc.active ?? false,
    schemaVersion: doc.schemaVersion.value,
    statusIsUp: Boolean(doc.statusIsUp?.value),
    statusIsValid: Boolean(doc.statusIsValid?.value)
  }
}
