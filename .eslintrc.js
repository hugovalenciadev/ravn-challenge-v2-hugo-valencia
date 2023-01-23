module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'jest', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:eslint-comments/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },  
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'error',
    'max-len': ['error', { code: 150, tabWidth: 2, ignoreUrls: true, ignoreComments: true }],
    semi: 'off',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'parent', 'sibling', 'index'],
        alphabetize: {
          order: 'asc',
        },
      },
    ],
    'import/newline-after-import': ['error', { count: 1 }],
    'linebreak-style': ['error', 'unix'],
    curly: ['error'],
  },
};
