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
	RichText,
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
	MediaReplaceFlow,
	ColorPaletteControl,
} from '@wordpress/block-editor';
import {
	Panel,
	PanelBody,
	PanelRow,
	CheckboxControl,
	RadioControl,
	TextControl,
	CardMedia,
	Card,
	CardHeader,
	CardBody,
	CardDivider,
	CardFooter,
	Button,
	Modal,
	Icon,
	RangeControl,
	FormTokenField,
	Flex,
	FlexItem,
	FlexBlock,
	BaseControl,
	SelectControl,
	Spinner,
	Notice,
	useCopyToClipboard,
	__experimentalNumberControl as NumberControl,
	__experimentalBoxControl as BoxControl,
	__experimentalFormGroup as FormGroup,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
} from '@wordpress/components';
import { Fragment, Component, useState, useEffect } from '@wordpress/element';

import { undo, chevronRight, chevronLeft, helpFilled } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import { useDebounce } from '@wordpress/compose';
import { useEntityProp } from '@wordpress/core-data';
import { select, useSelect, dispatch, subscribe } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DisplayOptions from './DisplayOptions';
import Triggers from './Triggers';
import Schedule from './Schedule';
import Appearance from './Appearance';

export default function PlacementSettings(props) {
	const {
		meta,
		setMeta,
		placement,
		setPlacements,
		useThemeStyle,
		setUseThemeStyle,
		options,
		setOptions,
	} = props;
	const { type, title } = placement;

	const currentPostId = useSelect(
		(select) => select('core/editor').getCurrentPostId(),
		[]
	);

	const triggers = options.triggers || [];

	function setTriggers(trigger, add) {
		var newTriggers = [...triggers];
		if (add) {
			newTriggers.push(trigger);
		} else {
			newTriggers = newTriggers.filter((el) => {
				return el != trigger;
			});
		}
		setOptions({ triggers: newTriggers });
	}

	const closeMethods = options.close || [];

	function setCloseMethods(method, add) {
		var newMethods = [...closeMethods];
		if (add) {
			newMethods.push(method);
		} else {
			newMethods = newMethods.filter((el) => {
				return el != method;
			});
		}
		setOptions({ close: newMethods });
	}

	const [isEnabled, setIsEnabled] = useState(meta.placements.includes(type));
	useEffect(() => {
		meta.placements && setIsEnabled(meta.placements.includes(type));
	}, [meta.placements]);

	return (
		<Panel>
			{'other' == type ? (
				<PanelRow>
					<ItemGroup
						className="widefat"
						isBordered={false}
						size="medium"
					>
						<Item>
							<h3>PHP</h3>
						</Item>
						<Item>
							<pre>
								<code id={'form-php-' + currentPostId}>
									{'<?php echo mailster_form( ' +
										currentPostId +
										' ); ?>'}
								</code>
							</pre>
						</Item>
						<Item>
							<code id="form-php-2">
								{'echo mailster_form( ' + currentPostId + ' );'}
							</code>
						</Item>
						<Item>
							<code id="form-php-3">
								{'<?php $form_html = mailster_form( ' +
									currentPostId +
									' ); ?>'}
							</code>
						</Item>
						<Item>
							<CheckboxControl
								label={__('useThemeStyle', 'mailster')}
								checked={useThemeStyle}
								onChange={(val) =>
									setUseThemeStyle(!useThemeStyle)
								}
							/>
						</Item>
					</ItemGroup>
				</PanelRow>
			) : (
				<>
					<PanelBody opened={true}>
						<PanelRow>
							<CheckboxControl
								label={sprintf(
									__('Enabled this form for %s.', 'mailster'),
									title
								)}
								value={type}
								checked={isEnabled}
								onChange={(val) => setPlacements(type, val)}
							/>
						</PanelRow>
					</PanelBody>

					{isEnabled && (
						<>
							<DisplayOptions {...props} />
							<Triggers {...props} />
							<Schedule {...props} />
							<Appearance {...props} />
						</>
					)}
				</>
			)}
		</Panel>
	);
}
