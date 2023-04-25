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
	PanelBody,
	PanelRow,
	CheckboxControl,
	TextControl,
	RangeControl,
	Button,
	Tip,
} from '@wordpress/components';

import { useState } from '@wordpress/element';
import { select, dispatch } from '@wordpress/data';

import { external } from '@wordpress/icons';

/**
 * Internal dependencies
 */

export default function HomepageInspectorControls(props) {
	const { attributes, setAttributes, isSelected, clientId, tab } = props;
	const {} = attributes;

	return (
		<InspectorControls>
			<Panel>
				<PanelBody initialOpen={true}>
					<PanelRow>
						<h2>{tab.label}</h2>
					</PanelRow>
					<PanelRow>
						<Tip>
							{tab.name == 'form' &&
								__(
									'This form is displayed if users visits the newsletter homepage.',
									'mailster'
								)}
							{tab.name == 'profile' &&
								__(
									'This form is displayed if users visits the profile page. People can update their subscription on this page.',
									'mailster'
								)}
							{tab.name == 'unsubscribe' &&
								__(
									'This form is displayed on the unsubscribe page. If the user clicks an unsubscribe link in a newsletter, he will be redirected to this page.',
									'mailster'
								)}
						</Tip>
					</PanelRow>
				</PanelBody>
			</Panel>
		</InspectorControls>
	);
}
