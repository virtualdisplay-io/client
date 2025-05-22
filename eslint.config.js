import { fileURLToPath } from 'url';
import { dirname } from 'path';
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintParser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import airbnbBase from 'eslint-config-airbnb-base';
import { defineConfig } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/vite.config.ts',
      '**/vitest.config.ts',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: eslintParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        window: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        console: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...airbnbBase.rules,
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'import/prefer-default-export': 'off',
      'prettier/prettier': 'error',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
    },
  },
  {
    files: ['**/vite.config.ts', '**/vitest.config.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: eslintParser,
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
    },
    rules: {},
  },
]);
