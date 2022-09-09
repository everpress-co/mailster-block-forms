/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

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
			<AlignmentToolbar
				value={align}
				onChange={updateAlignment}
				describedBy={__('Change text alignment', 'mailster')}
				label={__('Align', 'mailster')}
			/>
		</BlockControls>
	);
}
