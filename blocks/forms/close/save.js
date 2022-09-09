/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */

import { useBlockProps, RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */

export default function save(props) {
	const { attributes, setAttributes } = props;
	const { content, align } = attributes;
	const className = ['mailster-wrapper'];

	if (align) className.push('mailster-wrapper-label-align-' + align);

	const blockProps = useBlockProps.save({
		className: classnames({}, className),
	});

	return (
		<div {...blockProps}>
			<RichText.Content
				tagName="a"
				href=""
				className="mailster-block-form-inner-close"
				value={content}
				aria-label={content}
				tabIndex="0"
			/>
		</div>
	);
}
