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
            exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/**/*.less'],
            rollupTypes: true, // Enable rollup to bundle types into fewer files
            copyDtsFiles: false, // Don't copy individual .d.ts files
            outDir: 'dist',
            entryRoot: 'src',
            staticImport: true, // Handle static imports properly
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
        minify: 'terser', // Use terser for better minification
        rollupOptions: {
            // Better tree-shaking configuration
            treeshake: {
                preset: 'smallest',
                moduleSideEffects: false,
            },
            external: (id) => {
                // External large optional dependencies
                return id.includes('@tanstack/react-query') || id.includes('react-date-range');
            },
        },
    },
});
