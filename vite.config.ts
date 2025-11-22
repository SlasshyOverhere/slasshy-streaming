import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3715,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env': JSON.stringify({
          REACT_APP_AUTH0_DOMAIN: env.REACT_APP_AUTH0_DOMAIN,
          REACT_APP_AUTH0_CLIENT_ID: env.REACT_APP_AUTH0_CLIENT_ID,
          REACT_APP_TMDB_API_KEY: env.REACT_APP_TMDB_API_KEY,
          GEMINI_API_KEY: env.GEMINI_API_KEY,
          API_KEY: env.GEMINI_API_KEY
        })
      },
      build: {
        outDir: 'build', // Change output directory to 'build' for Vercel compatibility
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
