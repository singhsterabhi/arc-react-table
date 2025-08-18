import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import svgr from 'vite-plugin-svgr';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        peerDepsExternal(),
        cssInjectedByJsPlugin(), // Inject CSS into JS bundle
        dts({
            insertTypesEntry: true, // Inserts type entry points
            include: ['src/**/*', 'vite-env.d.ts'],
            exclude: ['src/**/*.test.*', 'src/**/*.spec.*'],
            rollupTypes: false, // Disable rollup to avoid circular dependency issues
            copyDtsFiles: true, // Copy .d.ts files for comprehensive type support
            outDir: 'dist',
            entryRoot: 'src', // Set entry root for proper type resolution
        }),
    ],
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
    build: {
        lib: {
            entry: {
                'react-table': resolve(__dirname, 'src/index.ts'),
            },
            formats: ['es'], // Only ESM format
            fileName: (format, entryName) => `${entryName}.${format}.js`,
        },
        rollupOptions: {
            // No globals needed for ESM builds
            // External dependencies will be imported normally
        },
    },
});
