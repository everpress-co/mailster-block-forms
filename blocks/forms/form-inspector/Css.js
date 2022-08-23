/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

import { CssPanel } from './CssPanel';

/**
 * Internal dependencies
 */

export default function Css(props) {
	const { attributes, setAttributes } = props;

	return (
		<PluginDocumentSettingPanel
			name="custom-css"
			title={__('Custom CSS', 'mailster')}
		>
			<CssPanel attributes={attributes} setAttributes={setAttributes} />
		</PluginDocumentSettingPanel>
	);
}
