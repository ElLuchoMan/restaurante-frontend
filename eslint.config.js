import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';


export default [
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/.angular/**', '**/node_modules/**', '**/*.html']
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'sort-imports': [
        'warn',
        { ignoreDeclarationSort: false, ignoreMemberSort: false }
      ],
    },
  },
  eslintConfigPrettier,
];
