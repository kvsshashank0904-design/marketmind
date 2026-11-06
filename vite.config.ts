/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/company-facts': {
        target: 'https://data.sec.gov',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL('http://localhost' + path);
          const cik = (url.searchParams.get('cik') || '').replace(/\D/g, '').padStart(10, '0');
          return `/api/xbrl/companyfacts/CIK${cik}.json`;
        },
        headers: {
          'User-Agent': 'MarketMind educational project contact: k.v.s.shashank0904@gmail.com',
          'Accept-Encoding': 'gzip, deflate',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
