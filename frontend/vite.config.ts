import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_CONTEXT_PATH, VITE_API_BASE_URL, VITE_USE_POLLING } = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      // https: {
      //   key: fs.readFileSync('privkey.pem'),
      //   cert: fs.readFileSync('fullchain.pem'),
      // },
      proxy: {
        '/api': {
          target: VITE_API_BASE_URL ?? 'http://localhost:8080',
          changeOrigin: true,
        },
        '/ws': {
          target: VITE_API_BASE_URL ?? 'http://localhost:8080',
          ws: true,
        },
      },
      watch: {
        usePolling: !!VITE_USE_POLLING,
      },
    },
    base: VITE_CONTEXT_PATH,
  };
});
