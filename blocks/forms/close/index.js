/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */

import edit from './edit';
import save from './save';
import icon from './Icon';
import json from './block.json';

const { name, ...settings } = json;

registerBlockType(name, {
	...settings,
	icon,
	/**
	 * @see ./edit.js
	 */
	edit,

	/**
	 * @see ./save.js
	 */
	save,
});
