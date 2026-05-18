import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/shape-of-high-dimensions/',
  plugins: [react()],
});
