/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

import { useSelect, select, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

//import { __experimentalDimensionControl as DimensionControl } from '@wordpress/components';

/**
 * Internal dependencies
 */

import { DimensionsPanel } from './DimensionsPanel';

export default function Dimensions(props) {
	const { attributes, setAttributes } = props;

	const isInputPanelOpened = useSelect((select) => {
		return select('core/edit-post').isEditorPanelOpened(
			'mailster-block-form-settings-panel/dimensions'
		);
	});

	useEffect(() => {
		!isInputPanelOpened &&
			dispatch('core/edit-post').toggleEditorPanelOpened(
				'mailster-block-form-settings-panel/dimensions'
			);
	}, [isInputPanelOpened]);

	return (
		<PluginDocumentSettingPanel
			className="with-panel"
			name="dimensions"
			title="dimensions"
		>
			{attributes && <DimensionsPanel {...props} />}
		</PluginDocumentSettingPanel>
	);
}
