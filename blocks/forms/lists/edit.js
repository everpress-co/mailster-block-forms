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
	const { lists, dropdown, vertical } = attributes;
	const className = ['mailster-wrapper mailster-wrapper-_lists'];

	const [meta, setMeta] = useEntityProp('postType', 'newsletter_form', 'meta');

	if (vertical) className.push('mailster-wrapper-is-vertical');

	const blockProps = useBlockProps({
		className: classnames({}, className),
	});

	const allLists = useSelect(
		(select) => select('mailster/form').getLists(),
		[]
	);
	useEffect(() => {
		return () => {
			setMeta({ userschoice: false });
		};
	}, []);

	useEffect(() => {
		if (!meta.lists || !allLists) return;

		var newLists = meta.lists.map((list_id) => {
			return {
				id: list_id.toString(),
				name: getFromListId(list_id).name,
				checked: !!getFromListId(list_id).checked,
			};
		});

		setAttributes({ lists: newLists });
	}, [meta.lists, allLists]);

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
		setAttributes({ lists: newLists });
	};

	const setChecked = (label, i) => {
		var newLists = [...lists];
		newLists[i].checked = label;
		setAttributes({ lists: newLists });
	};

	return (
		<div {...blockProps}>
			{dropdown ? (
				<select className="input">
					{lists.map((list, i) => {
						return (
							<option key={i} value={list.ID}>
								{list.name}
							</option>
						);
					})}
				</select>
			) : (
				<fieldset>
					<legend>{__('Lists', 'mailster')}</legend>
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
			)}

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
