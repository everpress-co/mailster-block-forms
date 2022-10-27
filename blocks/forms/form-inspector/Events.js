/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

import { EventsPanel } from './EventsPanel';

/**
 * Internal dependencies
 */

export default function Events(props) {
	const { attributes, setAttributes } = props;

	return (
		<PluginDocumentSettingPanel
			name="events"
			title={__('Events', 'mailster')}
		>
			<EventsPanel
				attributes={attributes}
				setAttributes={setAttributes}
			/>
		</PluginDocumentSettingPanel>
	);
}
