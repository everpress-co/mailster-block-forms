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

import { FormStylesPanel } from './FormStylesPanel';

export default function Styles(props) {
	const isFormPanelOpened = useSelect((select) => {
		return select('core/edit-post').isEditorPanelOpened(
			'mailster-block-form-settings-panel/form-styles'
		);
	});

	useEffect(() => {
		!isFormPanelOpened &&
			dispatch('core/edit-post').toggleEditorPanelOpened(
				'mailster-block-form-settings-panel/form-styles'
			);
	}, [isFormPanelOpened]);

	return (
		<PluginDocumentSettingPanel className="with-panel" name="form-styles">
			<FormStylesPanel {...props} />
		</PluginDocumentSettingPanel>
	);
}
