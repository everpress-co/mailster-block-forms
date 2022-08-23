/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import { ToolbarDropdownMenu, ToolbarButton } from '@wordpress/components';

import { arrowRight, arrowDown } from '@wordpress/icons';

/**
 * Internal dependencies
 */

import Icons from './Icons';

export default function InputBlockControls(props) {
	const { attributes, setAttributes } = props;
	const { align, labelAlign, hasLabel, vertical, type } = attributes;

	const buttonPositionControls = [
		{
			role: 'menuitemradio',
			title: __('Align left', 'mailster'),
			isActive: labelAlign === 'left',
			icon: Icons.labelLeft,
			onClick: () => setAttributes({ labelAlign: 'left' }),
		},
		{
			role: 'menuitemradio',
			title: __('Align center', 'mailster'),
			isActive: labelAlign === 'center',
			icon: Icons.labelCenter,
			onClick: () => setAttributes({ labelAlign: 'center' }),
		},
		{
			role: 'menuitemradio',
			title: __('Align right', 'mailster'),
			isActive: labelAlign === 'right',
			icon: Icons.labelRight,
			onClick: () => setAttributes({ labelAlign: 'right' }),
		},
	];

	const getButtonPositionIcon = () => {
		switch (labelAlign) {
			case 'left':
				return Icons.labelLeft;
			case 'center':
				return Icons.labelCenter;
			case 'right':
				return Icons.labelRight;
		}
		return Icons.labelLeft;
	};

	function updateAlignment(alignment) {
		setAttributes({ align: alignment });
	}

	return (
		<BlockControls group="block">
			{'radio' == type && (
				<ToolbarButton
					icon={vertical ? arrowDown : arrowRight}
					onClick={() => setAttributes({ vertical: !vertical })}
					label={__('Orientation', 'mailster')}
				/>
			)}
			<AlignmentToolbar
				value={align}
				onChange={updateAlignment}
				describedBy={__('Change text alignment', 'mailster')}
				label={__('Align', 'mailster')}
			/>
			{hasLabel && (
				<ToolbarDropdownMenu
					icon={getButtonPositionIcon()}
					label={__('Change label alignment', 'mailster')}
					controls={buttonPositionControls}
				/>
			)}
		</BlockControls>
	);
}
