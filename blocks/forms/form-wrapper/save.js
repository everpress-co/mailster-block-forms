/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */

import {
	InnerBlocks,
	useBlockProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
	__experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */

export default function save(props) {
	const { attributes } = props;

	const borderProps = getBorderClassesAndStyles(attributes);
	const colorProps = getColorClassesAndStyles(attributes);
	const spacingProps = getSpacingClassesAndStyles(attributes);

	const formClasses = classnames(
		'mailster-block-form',
		colorProps.className,
		borderProps.className,
		spacingProps.className
	);

	const formStyle = {
		...borderProps.style,
		...colorProps.style,
		...spacingProps.style,
		...{
			//color: attributes.color,
			//backgroundColor: attributes.backgroundColor,
			fontSize: attributes.fontSize,
			borderRadius: attributes.borderRadius,
		},
	};

	const cleanedFormStyle = Object.fromEntries(
		Object.entries(formStyle).filter(([_, v]) => v != null)
	);

	return (
		<form
			method="post"
			novalidate
			style={{ cleanedFormStyle }}
			{...useBlockProps.save({
				className: formClasses,
			})}
		>
			<div className="mailster-block-form-inner">
				<InnerBlocks.Content />
			</div>
		</form>
	);
}
