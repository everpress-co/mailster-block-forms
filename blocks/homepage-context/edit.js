/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import apiFetch from '@wordpress/api-fetch';
import { TabPanel } from '@wordpress/components';
import { useSelect, select, useDispatch, dispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */

import HomepageInspectorControls from '../homepage/inspector';

const SUBSCRIBE_TEMPLATE = [
	['core/heading', { content: __('Thanks for your interest!', 'mailster') }],
	[
		'core/paragraph',
		{
			content: __(
				"Thank you for confirming your subscription to our newsletter. We're excited to have you on board!",
				'mailster'
			),
		},
	],
];

export default function Edit(props) {
	const { attributes, setAttributes, isSelected, context } = props;

	const { id, type = 'submission' } = attributes;

	const contextAlign = context['mailster-homepage-context/align'];

	useEffect(() => {
		setAttributes({ align: contextAlign });
	}, [contextAlign]);

	const className = ['mailster-form-type'];

	className.push('mailster-form-type-' + type);

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});

	const onSelect = (type, index) => {
		location.hash = '#mailster-' + type;

		//select current block
		//const formBlocks = searchBlocks('mailster/homepage-context');
		//select the active block
		//dispatch('core/block-editor').selectBlock(formBlocks[index].clientId);
	};

	const template =
		type != 'subscribe' ? [['mailster/form']] : SUBSCRIBE_TEMPLATE;

	return (
		<>
			<div {...blockProps} data-align="full">
				<InnerBlocks templateLock={false} template={template} />
			</div>
			<HomepageInspectorControls current={type} onSelect={onSelect} />
		</>
	);
}
