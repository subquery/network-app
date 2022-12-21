import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
        less: {
          modifyVars: { '@primary-color': '#4388dd', '@text-color': '#454f58', '@text-color-secondary': '#919eab' },    
          javascriptEnabled: true,
          additionalData: '@root-entry-name: default;',
        },
    },
    modules: {
      localIdentName: '[local]_[hash:base64:5]',
    },
  },
  define: {
    'process.env': process.env
  }
})