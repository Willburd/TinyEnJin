const path = require("path");

module.exports = {
	mode: "development",
	devtool: "source-map",
	entry: "./Build/Tsc/Template/game.js",
	output: {
		path: path.resolve(__dirname, "Build"),
		filename: "game.js",
	},
	optimization: {
		minimize: false,
	},
};
