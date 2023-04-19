/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import { CssPanel } from './CssPanel';

export default function Css(props) {
	return (
		<PluginDocumentSettingPanel
			name="custom-css"
			title={__('Custom CSS', 'mailster')}
		>
			<CssPanel {...props} />
		</PluginDocumentSettingPanel>
	);
}
