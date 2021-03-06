const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

const {
	buildConfig,
} = require('./webpack.common')

const config = buildConfig()
const whitelist = [/@tygen/, /\.css$/, /\.svg$/, 'webpack/hot/poll?1000']

const finalConfig = Object.assign({}, config, {
	entry: {
		cli: './src/cli.ts'
	},
	target: 'node',
	node: {
		__filename: false,
		__dirname: false,
		console: false,
		global: false,
		process: false,
		Buffer: false,
	},
	externals: [
		nodeExternals({
			whitelist
		}),
		nodeExternals({
			whitelist,
			modulesDir: path.resolve(__dirname, '../../node_modules')
		})
	],
})

finalConfig.output.libraryTarget = 'umd'
finalConfig.output.library = {
	root: 'TygenHtml',
	amd: '@tygen/html',
	commonjs: '@tygen/html'
}

finalConfig.plugins.push(new webpack.optimize.LimitChunkCountPlugin({
	maxChunks: 1
}))

finalConfig.plugins.push(new webpack.HotModuleReplacementPlugin())

finalConfig.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]'

module.exports = finalConfig
