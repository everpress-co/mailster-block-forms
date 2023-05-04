/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	PluginPrePublishPanel,
	PluginPostPublishPanel,
	PluginPostStatusInfo,
} from '@wordpress/edit-post';
import { registerPlugin } from '@wordpress/plugins';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, select, dispatch } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */

import InputStyles from './InputStyles';
import FormStyles from './FormStyles';
import Css from './Css';
import Events from './Events';
import Options from './Options';
import Doubleoptin from './Doubleoptin';
import Lists from './Lists';
import WelcomeGuide from './WelcomeGuide';
import Placement from './Placement';
import PublishChecks from './PublishChecks';
import '../store';

function SettingsPanelPlugin() {
	const [meta, setMeta] = useEntityProp('postType', 'newsletter_form', 'meta');

	const blocks = useSelect((select) => select('core/block-editor').getBlocks());

	const [blockProps, setBlockProps] = useState(false);

	useEffect(() => {
		const root = blocks.find((block) => {
			return block.name == 'mailster/form-wrapper';
		});

		if (root && !blockProps) {
			const tempBlockProps =
				select('core/block-editor').getBlock(root.clientId) || {};

			tempBlockProps.setAttributes = (attributes = {}) => {
				const newBlockProps = { ...tempBlockProps };
				const current = select('core/block-editor').getBlockAttributes(
					root.clientId
				);
				const merged = { ...current, ...attributes };

				newBlockProps.attributes = merged;
				setBlockProps(newBlockProps);

				dispatch('core/block-editor').updateBlockAttributes(
					root.clientId,
					merged
				);
			};

			setBlockProps(tempBlockProps);
		}
	}, [blocks]);

	return (
		<>
			<PluginPrePublishPanel
				className="mailster-block-forms-pre-publish-panel"
				initialOpen={true}
			>
				<PublishChecks meta={meta} setMeta={setMeta} />
			</PluginPrePublishPanel>
			<PluginPostStatusInfo className="mailster-block-forms-post-status-info">
				<PublishChecks meta={meta} setMeta={setMeta} />
			</PluginPostStatusInfo>
			<WelcomeGuide meta={meta} setMeta={setMeta} />
			<Options meta={meta} setMeta={setMeta} />
			<Doubleoptin meta={meta} setMeta={setMeta} />
			<Lists meta={meta} setMeta={setMeta} />
			{blockProps && (
				<>
					<FormStyles {...blockProps} />
					<InputStyles {...blockProps} />
					<Css {...blockProps} />
					<Events {...blockProps} />
					<Placement meta={meta} setMeta={setMeta} {...blockProps} />
				</>
			)}
		</>
	);
}

registerPlugin('mailster-block-form-settings-panel', {
	render: SettingsPanelPlugin,
	icon: false,
});
