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

import GdprFieldInspectorControls from './inspector.js';
import InputBlockControls from './InputBlockControls';

export default function Edit(props) {
	const { attributes, setAttributes, isSelected, clientId } = props;
	const { content, align } = attributes;
	const className = ['mailster-wrapper'];

	if (align) className.push('mailster-wrapper-label-align-' + align);

	const [meta, setMeta] = useEntityProp('postType', 'newsletter_form', 'meta');

	useEffect(() => {
		if (!attributes.id)
			setAttributes({ id: 'mailster-id-' + clientId.substring(30) });
		if (!content)
			setAttributes({
				content: __('I agree to the privacy policy and terms.', 'mailster'),
			});
	});

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});

	return (
		<>
			<div {...blockProps}>
				{meta.gdpr ? (
					<div className="mailster-group mailster-group-checkbox">
						<input
							type="checkbox"
							name="_gdpr"
							value="1"
							className="disabled-input"
						/>
						<RichText
							tagName="label"
							className="mailster-label"
							value={content}
							onChange={(val) => setAttributes({ content: val })}
							placeholder={__('Enter Label', 'mailster')}
						/>
					</div>
				) : (
					<></>
				)}
			</div>
			<InputBlockControls {...props} />
			<GdprFieldInspectorControls
				meta={meta}
				setMeta={setMeta}
				attributes={attributes}
				setAttributes={setAttributes}
			/>
		</>
	);
}
