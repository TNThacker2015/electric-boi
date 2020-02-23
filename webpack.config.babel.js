const path = require("path");
const { NODE_ENV = "production" } = process.env;
const nodeExternals = require("webpack-node-externals");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
	externals: [nodeExternals()],
	entry: {
		server: "./server.ts",
		index: "./src/index.ts"
	},
	mode: NODE_ENV,
	target: "node",
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "index.js",
		publicPath: "/src/"
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: [{ loader: "html-loader" }]
			},
			{
				test: /\.ts$/i,
				use: ["ts-loader"]
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					"style-loader",
					"css-loader",
					{
						loader: "postcss-loader",
						options: {
							// plugins: () => [autoprefixer()]
						}
					},
					"sass-loader"
				]
			},
			{
				test: /\.(png|svg|jpg|gif|mp4|mp3)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							esModule: false
						}
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: "./src/index.html",
			filename: "./src/index.html",
			excludeChunks: ["server"]
		})
	]
};
