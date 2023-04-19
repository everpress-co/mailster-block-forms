/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';
import {
	Panel,
	PanelRow,
	PanelBody,
	CheckboxControl,
	TextControl,
	RangeControl,
} from '@wordpress/components';

import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */

export default function GdprFieldInspectorControls({
	attributes,
	setAttributes,
}) {
	const { content } = attributes;

	return (
		<InspectorControls>
			<Panel>
				<PanelBody title={__('Field Settings', 'mailster')} initialOpen={true}>
					<PanelRow>
						<TextControl
							label={__('Content', 'mailster')}
							value={content}
							onChange={(val) => setAttributes({ content: val })}
						/>
					</PanelRow>
				</PanelBody>
			</Panel>
		</InspectorControls>
	);
}
