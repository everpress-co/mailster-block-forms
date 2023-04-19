/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { PanelBody, PanelRow, RangeControl } from '@wordpress/components';

/**
 * Internal dependencies
 */

export default function InputFieldInspectorControls({
	attributes,
	setAttributes,
	isSelected,
}) {
	const { success, successBackground, error, errorBackground, width } =
		attributes;

	return (
		<InspectorControls>
			<PanelColorSettings
				title={__('Success Message', 'mailster')}
				initialOpen={false}
				//opened={displayMessages}
				onToggle={() => {
					//setDisplayMessages(!displayMessages);
				}}
				colorSettings={[
					{
						value: successBackground,
						onChange: (value) => setAttributes({ successBackground: value }),
						label: __('Background Color', 'mailster'),
					},
					{
						value: success,
						onChange: (value) => setAttributes({ success: value }),
						label: __('Text Color', 'mailster'),
					},
				]}
			></PanelColorSettings>
			<PanelColorSettings
				title={__('Error Messages', 'mailster')}
				initialOpen={false}
				//opened={displayMessages}
				onToggle={() => {
					//setDisplayMessages(!displayMessages);
				}}
				colorSettings={[
					{
						value: errorBackground,
						onChange: (value) => setAttributes({ errorBackground: value }),
						label: __('Background Color', 'mailster'),
					},
					{
						value: error,
						onChange: (value) => setAttributes({ error: value }),
						label: __('Text Color', 'mailster'),
					},
				]}
			></PanelColorSettings>
			<PanelBody title={__('Field Settings', 'mailster')} initialOpen={true}>
				<PanelRow>
					<RangeControl
						className="widefat"
						label="Width"
						value={width}
						allowReset={true}
						initialPosition={100}
						onChange={(value) => setAttributes({ width: value })}
						min={10}
						max={100}
					/>
				</PanelRow>
			</PanelBody>
		</InspectorControls>
	);
}
