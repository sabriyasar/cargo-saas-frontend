module.exports = {
    root: true,
    env: {
      browser: true,
      node: true,
      es2021: true,
    },
    parser: '@typescript-eslint/parser', // TS kullanıyorsan
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended', // TS için
      'plugin:react-hooks/recommended'
    ],
    plugins: ['react', '@typescript-eslint'],
    rules: {
      // Özel kurallar
      'no-console': 'warn',
      'react/prop-types': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  };
  