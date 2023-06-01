/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	ColorPaletteControl,
	PanelColorGradientSettings,
} from '@wordpress/block-editor';
import {
	Panel,
	PanelBody,
	PanelRow,
	CheckboxControl,
	TextControl,
	RangeControl,
	Button,
} from '@wordpress/components';

import { useState } from '@wordpress/element';
import { select, dispatch } from '@wordpress/data';

import { external } from '@wordpress/icons';

/**
 * Internal dependencies
 */

import { InputStylesPanel } from '../form-inspector/InputStylesPanel';
import Values from './Values';

export default function InputFieldInspectorControls(props) {
	const { attributes, setAttributes, isSelected, clientId } = props;
	const {
		label,
		errorMessage,
		inline,
		required,
		asterisk,
		native,
		name,
		type,
		selected,
		style,
		values,
		hasLabel,
	} = attributes;

	function setStyle(prop, data) {
		let newStyle = { ...style };
		if (data === undefined) {
			delete newStyle[prop];
		} else {
			newStyle[prop] = data;
		}
		setAttributes({
			style: Object.keys(newStyle).length ? newStyle : undefined,
		});
	}

	function applyStyle() {
		const root = select('core/block-editor').getBlocks();
		const { width, ...newStyle } = style;
		root.map((block) => {
			let style = {
				...select('core/block-editor').getBlockAttributes(block.clientId).style,
			};

			dispatch('core/block-editor').updateBlockAttributes(block.clientId, {
				style: { ...style, ...newStyle },
			});

			dispatch('core/block-editor').clearSelectedBlock(block.clientId);
			dispatch('core/block-editor').selectBlock(block.clientId);
		});

		dispatch('core/block-editor').updateBlockAttributes(clientId, {
			style: {
				width,
			},
		});
	}

	return (
		<>
			<InspectorControls group="styles">
				<Panel>
					<PanelBody
						title={__('Colors & Borders', 'mailster')}
						initialOpen={true}
					>
						<InputStylesPanel {...props}>
							{type !== 'submit' && (
								<PanelRow>
									<Button
										onClick={applyStyle}
										variant="primary"
										icon={external}
									>
										{__('Apply to all input fields', 'mailster')}
									</Button>
								</PanelRow>
							)}
						</InputStylesPanel>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<InspectorControls>
				<Panel>
					<PanelBody
						title={__('Field Settings', 'mailster')}
						initialOpen={true}
					>
						<PanelRow>
							<TextControl
								className="widefat"
								label={__('Label', 'mailster')}
								help={__('Define a label for your field', 'mailster')}
								value={label}
								onChange={(val) => setAttributes({ label: val })}
							/>
						</PanelRow>
						{typeof type !== 'undefined' &&
							hasLabel &&
							'checkbox' != type &&
							'radio' != type && (
								<PanelRow>
									<CheckboxControl
										label={__('Inline Labels', 'mailster')}
										help={__(
											'Place the label inside the input field to save some space.',
											'mailster'
										)}
										checked={inline}
										onChange={() => setAttributes({ inline: !inline })}
									/>
								</PanelRow>
							)}
						{typeof required !== 'undefined' && 'submit' != type && (
							<PanelRow>
								<CheckboxControl
									label={__('Required Field', 'mailster')}
									help={__(
										'Make this field mandatory so people cannot submit the form without entering data.',
										'mailster'
									)}
									checked={required || name == 'email'}
									disabled={name == 'email'}
									onChange={() => setAttributes({ required: !required })}
								/>
							</PanelRow>
						)}
						{required && (
							<PanelRow>
								<CheckboxControl
									label={__('Show asterisk', 'mailster')}
									help={__(
										'Enable an asterisk (*) after the label on required fields.',
										'mailster'
									)}
									checked={asterisk}
									onChange={() => setAttributes({ asterisk: !asterisk })}
								/>
							</PanelRow>
						)}
						{(type == 'email' || type == 'date') && (
							<PanelRow>
								<CheckboxControl
									label={__('Use native form element', 'mailster')}
									help={__(
										'Native form elements provide a better user experience but often miss some styling.',
										'mailster'
									)}
									checked={native}
									onChange={() => setAttributes({ native: !native })}
								/>
							</PanelRow>
						)}
						<PanelRow>
							<RangeControl
								className="widefat"
								label={__('Width', 'mailster')}
								value={style?.width}
								allowReset={true}
								initialPosition={100}
								__nextHasNoMarginBottom={true}
								onChange={(value) => setStyle('width', value)}
								help={__('Set the width of the input field.', 'mailster')}
								min={10}
								max={100}
							/>
						</PanelRow>
						{type == 'textarea' && (
							<PanelRow>
								<RangeControl
									className="widefat"
									label={__('Height', 'mailster')}
									value={style?.height}
									allowReset={true}
									initialPosition={20}
									__nextHasNoMarginBottom={true}
									onChange={(value) => setStyle('height', value)}
									help={__('Set the height of the textarea.', 'mailster')}
									min={1}
									max={20}
								/>
							</PanelRow>
						)}
						{type != 'submit' && (
							<PanelRow>
								<TextControl
									label={__('Error Message (optional)', 'mailster')}
									help={__(
										'Define the text for this field if an error occurs.',
										'mailster'
									)}
									value={errorMessage}
									onChange={(val) => setAttributes({ errorMessage: val })}
								/>
							</PanelRow>
						)}
						<Values {...props} />
					</PanelBody>
				</Panel>
			</InspectorControls>
		</>
	);
}
