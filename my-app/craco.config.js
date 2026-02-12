const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      // Ensure resolve.alias is properly set
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
      }
      
      // Set up path aliases matching tsconfig.json
      webpackConfig.resolve.alias['@'] = path.resolve(__dirname, 'src');
      
      return webpackConfig;
    },
  },
};
