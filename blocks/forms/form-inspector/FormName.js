/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	Button,
	PanelRow,
	CheckboxControl,
	TextControl,
} from '@wordpress/components';

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { dispatch } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */

import { searchBlock } from '../../util';

export default function FormName(props) {
	const { meta, setMeta } = props;

	const [title, setTitle] = useEntityProp(
		'postType',
		'newsletter_form',
		'title'
	);

	const editMessages = () => {
		const mblock = searchBlock('mailster/messages');
		if (mblock) dispatch('core/block-editor').selectBlock(mblock.clientId);
	};

	return (
		<PluginDocumentSettingPanel initialOpen={true}>
			<PanelRow>
				<TextControl
					label={__('Form Name', 'mailster')}
					value={title}
					onChange={(value) => setTitle(value)}
					help={__('Define a name for your form.', 'mailster')}
					placeholder={__('Add title', 'mailster')}
				/>
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
}
