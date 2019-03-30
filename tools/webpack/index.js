const webpack = require('webpack')

const path = require('path')

const buildPath = path.resolve(__dirname, '../../dist')

module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, '../../src/index.js')
  },
  output: {
    path: buildPath,
    filename: 'index.min.js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}