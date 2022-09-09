/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { useBlockProps, RichText } from '@wordpress/block-editor';

import { useEffect } from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */

import InputBlockControls from './InputBlockControls';

export default function Edit(props) {
	const { attributes, setAttributes, isSelected, clientId } = props;
	const { content, align } = attributes;
	const className = ['mailster-wrapper'];

	if (align) className.push('mailster-wrapper-label-align-' + align);

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});

	useEffect(() => {
		if (!content)
			setAttributes({
				content: __('Close popup', 'mailster'),
			});
	});
	return (
		<>
			<div {...blockProps}>
				<RichText
					tagName="a"
					href=""
					value={content}
					className="mailster-block-form-inner-close"
					allowedFormats={['core/bold', 'core/italic']}
					onChange={(val) => setAttributes({ content: val })}
					aria-label={content}
					placeholder={__('Enter Label', 'mailster')}
				/>
			</div>
			<InputBlockControls {...props} />
		</>
	);
}
