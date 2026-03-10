import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/phase-10-scoreboard/' : '/',
  server: {
    host: '0.0.0.0',
    port: 5176,
  },
}));
