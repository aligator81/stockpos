import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // This allows external connections
    strictPort: true, // Ensure it uses exactly port 5173
    hmr: {
      clientPort: 5173 // Force HMR to use this port
    }
  },
  preview: {
    port: 5173,
    host: true,
    strictPort: true
  }
});