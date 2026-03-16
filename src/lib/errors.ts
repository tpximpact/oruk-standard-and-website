/**
 * Custom error classes for the application
 * Provides consistent error handling across the codebase
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly meta?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      meta: this.meta
    }
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400, { errors })
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, meta)
    this.name = 'DatabaseError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found with id: ${id}`, 'NOT_FOUND', 404, { resource, id })
    this.name = 'NotFoundError'
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} "${value}" already exists`, 'DUPLICATE_ERROR', 409, {
      resource,
      field,
      value
    })
    this.name = 'DuplicateError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, meta?: Record<string, unknown>) {
    super(`${service} error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, { service, ...meta })
    this.name = 'ExternalServiceError'
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}
