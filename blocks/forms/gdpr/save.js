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
	const fieldid = attributes.id;

	const blockProps = useBlockProps.save({
		className: classnames({}, className),
	});

	return (
		<div {...blockProps}>
			<div className="mailster-group mailster-group-checkbox">
				<input id={fieldid} type="checkbox" name="_gdpr" value="1" />

				<RichText.Content
					style={blockProps.style}
					htmlFor={fieldid}
					tagName="label"
					className="mailster-label"
					value={content}
				/>
			</div>
		</div>
	);
}
