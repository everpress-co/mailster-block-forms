/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */

import { __, sprintf } from '@wordpress/i18n';

import { cleanForSlug } from '@wordpress/url';

import { format } from '@wordpress/date';

/**
 * Internal dependencies
 */

export default function FormElement(props) {
	const {
		attributes,
		setAttributes,
		isSelected,
		isEditor,
		clientId,
		borderProps,
		colorProps,
		spacingProps,
		innerStyle,
		autoComplete,
	} = props;
	const {
		label,
		name,
		selected,
		type,
		inline,
		required,
		native,
		style = {},
		values,
		pattern,
	} = attributes;

	const elem = classnames(colorProps.className, borderProps.className);

	const id = 'mailster-input-' + attributes.id;

	const inputStyle = {
		...borderProps.style,
		...colorProps.style,
		...spacingProps.style,
		...innerStyle,
		...{
			color: style.inputColor,
			backgroundColor: style.backgroundColor,
			borderColor: style.borderColor,
			borderWidth: style.borderWidth,
			borderStyle: style.borderStyle,
			borderRadius: style.borderRadius,
		},
	};

	switch (type) {
		case 'radio':
			return (
				<fieldset>
					<legend>{label}</legend>
					{values.map((value, i) => {
						const fieldid = isEditor
							? null
							: cleanForSlug(value) + '-' + attributes.id;
						return (
							<div
								className="mailster-group mailster-group-radio"
								style={inputStyle}
								key={i}
							>
								<input
									name={name}
									id={fieldid}
									aria-required={required}
									aria-label={label}
									required={required}
									type="radio"
									checked={selected == value}
									value={value}
									onChange={(event) =>
										setAttributes({
											selected: event.target.value,
										})
									}
								/>
								<label
									className="mailster-label"
									htmlFor={fieldid}
								>
									{value}
								</label>
							</div>
						);
					})}
				</fieldset>
			);
		case 'checkbox':
			const fieldid = isEditor
				? null
				: cleanForSlug(name) + '-' + attributes.id;
			return (
				<fieldset
					className="mailster-group mailster-group-checkbox"
					style={inputStyle}
				>
					<legend>{label}</legend>
					<input
						name={name}
						id={fieldid}
						aria-required={required}
						aria-label={label}
						spellCheck={false}
						required={required}
						type="checkbox"
						defaultChecked={false}
					/>
					<label className="mailster-label" htmlFor={fieldid}>
						{label}
					</label>
				</fieldset>
			);
		case 'dropdown':
			return (
				<select
					name={name}
					id={id}
					className="input"
					aria-required={required}
					aria-label={label}
					required={required}
					value={selected ?? ''}
					style={inputStyle}
					onChange={(event) =>
						setAttributes({
							selected: event.target.value,
						})
					}
				>
					{values.map((value, i) => {
						return (
							<option key={i} value={value}>
								{value}
							</option>
						);
					})}
				</select>
			);

		case 'submit':
			return (
				<input
					name={name}
					id={id}
					type="submit"
					style={inputStyle}
					value={label}
					className="wp-block-button__link submit-button"
				/>
			);
		default:
			const sample =
				'date' == type
					? format('Y-m-d', new Date())
					: sprintf(__('Sample text for %s'), label);

			return (
				<input
					name={name}
					id={id}
					type={native ? type : 'text'}
					aria-required={required}
					aria-label={label}
					spellCheck={false}
					required={required}
					value={isSelected && !inline ? sample : ''}
					onChange={() => {}}
					className="input"
					autoComplete={autoComplete}
					style={inputStyle}
					placeholder=" "
				/>
			);
	}
}
