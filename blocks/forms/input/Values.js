/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __, sprintf } from '@wordpress/i18n';

import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
	RichText,
	PlainText,
} from '@wordpress/block-editor';
import {
	Panel,
	PanelBody,
	PanelRow,
	CheckboxControl,
	TextControl,
	RadioControl,
	SelectControl,
	RangeControl,
	ColorPalette,
	MenuGroup,
	MenuItem,
	Draggable,
	IconButton,
	Flex,
	FlexItem,
	FlexBlock,
	Button,
	BaseControl,
} from '@wordpress/components';

import { Fragment, Component, useState } from '@wordpress/element';
import { select, dispatch } from '@wordpress/data';

import {
	Icon,
	chevronUp,
	chevronDown,
	trash,
	external,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */

export default function Values(props) {
	const { attributes, setAttributes, isSelected, clientId } = props;
	const { values, selected, type } = attributes;

	const hasValues = ['radio', 'dropdown'].includes(type);

	if (!hasValues) return null;

	function updateValue(i, val) {
		var newValues = [...values];
		newValues[i] = val;
		setAttributes({ values: newValues });
	}
	function moveValue(i, delta) {
		var newValues = [...values];
		var element = newValues[i];
		newValues.splice(i, 1);
		newValues.splice(i + delta, 0, element);
		setAttributes({ values: newValues });
	}
	function removeValue(i) {
		var newValues = [...values];
		newValues.splice(i, 1);
		setAttributes({ values: newValues });
	}
	function addValue() {
		var newValues = [...values];
		newValues.push(sprintf(__('Value #%d', 'mailster'), values.length + 1));
		setAttributes({ values: newValues });
	}

	return (
		<PanelRow>
			<BaseControl
				id="mailster-values"
				label={__('Values', 'mailster')}
				help={__('Define options for this input field', 'mailster')}
			>
				<Flex
					className="mailster-value-options"
					justify="flex-end"
					id="mailster-values"
					style={{ flexWrap: 'wrap' }}
				>
					{values.map((value, i) => {
						return (
							<Flex key={i} style={{ flexShrink: 0 }}>
								<FlexItem>
									<RadioControl
										selected={selected}
										title={__('set as default', 'mailster')}
										options={[{ value: value }]}
										onChange={() => {
											setAttributes({ selected: value });
										}}
									/>
								</FlexItem>
								<FlexBlock>
									<TextControl
										autoFocus
										value={value}
										onChange={(val) => {
											updateValue(i, val);
										}}
									/>
								</FlexBlock>
								<FlexItem>
									<Button
										disabled={!i}
										icon={chevronUp}
										isSmall={true}
										label={__('move up', 'mailster')}
										onClick={(val) => {
											moveValue(i, -1);
										}}
									/>
									<Button
										disabled={i + 1 == values.length}
										icon={chevronDown}
										isSmall={true}
										label={__('move down', 'mailster')}
										onClick={(val) => {
											moveValue(i, 1);
										}}
									/>
									<Button
										icon={trash}
										isSmall={true}
										label={__('Trash', 'mailster')}
										onClick={(val) => {
											removeValue(i);
										}}
									/>
								</FlexItem>
							</Flex>
						);
					})}
					<Button
						variant="primary"
						onClick={addValue}
						style={{ marginTop: '1em' }}
					>
						{__('Add new Value', 'mailster')}
					</Button>
				</Flex>
			</BaseControl>
		</PanelRow>
	);
}
