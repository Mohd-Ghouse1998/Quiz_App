const path = require("path");

module.exports = function override(config) {
  // Add polyfills for missing modules, including 'buffer' and 'stream'
  config.resolve.fallback = {
    ...config.resolve.fallback,
    path: require.resolve("path-browserify"),
    os: require.resolve("os-browserify/browser"),
    crypto: require.resolve("crypto-browserify"),
    buffer: require.resolve("buffer/"),
    stream: require.resolve("stream-browserify"),
  };

  return config;
};
