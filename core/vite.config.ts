import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs', 'umd'],
      name: 'VirtualDisplayClient',
      fileName: (format) => `virtual-display-client.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        exports: 'named',
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      skipDiagnostics: false,
      logDiagnostics: true,
    }),
  ],
});
