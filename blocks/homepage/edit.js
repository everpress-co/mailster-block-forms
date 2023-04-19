/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InspectorControls,
	InnerBlocks,
	BlockControls,
} from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import apiFetch from '@wordpress/api-fetch';
import {
	Panel,
	PanelBody,
	Placeholder,
	Spinner,
	Flex,
	FlexItem,
	FlexBlock,
	Toolbar,
	ToolbarGroup,
	ToolbarItem,
	ToolbarButton,
	TabPanel,
} from '@wordpress/components';
import { Icons, email, screenoptions } from '@wordpress/components';
import {
	useSelect,
	select,
	useDispatch,
	dispatch,
	subscribe,
} from '@wordpress/data';

import {
	Fragment,
	useState,
	Component,
	useEffect,
	useRef,
} from '@wordpress/element';
import { check, edit, tablet, mobile, update } from '@wordpress/icons';

import {
	Button,
	ButtonGroup,
	DropdownMenu,
	SelectControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */

import './editor.scss';

export default function Edit(props) {
	const { attributes, setAttributes, isSelected } = props;
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			<TabPanel
				className="my-tab-panel"
				activeClass="active-tab"
				//onSelect={onSelect}
				tabs={[
					{
						name: 'tab1',
						title: '/',
						className: 'tab-one',
					},
					{
						name: 'tab2',
						title: '/unsubscribe',
						className: 'tab-two',
					},
				]}
			>
				{(tab) => <InnerBlocks template={[['mailster/form', { id: 147 }]]} />}
			</TabPanel>
		</div>
	);
}
