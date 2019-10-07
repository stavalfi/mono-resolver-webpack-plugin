const path = require('path')

module.exports = {
  cliOptions: {
    config: path.resolve(__dirname, '.eslintrc.js'),
    format: 'eslint-formatter-friendly',
  },
}
