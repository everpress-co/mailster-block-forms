/**
 * External dependencies
 */

import Select from 'react-select';

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
} from '@wordpress/components';
import { Fragment, Component, useState, useEffect } from '@wordpress/element';

import { undo, chevronRight, chevronLeft, helpFilled } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import { useDebounce } from '@wordpress/compose';
import { useEntityProp } from '@wordpress/core-data';
import { select, useSelect, dispatch, subscribe } from '@wordpress/data';

import {
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
} from '@wordpress/components';

/**
 * Internal dependencies
 */

export default function PostTokenField(props) {
	const { postType, taxonomy = false, options, setOptions } = props;

	const [selectedTokens, setSelectedTokens] = useState([]);
	const [loading, setLoading] = useState(false);

	const storeKey = taxonomy ? 'taxonomies' : 'posts';
	const ids = options[storeKey] || [];

	const [currentPosts, setCurrentPosts] = useState([]);
	const [suggestions, setSuggestions] = useState([]);

	const title = !taxonomy
		? sprintf(__('Select %s…', 'mailster'), postType.name)
		: sprintf(__('Select %s…', 'mailster'), taxonomy.name);

	const help = !taxonomy
		? sprintf(__('Display on these %s', 'mailster'), postType.name)
		: sprintf(
				__('Display on these %s with these %s', 'mailster'),
				postType.name,
				taxonomy.name
		  );

	const entries =
		ids &&
		useSelect((select) => {
			return select('core').getEntityRecords(
				taxonomy ? 'taxonomy' : 'postType',
				taxonomy ? taxonomy.slug : postType.slug,
				{ include: ids }
			);
		});

	const isLoading = useSelect((select) => {
		return select('core/data').isResolving('core', 'getEntityRecords', [
			taxonomy ? 'taxonomy' : 'postType',
			taxonomy ? taxonomy.slug : postType.slug,
			{ include: ids },
		]);
	});

	useEffect(() => {
		entries && setSelectedTokens(mapResult(entries));
	}, [entries]);

	function mapResult(result) {
		if (!result) {
			return [];
		}

		return result
			.map((s, i) => {
				return {
					value: s.id,
					label: s.name || s.title.rendered,
				};
			})
			.sort((a, b) => {
				return a.value - b.value;
			});
	}

	function searchTokens(token) {
		const endpoint =
			'wp/v2/' + (taxonomy ? taxonomy.rest_base : postType.rest_base);
		token &&
			apiFetch({
				path:
					endpoint +
					'?search=' +
					token +
					'&type=' +
					postType.rest_base,
			}).then(
				(result) => {
					setLoading(false);
					setSuggestions(mapResult(result));
				},
				(error) => {}
			) &&
			setLoading(true);
	}
	const searchTokensDebounce = useDebounce(searchTokens, 500);

	function setTokens(tokens) {
		let newTokens = tokens.map((token) => {
				return token.value;
			}),
			oldTokens = selectedTokens.map((token) => {
				return token.value;
			}),
			newPlacement = { ...options },
			difference,
			intersection;

		//token added
		if (newTokens.length > oldTokens.length) {
			difference = newTokens.filter((x) => !oldTokens.includes(x));
			intersection = [...ids, ...difference];

			//token removed
		} else {
			difference = oldTokens.filter((x) => !newTokens.includes(x));
			intersection = ids.filter((x) => !difference.includes(x));
		}
		newPlacement[storeKey] = intersection;

		if (intersection.length) {
			newPlacement['all'] = [];
		}

		setSelectedTokens(tokens);
		setOptions(newPlacement);
	}

	return (
		<Item>
			<BaseControl label={help}>
				<Select
					options={suggestions}
					value={selectedTokens}
					placeholder={isLoading ? 'Loading' : title}
					onInputChange={(tokens) => searchTokensDebounce(tokens)}
					onChange={(tokens) => setTokens(tokens)}
					isMulti
					isLoading={loading}
				/>
			</BaseControl>
		</Item>
	);
}
