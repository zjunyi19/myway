const webpack = require('webpack');

module.exports = {
  // ... existing config ...
  resolve: {
    fallback: {
      "zlib": require.resolve("browserify-zlib"),
      "querystring": require.resolve("querystring-es3"),
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "http": require.resolve("stream-http"),
      "fs": false,
      "net": false,
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/")
    }
  },
  plugins: [
    // ... existing plugins ...
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ]
}; 