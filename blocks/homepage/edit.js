/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import apiFetch from '@wordpress/api-fetch';
import { Flex, TabPanel } from '@wordpress/components';
import { useSelect, select, useDispatch, dispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */

import './editor.scss';
import HomepageInspectorControls from './inspector';

const BLOCK_TEMPLATE = [
	['mailster/homepage-context', { type: 'form' }],
	['mailster/homepage-context', { type: 'profile' }],
	['mailster/homepage-context', { type: 'unsubscribe' }],
];

const TABS = [
	{
		name: 'form',
		title: '/',
		label: 'This is the homepage',
	},
	{
		name: 'profile',
		title: '/profile',
		label: 'This is the profile page',
	},
	{
		name: 'unsubscribe',
		title: '/unsubscribe',
		label: 'This is the unsubscribe page',
	},
];

export default function Edit(props) {
	const { attributes, setAttributes, isSelected } = props;

	const { id, profile, unsubscribe } = attributes;

	const className = ['mailster-homepage'];

	const [current, setCurrent] = useState(location.hash.substring(1) ?? 'form');

	console.log(current);

	const onSelect = (tab) => {
		setCurrent(tab);
	};

	useEffect(() => {
		if (!current) return;
		history.replaceState(undefined, undefined, '#' + current);

		return () => {
			history.pushState(
				'',
				document.title,
				location.pathname + location.search
			);
		};
	}, [current]);

	const currentTab = TABS.find((tab) => tab.name === current);

	className.push('tab-' + current);

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});

	return (
		<div {...blockProps}>
			<Flex className="mailster-homepage-tabs">
				<TabPanel
					activeClass="active-tab"
					onSelect={onSelect}
					initialTabName={current}
					tabs={TABS}
					disabled={true}
				>
					{(tab) => {
						return (
							<>
								<HomepageInspectorControls
									{...props}
									tab={tab}
									current={current}
								/>
							</>
						);
					}}
				</TabPanel>
				<span className="tab-explanation">{currentTab?.label}</span>
			</Flex>
			<InnerBlocks template={BLOCK_TEMPLATE} templateLock="all" />
		</div>
	);
}
