import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/awkum-gpa-calculator/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'zustand'],
          'analysis-engine': ['recharts'],
          'pdf-service': ['jspdf', 'jspdf-autotable'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
