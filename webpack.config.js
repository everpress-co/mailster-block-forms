const defaultConfig = require('@wordpress/scripts/config/webpack.config');

const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const SoundsPlugin = require('sounds-webpack-plugin');

const path = require('path');
const cp = require('child_process');

const soundPluginOptions = {
	sounds: {
		warning: '/System/Library/Sounds/Basso.aiff',
	},
	notifications: {
		done(stats) {
			if (stats.hasErrors()) {
				this.play('warning');
				let message = stats.compilation.errors
					.join('')
					.split('\n')
					.slice(-1)
					.join('');

				if (message) {
					message = message.replace(path.resolve(__dirname), '');
				}

				var ls = cp.spawnSync(
					'osascript',
					[
						'-e',
						'display notification "' +
							message +
							'" with title "Error while building" subtitle "More text"',
					],
					{
						encoding: 'utf8',
					}
				);
			}
			if (stats.hasWarnings()) {
				this.play('warning');

				let message = stats.compilation.warnings
					.join('')
					.split('\n')
					.slice(-1)
					.join('');

				if (message) {
					message = message.replace(path.resolve(__dirname), '');
				}

				var ls = cp.spawnSync(
					'osascript',
					[
						'-e',
						'display notification "' +
							message +
							'" with title "Error while building" subtitle "More text"',
					],
					{
						encoding: 'utf8',
					}
				);
			}
		},
	},
};

module.exports = {
	...defaultConfig,

	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			// Add additional rules as needed.
		],
	},
	plugins: [
		...defaultConfig.plugins,
		new SoundsPlugin(soundPluginOptions),
		new RemoveEmptyScriptsPlugin(),
	],
};
