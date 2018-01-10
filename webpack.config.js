const path = require('path');

module.exports = {
  entry:  './src/index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: 'babel-loader'
      }
    ]
  },
  externals: {
    'react': 'umd react',
    'react-dom': 'umd react-dom',
  }
};
