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
          VITE_NOTIFICATION_1: env.VITE_NOTIFICATION_1,
          VITE_NOTIFICATION_2: env.VITE_NOTIFICATION_2,
          VITE_NOTIFICATION_3: env.VITE_NOTIFICATION_3,
          VITE_NOTIFICATION_4: env.VITE_NOTIFICATION_4,
          VITE_ACTIVE_NOTIFICATION: env.VITE_ACTIVE_NOTIFICATION,
          GEMINI_API_KEY: env.GEMINI_API_KEY,
          API_KEY: env.GEMINI_API_KEY
        })
      },
      build: {
        outDir: 'build', // Change output directory to 'build' for Vercel compatibility
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      }
    };
});