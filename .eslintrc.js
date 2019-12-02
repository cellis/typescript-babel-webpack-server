const path = require('path');
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports},
  },
  env: {
    'jest/globals': true,
    node: true
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    '@typescript-eslint/no-explicit-any': 'off',
    'object-shorthand': [2, 'always'],
    'object-curly-spacing': [2, 'always'],
    'object-literal-sort-keys': 'off',
    'prefer-template': 2,
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'import/no-cycle': 'off',
    'no-console': 'off',
    'max-len': 'off',
    'no-param-reassign': ['error', { props: false }],
    'import/prefer-default-export': 'off',
    'no-restricted-syntax': 'off',
    'require-await': [2],
    'comma-dangle': [2, 'always-multiline'],
    quotes: ['error', 'single'],
    semi: 2,
    'import/no-unresolved': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error'
  }
};
