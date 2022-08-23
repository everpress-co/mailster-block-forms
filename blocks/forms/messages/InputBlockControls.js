/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { BlockControls, AlignmentToolbar } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */

export default function InputBlockControls(props) {
	const { attributes, setAttributes } = props;
	const { align } = attributes;

	function updateAlignment(alignment) {
		setAttributes({ align: alignment });
	}
	return (
		<BlockControls group="block">
			<AlignmentToolbar value={align} onChange={updateAlignment} />
		</BlockControls>
	);
}
