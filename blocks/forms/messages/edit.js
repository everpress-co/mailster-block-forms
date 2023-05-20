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

import { useUpdateEffect } from '../../util';
import InputFieldInspectorControls from './inspector.js';
import InputBlockControls from './InputBlockControls';

export default function Edit(props) {
	const { attributes, setAttributes, isSelected } = props;
	const { successMessage, errorMessage, align, width = 100 } = attributes;
	const className = ['mailster-block-form-info', 'mailster-wrapper'];

	if (align) className.push('has-text-align-' + align);

	const [meta, setMeta] = useEntityProp('postType', 'mailster-form', 'meta');

	const successMessageDefault = meta.doubleoptin
		? __('Please confirm your subscription!', 'mailster')
		: __('Thanks for your interest!', 'mailster');

	const errorMessageDefault = __(
		'Some fields are missing or incorrect!',
		'mailster'
	);

	const styleSuccessMessage = {
		width: width + '%',
		color: attributes.success,
		background: attributes.successBackground,
	};
	const styleErrorMessage = {
		width: width + '%',
		color: attributes.error,
		background: attributes.errorBackground,
	};

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});

	useUpdateEffect(() => {
		setAttributes({ successMessage: successMessageDefault });
	}, [meta.doubleoptin]);

	useEffect(() => {
		if (undefined === successMessage)
			setAttributes({ successMessage: successMessageDefault });
		if (undefined === errorMessage)
			setAttributes({ errorMessage: errorMessageDefault });
	}, []);

	return (
		<>
			<div {...blockProps}>
				<div
					className="mailster-block-form-info-success"
					style={styleSuccessMessage}
				>
					<RichText
						tagName="div"
						value={successMessage}
						onChange={(val) => setAttributes({ successMessage: val })}
						placeholder={__('Enter Success Message', 'mailster')}
					/>
					<div className="mailster-block-form-info-extra"></div>
				</div>
				<div
					className="mailster-block-form-info-error"
					style={styleErrorMessage}
				>
					<RichText
						tagName="div"
						value={errorMessage}
						onChange={(val) => setAttributes({ errorMessage: val })}
						placeholder={__('Enter Error Message', 'mailster')}
					/>
					<div className="mailster-block-form-info-extra"></div>
				</div>

				<InputBlockControls {...props} />
				<InputFieldInspectorControls
					meta={meta}
					setMeta={setMeta}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</div>
		</>
	);
}
