/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { registerBlockType, createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */

import edit from './edit';
import save from './save';
import Icons from './Icons';

window.mailster_fields &&
	window.mailster_fields.map((field) => {
		let label = {
			type: 'string',
			default: field.name,
			source: 'html',
			selector: '.mailster-label',
		};

		let description = field.name + ' Description';

		switch (field.id) {
			case 'submit':
				label = {
					...label,
					...{
						source: 'attribute',
						selector: 'input',
						attribute: 'value',
					},
				};
				break;
		}

		registerBlockType('mailster/field-' + field.id, {
			apiVersion: 2,
			title: field.name || field.id,
			keywords: ['mailster', field.name, field.id],
			category: 'mailster-form-fields',
			description: description,
			parent: ['mailster/form-wrapper', 'core/column', 'core/group'],
			transforms: {
				to: window.mailster_fields.map((tofields) => {
					return {
						type: 'block',
						blocks: ['mailster/field-' + tofields.id],
						transform: (attributes, innerBlocks) => {
							return createBlock(
								'mailster/field-' + tofields.id,
								{
									id: attributes.id,
									inline: attributes.inline,
									style: attributes.style,
									align: attributes.align,
									labelAlign: attributes.labelAlign,
									values: attributes.values,
								},
								innerBlocks
							);
						},
					};
				}),
			},
			supports: {
				html: false,
				multiple: false,
				fontSize: true,
				spacing: {
					margin: true,
					padding: true,
				},
				typography: {
					fontSize: true,
					lineHeight: true,
					__experimentalFontStyle: true,
					__experimentalFontWeight: true,
					__experimentalLetterSpacing: true,
					__experimentalTextTransform: true,
				},
				__experimentalFontFamily: true,
			},
			icon: {
				src: Icons[field.id] || Icons.default,
			},
			attributes: {
				label: label,
				hasLabel: {
					type: 'boolean',
					default: !['checkbox', 'submit'].includes(field.type),
				},
				vertical: {
					type: 'boolean',
				},
				name: {
					type: 'string',
					default: field.id,
				},
				align: {
					type: 'string',
				},
				justify: {
					type: 'string',
				},
				labelAlign: {
					type: 'string',
				},
				id: {
					type: 'string',
				},
				required: {
					type: 'boolean',
					default: field.id == 'email',
					source: 'attribute',
					selector: '.input',
					attribute: 'required',
				},
				errorMessage: {
					type: 'string',
					source: 'attribute',
					selector: 'div',
					attribute: 'data-error-message',
				},
				asterisk: {
					type: 'boolean',
					default: true,
				},
				inline: {
					type: 'boolean',
					default: false,
				},
				type: {
					type: 'string',
					default: field.type,
				},
				values: {
					type: 'array',
					default: field.values,
				},
				selected: {
					type: 'string',
					default: field.default || null,
				},
				native: {
					type: 'boolean',
					default: field.type != 'textfield',
				},
				style: {
					type: 'object',
					default: {
						width: undefined,
						inputColor: undefined,
						backgroundColor: undefined,
						labelColor: undefined,
						borderColor: undefined,
						borderWidth: undefined,
						borderStyle: undefined,
						borderRadius: undefined,
						fontSize: undefined,
					},
				},
			},
			edit,
			save,
		});
	});
