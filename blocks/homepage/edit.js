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
import { Flex, Guide, TabPanel, Tooltip } from '@wordpress/components';
import { useSelect, select, useDispatch, dispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */

import './editor.scss';
import HomepageInspectorControls from './inspector';
import { TABS } from './constants';
import HomepageBlockControls from './BockControls';
import { searchBlocks } from '../util';

const BLOCK_TEMPLATE = [
	['mailster/homepage-context', { type: 'submission' }],
	['mailster/homepage-context', { type: 'profile' }],
	['mailster/homepage-context', { type: 'unsubscribe' }],
	['mailster/homepage-context', { type: 'subscribe' }],
];

export default function Edit(props) {
	const { attributes, setAttributes, isSelected } = props;

	const {} = attributes;

	const className = ['mailster-homepage'];

	const [current, setCurrent] = useState();

	useEffect(() => {
		if (!current) return;
		history.replaceState(undefined, undefined, '#mailster-' + current);

		return () => {
			history.pushState(
				'',
				document.title,
				location.pathname + location.search
			);
		};
	}, [current]);

	useEffect(() => {
		window.addEventListener('hashchange', onHashChange);

		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, []);

	useEffect(() => {
		const hash = location.hash.substring(10);
		hash && setCurrent(hash);
	}, []);

	//set other forms if only "submission" is set
	useEffect(() => {
		if (attributes.submission) {
			if (!attributes.profile)
				setAttributes({ profile: attributes.submission });
			if (!attributes.unsubscribe)
				setAttributes({ unsubscribe: attributes.submission });
		}
	}, [attributes]);

	const onSelect = (type, index) => {
		location.hash = '#mailster-' + type;
		setCurrent(type);

		//select current block
		//const formBlocks = searchBlocks('mailster/form');
		//select the active block
		//dispatch('core/block-editor').selectBlock(formBlocks[index].clientId);
	};

	const onHashChange = () => {
		setCurrent(location.hash.substring(10) ?? 'submission');
	};

	const currentTab = TABS.find((tab) => tab.id === current);

	className.push('tab-' + (current || 'submission'));

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});

	return (
		<>
			<div {...blockProps}>
				{currentTab && (
					<Tooltip text={currentTab.label}>
						<span className="section-info">{currentTab.name}</span>
					</Tooltip>
				)}
				<InnerBlocks template={BLOCK_TEMPLATE} templateLock="all" />
				<HomepageInspectorControls current={current} onSelect={onSelect} />
			</div>
			<HomepageBlockControls {...props} current={current} onSelect={onSelect} />
		</>
	);
}
