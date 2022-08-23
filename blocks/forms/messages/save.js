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
	const { attributes, setAttributes, isSelected } = props;
	const { successMessage, errorMessage, align, width = 100 } = attributes;
	const className = ['mailster-block-form-info', 'mailster-wrapper'];

	if (align) className.push('has-text-align-' + align);

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

	const blockProps = useBlockProps.save({
		className: classnames({}, className),
	});

	return (
		<div {...blockProps} aria-hidden={true}>
			<div
				className="mailster-block-form-info-success"
				style={styleSuccessMessage}
				role="alert"
			>
				<RichText.Content tagName="div" value={successMessage} />
				<div className="mailster-block-form-info-extra"></div>
			</div>
			<div
				className="mailster-block-form-info-error"
				style={styleErrorMessage}
				role="alert"
			>
				<RichText.Content tagName="div" value={errorMessage} />
				<div className="mailster-block-form-info-extra"></div>
			</div>
		</div>
	);
}
