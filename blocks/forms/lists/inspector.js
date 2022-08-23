/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */

import ListsPanel from '../form-inspector/ListsPanel';

export default function InputFieldInspectorControls(props) {
	return (
		<InspectorControls>
			<Panel>
				<PanelBody title={__('List Settings', 'mailster')}>
					<ListsPanel {...props} />
				</PanelBody>
			</Panel>
		</InspectorControls>
	);
}
