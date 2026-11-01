import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: { port: 3000 },

  build: {
    // Kept as `build` rather than Vite's default `dist` so the deploy target
    // does not move. vercel.json pins the same path explicitly.
    outDir: 'build',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split the heavy, independently-loadable libraries out of the entry
        // chunk. three is only needed by /v2, and the WebLLM host only once a
        // visitor actually opens the assistant.
        manualChunks: {
          three: ['three'],
          motion: ['framer-motion'],
          gsap: ['gsap', '@gsap/react'],
          markdown: ['react-markdown'],
        },
      },
    },
  },
});
