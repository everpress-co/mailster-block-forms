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

import { FormStylesPanel } from './FormStylesPanel';

export default function Styles(props) {
	return (
		<PluginDocumentSettingPanel
			name="form-styles"
			title={__('Form Styles', 'mailster')}
		>
			<FormStylesPanel {...props} />
		</PluginDocumentSettingPanel>
	);
}
