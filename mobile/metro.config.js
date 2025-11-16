const path = require("path");

module.exports = {
  watchFolders: [
    path.resolve(__dirname, "..", "app", "src"),
    path.resolve(__dirname, "..", "data")
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "..", "app", "node_modules")
    ],
    extraNodeModules: {
      app: path.resolve(__dirname, "..", "app", "src")
    }
  }
};

