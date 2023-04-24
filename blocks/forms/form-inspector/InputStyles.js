/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * WordPress dependencies
 */

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

import { useSelect, select, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */

import { InputStylesPanel, colorSettings } from './InputStylesPanel';

export default function InputStyles(props) {
	return (
		<PluginDocumentSettingPanel
			name="input-styles"
			title={__('Input Styles', 'mailster')}
		>
			<InputStylesPanel {...props} />
		</PluginDocumentSettingPanel>
	);
}
