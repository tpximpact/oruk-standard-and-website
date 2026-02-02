import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/e2e/**', '**/playwright/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/dist'
      ],
      thresholds: {
        lines: 6,
        functions: 13,
        branches: 25,
        statements: 6
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
