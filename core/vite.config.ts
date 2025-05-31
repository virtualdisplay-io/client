import { defineConfig, loadEnv } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, '../../', '');

  for (const [key, value] of Object.entries(rootEnv)) {
    process.env[key] = value;
  }

  return {
    build: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs', 'umd'],
        name: 'VirtualDisplayClient',
        fileName: (format) => `virtual-display-client.${format}.js`,
      },
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          preserveModules: false,
          inlineDynamicImports: true,
          exports: 'named',
        },
      },
    },
    plugins: [
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
      }),
    ],
  };
});
