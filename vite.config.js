// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { nodeResolve } from '@rollup/plugin-node-resolve';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

function replaceBytecodePlugin() {
  return {
    name: 'replace-bytecode-plugin',

    // Hook into the transform process to modify the code
    transform(code, id) {
      if (!id.includes('@subql/contract-sdk')) return;
      // Apply transformation only to JavaScript/TypeScript files
      if (!id.endsWith('.js') && !id.endsWith('.ts')) return;
      // Replace `const _bytecode = "0x..."` with `const _bytecode = "0"`
      const transformedCode = code.replace(/const\s+_bytecode\s*=\s*"0x[0-9a-fA-F]+"/g, 'const _bytecode = "0"');

      return {
        code: transformedCode,
        map: null, // Skip source maps for simplicity; add if needed
      };
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      exclude: ['buffer'],
    }),
    tsconfigPaths(),
    ...(process.env.analyze ? [visualizer()] : []),
    replaceBytecodePlugin(),
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
    minify: true,
    sourcemap: false,
    rollupOptions: {
      cache: false,
      output: {
        compact: true,
        sourcemap: false,
        manualChunks: {
          lodash: ['lodash'],
          antd: ['antd'],
          '@sentry': ['@sentry/react'],
          axios: ['axios'],
          echarts: [
            'echarts',
            'echarts/charts',
            'echarts/components',
            'echarts/core',
            'echarts/renderers',
            'echarts-for-react/lib/core',
          ],
          dayjs: ['dayjs'],
          '@subql/contract-sdk': ['@subql/contract-sdk'],
          '@subql/components': ['@subql/components'],
          '@subql/network-clients': ['@subql/network-clients'],
          '@subql/network-config': ['@subql/network-config'],
          '@subql/network-query': ['@subql/network-query'],
          '@subql/react-hooks': ['@subql/react-hooks'],
          'react-countdown': ['react-countdown'],
          ahooks: ['ahooks'],
          '@ant-design/icons': ['@ant-design/icons'],
          localforage: ['localforage'],
          '@web3-name-sdk': ['@web3-name-sdk/core'],
        },
      },
      plugins: [
        nodeResolve({
          dedupe: ['lodash', 'lodash-es'],
        }),
      ],
    },
  },
});
