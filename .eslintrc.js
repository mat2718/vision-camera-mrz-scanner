module.exports = {
  root: true,
  extends: '@react-native-community',
  env: {
    'jest/globals': true,
  },
  rules: {
    'react-native/no-inline-styles': 2,
    'react-native/no-unused-styles': 2,
  },
  reportUnusedDisableDirectives: true,
  globals: {
    AbortController: 'readonly',
  },
  ignorePatterns: ['docs/*', 'downloads/*', 'node_modules/', 'lib/'],
};
