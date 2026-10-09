import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from /<repo-name>/; dev stays at /.
  base: command === 'build' ? '/react_devloper_agent/' : '/',
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: false,
  },
}));
