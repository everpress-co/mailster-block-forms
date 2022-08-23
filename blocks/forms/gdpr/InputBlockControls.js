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
	const { align, labelAlign, hasLabel } = attributes;

	function updateAlignment(alignment) {
		setAttributes({ align: alignment });
	}
	function updateLabelAlignment(alignment) {
		setAttributes({ labelAlign: alignment });
	}

	return (
		<BlockControls group="block">
			{hasLabel && (
				<AlignmentToolbar
					value={labelAlign}
					onChange={updateLabelAlignment}
					describedBy={__('Change label alignment', 'mailster')}
					label={__('Label Align', 'mailster')}
				/>
			)}
			<AlignmentToolbar
				value={align}
				onChange={updateAlignment}
				describedBy={__('Change text alignment', 'mailster')}
				label={__('Align', 'mailster')}
			/>
		</BlockControls>
	);
}
