import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const server =
  process.env.NODE_ENV === 'development'
    ? {
        host: true,
        port: 3000,
        watch: {
          usePolling: true,
        },
      }
    : undefined;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server,
});
