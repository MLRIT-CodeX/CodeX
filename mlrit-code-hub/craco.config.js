module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ignore source map warnings for specific packages
      webpackConfig.ignoreWarnings = [
        {
          module: /lucide-react/,
          message: /Failed to parse source map/,
        },
        // Add other packages if needed
        function(warning) {
          return (
            warning.module &&
            warning.module.resource &&
            warning.module.resource.includes('node_modules') &&
            warning.message &&
            warning.message.includes('Failed to parse source map')
          );
        }
      ];

      // Alternative: Disable source map loader for node_modules
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule) => {
            if (oneOfRule.loader && oneOfRule.loader.includes('source-map-loader')) {
              oneOfRule.exclude = /node_modules/;
            }
          });
        }
      });

      return webpackConfig;
    },
  },
  devServer: {
    // Fix the deprecation warnings by using the new setupMiddlewares option
    setupMiddlewares: (middlewares, devServer) => {
      // Custom middleware setup can go here
      return middlewares;
    },
    // Remove deprecated options
    onBeforeSetupMiddleware: undefined,
    onAfterSetupMiddleware: undefined,
  },
};
