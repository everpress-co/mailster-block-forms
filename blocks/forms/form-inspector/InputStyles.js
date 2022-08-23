/**
 * External dependencies
 */

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
	const isInputPanelOpened = useSelect((select) => {
		return select('core/edit-post').isEditorPanelOpened(
			'mailster-block-form-settings-panel/input-styles'
		);
	});

	useEffect(() => {
		!isInputPanelOpened &&
			dispatch('core/edit-post').toggleEditorPanelOpened(
				'mailster-block-form-settings-panel/input-styles'
			);
	}, [isInputPanelOpened]);

	return (
		<PluginDocumentSettingPanel className="with-panel" name="input-styles">
			<InputStylesPanel {...props} />
		</PluginDocumentSettingPanel>
	);
}
