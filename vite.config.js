// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      exclude: ['buffer'],
    }),
    tsconfigPaths(),
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
    minify: true,
    sourcemap: false,
    rollupOptions: {
      cache: false,
      output: {
        compact: true,
        sourcemap: false,
        manualChunks: {
          lodash: ['lodash', 'lodash-es'],
          antd: ['antd'],
          '@sentry': ['@sentry/react'],
          axios: ['axios'],
          echarts: ['echarts'],
          dayjs: ['dayjs'],
          '@subql/contract-sdk': ['@subql/contract-sdk'],
          '@subql/apollo-links': ['@subql/apollo-links'],
          '@subql/components': ['@subql/components'],
          '@subql/network-clients': ['@subql/network-clients'],
          '@subql/network-config': ['@subql/network-config'],
          '@subql/network-query': ['@subql/network-query'],
          '@subql/react-hooks': ['@subql/react-hooks'],
          'react-countdown': ['react-countdown'],
          ahooks: ['ahooks'],
          '@ant-design/icons': ['@ant-design/icons'],
          localforage: ['localforage'],
        },
      },
    },
  },
});
