module.exports = function override(config, env) {
  // Remove wasm from defaultRules
  // See https://github.com/joshhunt/destinyDataExplorer/commits/master/config/webpack.config.js
  config.module.defaultRules = [
    {
      type: "javascript/auto",
      resolve: {},
    },
    {
      test: /\.json$/i,
      type: "json",
    },
  ];

  return config;
};
