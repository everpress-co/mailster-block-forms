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

export default function Edit(props) {
	const { attributes, setAttributes, isSelected, context } = props;

	const { id, type = 'form' } = attributes;

	const contextAlign = context['mailster-homepage-context/align'];

	useEffect(() => {
		setAttributes({ align: contextAlign });
	}, [contextAlign]);

	const className = ['mailster-form-type'];

	className.push('mailster-form-type-' + type);

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});
	return (
		<div {...blockProps}>
			<InnerBlocks
				templateLock={false}
				template={[['mailster/form', { type: type }]]}
			/>
		</div>
	);
}
