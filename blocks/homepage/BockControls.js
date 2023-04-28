/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';
import {
	ToolbarButton,
	ToolbarDropdownMenu,
	Toolbar,
	ToolbarItem,
	Button,
	IconButton,
} from '@wordpress/components';
import {
	more,
	arrowLeft,
	arrowRight,
	arrowUp,
	arrowDown,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */

import { TABS } from './constants';

export default function HomepageBlockControls(props) {
	const { attributes, setAttributes, current, onSelect } = props;
	const {} = attributes;

	const currentTab = TABS.find((tab) => tab.id === current);

	return (
		<BlockControls group="block">
			<ToolbarDropdownMenu
				icon={more}
				label={__('Change element alignment', 'mailster')}
				controls={TABS.map((tab) => {
					return {
						role: 'menuitemradio',
						title: tab.name,
						isActive: tab.id === current,
						onClick: () => onSelect(tab.id),
					};
				})}
			/>
			<ToolbarButton>{currentTab?.name}</ToolbarButton>
		</BlockControls>
	);
}
