const webpack = require('webpack')
const path = require('path')

const ENV = process.env.NODE_ENV

module.exports = {
  context: path.join(__dirname, './src'),
  entry: {
    app: [
      './index.js',
    ],
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  devtool: '#source-map',
  resolve: {
    extensions: ['', '.js'],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, './src'),
        loaders: ['babel'],
      }],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV),
    }),
  ],
}
