/**
 * Environment variable validation and type-safe access
 * Validates required environment variables at runtime
 */

import { z } from 'zod'

const envSchema = z.object({
  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB: z.string().min(1, 'MONGODB_DB is required'),

  // External Services
  OPENAPI_VALIDATOR_ENDPOINT: z
    .string()
    .url('OPENAPI_VALIDATOR_ENDPOINT must be a valid URL')
    .optional(),

  // Feature Flags
  USE_COOKIES: z.string().optional().default('true'),
  USE_NAV: z.string().optional().default('true'),
  USE_NOWARRANTY: z.string().optional().default('true'),

  // GitHub Integration
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_INSTALLATION_ID: z.string().optional(),
  GITHUB_REPO_OWNER: z.string().optional(),
  GITHUB_REPO_NAME: z.string().optional(),
  GITHUB_ISSUE_ASSIGNEES: z.string().optional(),

  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),

  // System
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
})

// Validate environment variables
// Only validate in Node.js runtime (not during build type checking)
export const env =
  typeof window === 'undefined' ? envSchema.parse(process.env) : ({} as z.infer<typeof envSchema>)

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

/**
 * Helper to check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: string): boolean {
  return flag === 'true' || flag === '1' || flag === 'yes'
}
