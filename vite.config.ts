import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => {
  return {
    // Don't load any .env files during build
    envFile: command === 'build' ? false : '.env',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VirtualdisplayClient',
        formats: ['es', 'cjs', 'umd'],
        fileName: (format): string => {
          const formatMap: Record<string, string> = {
            es: 'es',
            cjs: 'cjs',
            umd: 'umd',
          };
          return `virtualdisplay.client.${formatMap[format as string]}.js`;
        },
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
      sourcemap: true,
      minify: 'terser',
      target: 'es2022',
      reportCompressedSize: true,
    },
    plugins: [
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
        include: ['src/**/*'],
        exclude: ['test/**/*'],
      }),
    ],
  };
});
