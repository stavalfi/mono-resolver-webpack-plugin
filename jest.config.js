const path = require('path')

module.exports = {
  projects: [
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testRegex: [`./*.spec.js$`, `./*.spec.ts$`],
      roots: [path.resolve(__dirname, 'src'),path.resolve(__dirname, 'test')],
    },
    {
      displayName: 'test',
      preset: 'ts-jest/presets/js-with-ts',
      testEnvironment: 'jsdom',
      modulePaths: [path.resolve(__dirname, './node_modules')],
      testRegex: [`./*.spec.js$`, `./*.spec.ts$`],
      roots: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'test')],
      testPathIgnorePatterns: ['node_modules'],
      globals: {
        __DEV__: true,
        'ts-jest': {
          tsConfig: path.resolve(__dirname, './tsconfig.json'),
          babelConfig: require('./babel.config'),
        },
        window: {},
      },
    },
  ],
}
