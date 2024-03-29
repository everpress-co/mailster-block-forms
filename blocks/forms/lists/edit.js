/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';

import { useEffect } from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';
import { useSelect, select } from '@wordpress/data';

/**
 * Internal dependencies
 */

import InputFieldInspectorControls from './inspector.js';
import InputBlockControls from './InputBlockControls';

export default function Edit(props) {
	const { attributes, setAttributes, isSelected, clientId } = props;
	const { lists, vertical, showLabel, label } = attributes;
	const className = ['mailster-wrapper mailster-wrapper-_lists'];

	const [meta, setMeta] = useEntityProp('postType', 'mailster-form', 'meta');

	if (vertical) className.push('mailster-wrapper-is-vertical');
	if (showLabel) className.push('mailster-show-label');

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});

	const allLists = useSelect(
		(select) => select('mailster/form').getLists(),
		[]
	);

	const updateLists = (newLists, force) => {
		if (force || JSON.stringify(lists) !== JSON.stringify(newLists))
			setAttributes({ lists: newLists });
	};

	useEffect(() => {
		if (!meta.lists || !allLists) return;

		var newLists = meta.lists.map((list_id) => {
			return {
				id: list_id.toString(),
				name: getFromListId(list_id).name,
				checked: !!getFromListId(list_id).checked,
			};
		});

		updateLists(newLists);
	}, [meta.lists]);

	useEffect(() => {
		if (!attributes.id)
			setAttributes({ id: 'mailster-id-' + clientId.substring(30) });
	});

	const getFromListId = (list_id) => {
		const labelList = lists.find((list) => {
			return list.id == list_id;
		});
		if (labelList) {
			return labelList;
		}
		const list = allLists.find((list) => {
			return list.ID == list_id;
		});

		return list;
	};

	const setLabel = (label, i) => {
		var newLists = [...lists];
		newLists[i].name = label;
		updateLists(newLists, true);
	};

	const setChecked = (isChecked, i) => {
		var newLists = [...lists];
		newLists[i].checked = isChecked;
		updateLists(newLists, true);
	};

	return (
		<div {...blockProps}>
			<fieldset>
				<RichText
					tagName="legend"
					value={label || __('Lists', 'mailster')}
					onChange={(val) => setAttributes({ label: val })}
					placeholder={__('Enter Label', 'mailster')}
				/>
				{lists.map((list, i) => {
					return (
						<div key={i} className="mailster-group mailster-group-checkbox">
							<input
								type="checkbox"
								value={list.id}
								checked={list.checked || false}
								aria-label={list.name}
								onChange={() => setChecked(!list.checked, i)}
							/>
							<RichText
								tagName="label"
								value={list.name}
								onChange={(val) => setLabel(val, i)}
								allowedFormats={[]}
								className="mailster-label"
								placeholder={__('Enter Label', 'mailster')}
							/>
						</div>
					);
				})}
				{!lists.length && (
					<i>
						{__(
							'Please select at least one list or disable user choice.',
							'mailster'
						)}
					</i>
				)}
			</fieldset>
			<InputBlockControls {...props} />
			<InputFieldInspectorControls
				meta={meta}
				setMeta={setMeta}
				attributes={attributes}
				setAttributes={setAttributes}
			/>
		</div>
	);
}
