/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import { ToolbarButton } from '@wordpress/components';

import { arrowRight, arrowDown } from '@wordpress/icons';

/**
 * Internal dependencies
 */

export default function InputBlockControls(props) {
	const { attributes, setAttributes } = props;
	const { vertical, dropdown } = attributes;

	if (dropdown) return null;

	return (
		<BlockControls group="block">
			<ToolbarButton
				icon={vertical ? arrowDown : arrowRight}
				onClick={() => setAttributes({ vertical: !vertical })}
				label={__('Orientation', 'mailster')}
			/>
		</BlockControls>
	);
}
