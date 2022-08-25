/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import { ToolbarDropdownMenu, ToolbarButton } from '@wordpress/components';

import {
	arrowRight,
	arrowDown,
	justifyLeft,
	justifyCenter,
	justifyRight,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */

import Icons from './Icons';

export default function InputBlockControls(props) {
	const { attributes, setAttributes } = props;
	const { align, justify, labelAlign, hasLabel, vertical, type } = attributes;

	const labelPositionControls = [
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

	const justifyPositionControls = [
		{
			role: 'menuitemradio',
			title: __('Align left', 'mailster'),
			isActive: justify === 'left',
			icon: justifyLeft,
			onClick: () => setAttributes({ justify: 'left' }),
		},
		{
			role: 'menuitemradio',
			title: __('Align center', 'mailster'),
			isActive: justify === 'center',
			icon: justifyCenter,
			onClick: () => setAttributes({ justify: 'center' }),
		},
		{
			role: 'menuitemradio',
			title: __('Align right', 'mailster'),
			isActive: justify === 'right',
			icon: justifyRight,
			onClick: () => setAttributes({ justify: 'right' }),
		},
	];

	const getLabelPostionIcon = () => {
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

	const getJustifyPostionIcon = () => {
		switch (justify) {
			case 'left':
				return justifyLeft;
			case 'center':
				return justifyCenter;
			case 'right':
				return justifyRight;
		}
		return justifyLeft;
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
					icon={getLabelPostionIcon()}
					label={__('Change label alignment', 'mailster')}
					controls={labelPositionControls}
				/>
			)}
			<ToolbarDropdownMenu
				icon={getJustifyPostionIcon()}
				label={__('Change element alignment', 'mailster')}
				controls={justifyPositionControls}
			/>
		</BlockControls>
	);
}
