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
	PanelRow,
	CheckboxControl,
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

import PostTokenFields from './PostTokenFields';

export default function PostTypeFields(props) {
	const { options, setOptions } = props;

	const postTypes = useSelect((select) => {
		const result = select('core').getEntityRecords('root', 'postType');
		return !result
			? []
			: result.filter((type) => {
					return (
						type.viewable &&
						!['attachment', 'mailster-form', 'mailster-workflow'].includes(
							type.slug
						)
					);
			  });
	});

	const alls = options.all || [];

	function setAll(all, add) {
		var newAlls = [...alls];
		if (add) {
			newAlls.push(all);
		} else {
			newAlls = newAlls.filter((el) => {
				return el != all;
			});
		}
		setOptions({ all: newAlls });
	}

	return (
		<>
			{postTypes.map((postType) => {
				return (
					<PanelRow key={postType.slug}>
						<ItemGroup isBordered={true} className="widefat" size="medium">
							<Item>
								<CheckboxControl
									label={__('Display on all ' + postType.name, 'mailster')}
									checked={alls.includes(postType.slug)}
									onChange={(val) => {
										setAll(postType.slug, val);
									}}
								/>
							</Item>

							{!alls.includes(postType.slug) && (
								<PostTokenFields
									options={options}
									setOptions={setOptions}
									postType={postType}
								/>
							)}
						</ItemGroup>
					</PanelRow>
				);
			})}
		</>
	);
}
