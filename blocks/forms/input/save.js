/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	useBlockProps,
	RichText,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
	__experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */

import FormElement from './FormElement';

export default function save(props) {
	const { attributes, setAttributes } = props;
	const {
		label,
		errorMessage,
		name,
		type,
		inline,
		required,
		asterisk,
		style = {},
		hasLabel,
		align,
		justify,
		labelAlign,
		vertical,
	} = attributes;
	const className = ['mailster-wrapper'];

	if (required) className.push('mailster-wrapper-required');
	if (type) className.push('mailster-wrapper-type-' + type);
	if (align) className.push('mailster-wrapper-align-' + align);
	if (justify) className.push('mailster-wrapper-justify-' + justify);
	if (vertical) className.push('mailster-wrapper-is-vertical');
	if (labelAlign)
		className.push('mailster-wrapper-label-align-' + labelAlign);
	if (inline) className.push('mailster-wrapper-inline');
	if (required && asterisk) className.push('mailster-wrapper-asterisk');
	if ('submit' == type) className.push('wp-block-button');

	const styleSheets = {
		width: style.width ? style.width + '%' : undefined,
	};

	const borderProps = getBorderClassesAndStyles(attributes);
	const colorProps = getColorClassesAndStyles(attributes);
	const spacingProps = getSpacingClassesAndStyles(attributes);

	const blockProps = useBlockProps.save({
		className: classnames({}, className),
	});

	const innerStyle = blockProps.style;
	blockProps.style = undefined;

	let labelStyle = { color: style.labelColor };

	if (inline) labelStyle = { ...labelStyle, ...innerStyle };

	const id = 'mailster-input-' + attributes.id;

	const labelElement = (
		<RichText.Content
			tagName="label"
			htmlFor={type != 'radio' ? id : null}
			style={labelStyle}
			className="mailster-label"
			value={label}
		/>
	);

	function autocompleteValue() {
		switch (name) {
			case 'firstname':
				return 'name';
			case 'lastname':
				return 'family-name';
			case 'email':
				return 'email';
		}

		return '';
	}

	return (
		<div
			{...blockProps}
			style={styleSheets}
			data-error-message={errorMessage}
		>
			{hasLabel && label && !inline && labelElement}
			<FormElement
				{...props}
				autoComplete={autocompleteValue()}
				borderProps={borderProps}
				colorProps={colorProps}
				spacingProps={spacingProps}
				innerStyle={innerStyle}
			/>
			{hasLabel && label && inline && labelElement}
		</div>
	);
}
