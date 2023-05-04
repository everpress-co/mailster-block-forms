/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */

export default function save(props) {
	return <InnerBlocks.Content {...useBlockProps.save()} />;
}
