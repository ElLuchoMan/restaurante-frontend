import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';

export default [
  {
    files: ['**/*.ts'],
    ...angular.configs['recommended'],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.html'],
    ...angularTemplate.configs['recommended'],
  },
];
