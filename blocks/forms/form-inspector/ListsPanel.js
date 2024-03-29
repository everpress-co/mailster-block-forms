/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	Button,
	PanelRow,
	BaseControl,
	CheckboxControl,
	Flex,
	FlexItem,
	Spinner,
	Tip,
	TextControl,
} from '@wordpress/components';

import { chevronUp, chevronDown } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */

export default function ListsPanel(props) {
	const { meta, setMeta, attributes = {}, setAttributes } = props;
	const { userschoice, lists } = meta;
	const { showLabel = false, label = '' } = attributes;

	const allLists = useSelect((select) => select('mailster/form').getLists());

	function setList(id, add) {
		var newLists = [...lists];
		if (add) {
			newLists.push(id);
		} else {
			newLists = newLists.filter((el) => {
				return el != id;
			});
		}

		setMeta({ lists: newLists });
	}

	function move(i, delta) {
		var newLists = [...lists];
		var element = newLists[i];
		newLists.splice(i, 1);
		newLists.splice(i + delta, 0, element);
		setMeta({ lists: newLists });
	}

	const getList = (id) => {
		const list = allLists.filter((list) => {
			return list.ID == id;
		});
		return list.length ? list[0] : null;
	};

	const avLists = allLists
		? allLists.filter((list) => {
				return !lists.includes(list.ID);
		  })
		: [];

	const listItem = (list, i) => (
		<Flex key={i} style={{ flexShrink: 0 }}>
			<FlexItem>
				<CheckboxControl
					checked={true}
					value={list.ID}
					onChange={(checked) => {
						setList(list.ID, checked);
					}}
					label={list.name}
				/>
			</FlexItem>
			{lists.length > 1 && (
				<FlexItem>
					<Button
						disabled={!i}
						icon={chevronUp}
						isSmall={true}
						label={__('move up', 'mailster')}
						onClick={() => {
							move(i, -1);
						}}
					/>
					<Button
						disabled={i + 1 == lists.length}
						icon={chevronDown}
						isSmall={true}
						label={__('move down', 'mailster')}
						onClick={() => {
							move(i, 1);
						}}
					/>
				</FlexItem>
			)}
		</Flex>
	);

	return (
		<>
			<PanelRow>
				<CheckboxControl
					label={__('Users Choice', 'mailster')}
					checked={!!meta.userschoice}
					onChange={() => setMeta({ userschoice: !meta.userschoice })}
					help={__('Users decide which list they subscribe to', 'mailster')}
				/>
			</PanelRow>
			{!allLists && <Spinner />}
			{allLists && lists.length > 0 && (
				<PanelRow>
					<BaseControl
						id="mailster-values"
						className="widefat"
						label={
							userschoice
								? __('Users can subscribe to', 'mailster')
								: __('Subscribe new users to', 'mailster')
						}
					>
						<Flex
							className="mailster-value-options"
							justify="flex-end"
							id="mailster-values"
							style={{ flexWrap: 'wrap' }}
						>
							{lists.map((list_id, i) => {
								const list = getList(list_id);
								return list && listItem(list, i);
							})}
						</Flex>
					</BaseControl>
				</PanelRow>
			)}
			{avLists.length > 0 && (
				<PanelRow>
					<BaseControl
						id="mailster-values"
						className="widefat"
						label={__('Available Lists', 'mailster')}
					>
						<Flex
							className="mailster-value-options"
							justify="flex-end"
							id="mailster-values"
							style={{ flexWrap: 'wrap' }}
						>
							{avLists.map((list, i) => {
								return (
									<Flex key={i} style={{ flexShrink: 0 }}>
										<FlexItem>
											<CheckboxControl
												checked={lists.includes(list.ID)}
												value={list.ID}
												onChange={(checked) => {
													setList(list.ID, checked);
												}}
												label={list.name}
											/>
										</FlexItem>
									</Flex>
								);
							})}
						</Flex>
					</BaseControl>
				</PanelRow>
			)}
			{meta.userschoice && (
				<>
					<PanelRow>
						<CheckboxControl
							label={__('Show Label', 'mailster')}
							checked={showLabel}
							onChange={() => setAttributes({ showLabel: !showLabel })}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							className="widefat"
							value={label}
							onChange={(val) => setAttributes({ label: val })}
							help={__(
								'If the label is hidden it will be used for screen readers.',
								'mailster'
							)}
						/>
					</PanelRow>
				</>
			)}
			{meta.userschoice && lists.length > 0 && (
				<PanelRow>
					<Tip>
						{__(
							'You can update the list names and the precheck status in the editor.',
							'mailster'
						)}
					</Tip>
				</PanelRow>
			)}
		</>
	);
}
