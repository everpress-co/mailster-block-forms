/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

import ListsPanel from './ListsPanel';
import { searchBlock, useBlockAttributes } from '../../util';

/**
 * Internal dependencies
 */

export default function Lists(props) {
	const listBlock = searchBlock('mailster/lists');
	const [attributes, setAttributes] = useBlockAttributes(listBlock.clientId);

	return (
		<PluginDocumentSettingPanel name="lists" title={__('Lists', 'mailster')}>
			<ListsPanel
				{...props}
				attributes={attributes}
				setAttributes={setAttributes}
			/>
		</PluginDocumentSettingPanel>
	);
}
