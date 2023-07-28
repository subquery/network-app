// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    eslint(),
    tsconfigPaths(),
    // checker({
    //   typescript: true,
    // }),
    ...(process.env.analyze ? [visualizer()] : []),
  ],
  server: {
    port: 3006,
  },
  resolve: {
    mainFields: [],
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: { '@primary-color': '#1677ff', '@text-color': '#454f58', '@text-color-secondary': '#919eab' },
        javascriptEnabled: true,
        additionalData: '@root-entry-name: default;',
      },
    },
    modules: {
      localIdentName: '[local]_[hash:base64:5]',
    },
  },
  build: {
    minify: false,
    sourcemap: false,
    rollupOptions: {
      maxParallelFileOps: 2,
      cache: false,
      output: {
        sourcemap: false,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
