const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./tsc/Template/game.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "game.js",
  },
  optimization: {
    minimize: false,
  },
};
