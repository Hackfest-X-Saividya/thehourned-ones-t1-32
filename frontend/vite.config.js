import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: path.resolve(__dirname, 'tailwind.config.js') }),
        autoprefixer()
      ]
    }
  },
  server: {
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, '..')]
    },
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          xyflow: ['@xyflow/react'],
          vendor: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'axios']
        }
      }
    }
  }
});
