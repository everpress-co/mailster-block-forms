/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

import ListsPanel from './ListsPanel';

/**
 * Internal dependencies
 */

export default function Lists(props) {
	return (
		<PluginDocumentSettingPanel
			name="lists"
			title={__('Lists', 'mailster')}
		>
			<ListsPanel {...props} />
		</PluginDocumentSettingPanel>
	);
}
