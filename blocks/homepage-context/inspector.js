/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __, sprintf } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';
import {
	Panel,
	PanelBody,
	PanelRow,
	ItemGroup,
	BaseControl,
	MenuGroup,
	MenuItem,
	CheckboxControl,
	TextControl,
	RangeControl,
	Button,
	Tip,
	ExternalLink,
} from '@wordpress/components';

import { select, dispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

import { external } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import HomepageInspectorControls from '../homepage/inspector';
import { searchBlocks } from '../util';

export default function HomepageContextInspectorControls(props) {
	const { attributes, setAttributes, isSelected, context } = props;
	const { id, type = 'submission' } = attributes;

	const onSelect = (type, index) => {
		location.hash = '#mailster-' + type;

		//select current block
		//const formBlocks = searchBlocks('mailster/form');
		//select the active block
		//dispatch('core/block-editor').selectBlock(formBlocks[index].clientId);
	};

	return (
		<>
			<InspectorControls>
				<Panel>
					<PanelBody initialOpen={true}>
						<PanelRow>
							{__(
								'Add blocks to selected sections of the homepage which get only displayed on these pages.',
								'mailster'
							)}
						</PanelRow>
					</PanelBody>
				</Panel>
			</InspectorControls>
			{true && <HomepageInspectorControls current={type} onSelect={onSelect} />}
		</>
	);
}
