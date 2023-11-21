import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_CONTEXT_PATH } = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      // https: {
      //   key: fs.readFileSync('privkey.pem'),
      //   cert: fs.readFileSync('fullchain.pem'),
      // },
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/ws': {
          target: 'http://localhost:8080',
          ws: true,
        },
      },
    },
    base: VITE_CONTEXT_PATH,
  };
});
