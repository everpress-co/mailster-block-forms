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
import json from './block.json';
import icon from './Icon';

const { name, ...settings } = json;

registerBlockType(name, {
	...settings,
	icon,
	edit,
	save,
});
