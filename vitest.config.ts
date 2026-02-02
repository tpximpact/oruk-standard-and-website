import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        '**/*.d.ts',
        '**/*.stories.{js,jsx,ts,tsx}',
        '**/e2e/**',
        '**/scripts/**',
        'src/__mocks__/**',
        'coverage/**',
        '**/*.config.{js,ts}',
        '**/node_modules/**'
      ],
      thresholds: {
        lines: 6,
        functions: 13,
        branches: 25,
        statements: 6
      }
    },
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
