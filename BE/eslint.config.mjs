// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist', 'node_modules', 'prisma'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tseslint.parser,
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // // === TỰ ĐỘNG SẮP XẾP IMPORT ===
      // 'simple-import-sort/imports': 'error',
      // 'simple-import-sort/exports': 'error',
      "@typescript-eslint/no-empty-function": ["error", { "allow": ["constructors"] }],
      // "object-curly-spacing": ["error", "always"], // Ép các object thông thường phải có space { a: 1 }
      // "@typescript-eslint/block-spacing": ["error", "always"], // Đồng bộ block spacing
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      // '@typescript-eslint/block-spacing': 'off',
      // 'object-curly-spacing': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'lf',
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          bracketSpacing: true
        },
      ],
    },
  },
);
