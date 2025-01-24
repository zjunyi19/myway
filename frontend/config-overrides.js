const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/")
    };

    config.resolve.fallback = {
        ...config.resolve.fallback,
        ...fallback
    };

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ];

    return config;
} 