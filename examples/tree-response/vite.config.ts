import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, '../../', '');

  for (const [key, value] of Object.entries(rootEnv)) {
    process.env[key] = value;
  }

  return {
    plugins: [tsconfigPaths()],
    server: {
      port: 4003
    }
  }
});

