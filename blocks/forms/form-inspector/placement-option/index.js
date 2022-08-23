/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

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
	useCopyToClipboard,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';

import { Fragment, Component, useState, useEffect } from '@wordpress/element';

import { settings } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import { useDebounce } from '@wordpress/compose';
import { useEntityProp } from '@wordpress/core-data';
import { select, dispatch, subscribe } from '@wordpress/data';

/**
 * Internal dependencies
 */

export default function PlacementOption(props) {
	const { meta, setMeta, setOpen, placement, setPlacements } = props;
	const { type, image, title } = placement;

	const className = ['placement-option'];

	meta.placements.includes(type) && className.push('enabled');

	const enabled = 'other' == type || meta.placements.includes(type);

	return (
		<Card size="small" className={className.join(' ')}>
			<CardHeader>
				<Flex align="center">
					{'other' != type && (
						<CheckboxControl
							value={type}
							checked={enabled}
							onChange={(val) => {
								setPlacements(type, val);
							}}
						/>
					)}

					<Button
						variant="link"
						onClick={() => setOpen(type)}
						icon={<Icon icon={settings} />}
						isSmall={true}
					/>
				</Flex>
			</CardHeader>
			<CardMedia disabled={!enabled} onClick={() => setOpen(type)}>
				{image}
			</CardMedia>
			<CardFooter>{title}</CardFooter>
		</Card>
	);
}
