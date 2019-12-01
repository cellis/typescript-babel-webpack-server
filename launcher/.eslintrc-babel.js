const path = require('path');
module.exports = {
  parser: 'babel-eslint',
  extends: ['eslint:recommended'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js']
      }
    }
  },
  env: {
    'jest/globals': true,
    node: true
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
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
    'import/no-unresolved': 'error'
  }
};
