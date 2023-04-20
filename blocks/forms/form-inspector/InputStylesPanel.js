/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { PanelRow, RangeControl } from '@wordpress/components';
import { __experimentalPanelColorGradientSettings as PanelColorGradientSettings } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */

export const colorSettings = [
	{
		id: 'labelColor',
		label: __('Label Color', 'mailster'),
	},
	{
		id: 'inputColor',
		label: __('Input Font Color', 'mailster'),
	},
	{
		id: 'backgroundColor',
		label: __('Input Background Color', 'mailster'),
	},
	{
		id: 'borderColor',
		label: __('Input Border Color', 'mailster'),
	},
];

export const InputStylesPanel = (props) => {
	const { attributes, setAttributes, children } = props;

	const { style = {} } = attributes;

	function setStyle(prop, value) {
		var newStyle = { ...style };
		newStyle[prop] = value;
		setAttributes({ style: newStyle });
	}

	return (
		<PanelColorGradientSettings
			__experimentalHasMultipleOrigins
			__experimentalIsRenderedInSidebar
			name="input-styles-panel"
			initialOpen={true}
			settings={colorSettings.flatMap((color, i) => {
				return {
					colorValue: style?.[color.id],
					disableCustomGradients: true,
					label: color.label,
					onColorChange: (value) => setStyle(color.id, value),
				};
			})}
		>
			<PanelRow>
				<RangeControl
					className="widefat"
					label={__('Border Width', 'mailster')}
					value={
						style.borderWidth ? parseInt(style.borderWidth, 10) : undefined
					}
					allowReset={true}
					onChange={(value) =>
						setStyle(
							'borderWidth',
							typeof value !== 'undefined' ? value + 'px' : undefined
						)
					}
					min={0}
					max={12}
				/>
			</PanelRow>
			<PanelRow>
				<RangeControl
					className="widefat"
					label={__('Border Radius', 'mailster')}
					value={
						style.borderRadius ? parseInt(style.borderRadius, 10) : undefined
					}
					allowReset={true}
					onChange={(value) =>
						setStyle(
							'borderRadius',
							typeof value !== 'undefined' ? value + 'px' : undefined
						)
					}
					min={0}
					max={60}
				/>
			</PanelRow>
			{!!children && <>{children}</>}
		</PanelColorGradientSettings>
	);
};
