/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { useEffect } from '@wordpress/element';
/**
 * Internal dependencies
 */

import edit from './edit';
import save from './save';
import json from './block.json';

const { name, attributes, ...settings } = json;

registerBlockType(name, {
	...settings,
	attributes: {
		...attributes,
		style: {
			type: 'object',
			default: {
				width: undefined,
				inputColor: undefined,
				backgroundColor: undefined,
				labelColor: undefined,
				borderColor: undefined,
				borderWidth: undefined,
				borderStyle: undefined,
				borderRadius: undefined,
				fontSize: undefined,
			},
		},
	},
	/**
	 * @see ./edit.js
	 */
	edit,

	/**
	 * @see ./save.js
	 */
	save,
});

// only allow blocks inside the form wrapper
function setParentToBlocks(settings, name) {
	if (!/^mailster\//.test(name)) {
		// no parents => allowed in root
		if (!settings['parent']) {
			settings['parent'] = [
				'mailster/form-wrapper',
				'core/column',
				'core/group',
			];
		} else if (!settings['parent'].includes('mailster/form-wrapper')) {
			return settings;
			settings['parent'].push(
				'mailster/form-wrapper',
				'core/column',
				'core/group'
			);
			settings['parent'] = settings['parent'].filter(
				(item) => item !== 'core/post-content'
			);
		}
	}

	return settings;
}

wp.hooks.addFilter(
	'blocks.registerBlockType',
	'mailster/forms/set-parent-to-blocks',
	setParentToBlocks
);
