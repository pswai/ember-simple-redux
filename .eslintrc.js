module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier'],
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
  },
  rules: {
    'prettier/prettier': 'warn',
  },
};
