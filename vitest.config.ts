import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        fileParallelism: false,
        env: {
            NODE_ENV: 'test',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                'dist/',
                '**/*.spec.ts',
                '**/*.test.ts',
                '**/migration/**',
            ],
        },
    },
})
