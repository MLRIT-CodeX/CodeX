// ✅ craco.config.js
// Handles both Tailwind + PostCSS setup and Webpack warnings suppression.

const path = require("path");

module.exports = {
  // 🌀 Tailwind + PostCSS setup
  style: {
    postcss: {
      plugins: [
        require("postcss-import"),
        require("@tailwindcss/postcss"),
        require("autoprefixer"),
      ],
    },
  },

  // ⚙️ Webpack configuration overrides
  webpack: {
    configure: (webpackConfig) => {
      // ✅ Ignore "Failed to parse source map" warnings
      webpackConfig.ignoreWarnings = [
        {
          module: /lucide-react/,
          message: /Failed to parse source map/,
        },
        // Ignore for other node_modules
        (warning) =>
          warning.module &&
          warning.module.resource &&
          warning.module.resource.includes("node_modules") &&
          warning.message &&
          warning.message.includes("Failed to parse source map"),
      ];

      // ✅ Disable source-map-loader for node_modules to reduce console noise
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule) => {
            if (
              oneOfRule.loader &&
              oneOfRule.loader.includes("source-map-loader")
            ) {
              oneOfRule.exclude = /node_modules/;
            }
          });
        }
      });

      // ✅ (Optional) Add alias for cleaner imports
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "@": path.resolve(__dirname, "src"),
      };

      return webpackConfig;
    },
  },

  // 🧩 Development server settings
  devServer: {
    // Fix React 19 / CRA middleware warnings
    setupMiddlewares: (middlewares, devServer) => {
      // You can add custom middleware here if needed
      return middlewares;
    },
    // Remove deprecated options
    onBeforeSetupMiddleware: undefined,
    onAfterSetupMiddleware: undefined,
  },
};
