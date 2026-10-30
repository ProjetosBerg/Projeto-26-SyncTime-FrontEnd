import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'forms-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            '@hookform/error-message',
            'react-select',
            'yup'
          ],
          'charts-vendor': ['chart.js', 'react-chartjs-2'],
          'export-vendor': ['html-to-image', 'jspdf']
        }
      }
    }
  }
});
