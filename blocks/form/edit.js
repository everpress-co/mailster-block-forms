/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

import {
	useBlockProps,
	InspectorControls,
	BlockControls,
} from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import {
	Panel,
	PanelBody,
	Placeholder,
	Spinner,
	Flex,
	ToolbarGroup,
	ToolbarButton,
	email,
	Button,
	SelectControl,
	PanelRow,
	TextControl,
	FlexItem,
	FlexBlock,
} from '@wordpress/components';
import { useSelect, select, dispatch } from '@wordpress/data';
import { useDebounce } from '@wordpress/compose';

import { useState, useEffect, useRef } from '@wordpress/element';
import { edit, plus, update } from '@wordpress/icons';

/**
 * Internal dependencies
 */

import './editor.scss';
import HomepageInspectorControls from '../homepage/inspector';
import { searchBlock, searchBlocks } from '../util';
import { TABS } from '../homepage/constants';
import InlineStyles from '../util/InlineStyles';

function MailsterFormSelector(props) {
	const { attributes, setAttributes, isSelected, selectForm, formId } = props;

	const forms = useSelect((select) => {
		return select('core').getEntityRecords('postType', 'mailster-form');
	});

	const isLoading = useSelect((select) => {
		return select('core/data').isResolving('core', 'getEntityRecords', [
			'postType',
			'mailster-form',
		]);
	});

	if (isLoading)
		return (
			<p>
				<Spinner />
			</p>
		);

	if (forms && forms.length === 0) {
		return (
			<p>
				{__(
					'You currently have no forms. Please create a new form.',
					'mailster'
				)}
			</p>
		);
	}

	return (
		forms && (
			<SelectControl
				value={formId}
				onChange={(val) => selectForm(parseInt(val, 10))}
			>
				<option value="">{__('Choose an existing form', 'mailster')}</option>
				{forms.map((form) => (
					<option key={form.id} value={form.id}>
						{form.title.rendered}
					</option>
				))}
			</SelectControl>
		)
	);
}

export default function Edit(props) {
	const { attributes, isSelected, setAttributes, context, clientId } = props;
	const { id = false } = attributes;

	const [contextType, setContextType] = useState(
		context['mailster-homepage-context/type']
	);

	const contextAlign = context['mailster-homepage-context/align'];
	const contextId = context['mailster-homepage-context/' + contextType];
	const formId = contextId || id;

	const [displayForm, setDisplayForm] = useState(false);
	const [displayHeight, setDisplayHeight] = useState(undefined);

	const blockRef = useRef();

	useEffect(() => {
		setAttributes({ align: contextAlign });
	}, [contextAlign]);

	const selectForm = (id) => {
		// if we are in context of the homepage block
		if (contextType) {
			const homepage = searchBlock('mailster/homepage');

			dispatch('core/block-editor').updateBlockAttributes(homepage.clientId, {
				[contextType]: id,
			});
		} else {
			setAttributes({ id: id });
		}
	};

	//set height of the block
	useEffect(() => {
		if (!blockRef.current) return;
		const observer = new MutationObserver((entries) => {
			entries.forEach((entry) => {
				const node = entry.addedNodes.length > 0 ? entry.addedNodes[0] : null;
				if (
					node &&
					displayHeight != node.offsetHeight &&
					node.classList.contains('mailster-block-form-editor-wrap-inner')
				) {
					node.offsetHeight && setDisplayHeight(node.offsetHeight);
				}
			});
		});
		observer.observe(blockRef.current, {
			childList: true,
		});

		return () => observer.disconnect();
	}, [blockRef.current]);

	useEffect(() => {
		setDisplayForm(!!id);
	}, [id]);

	const EmptyPlaceholder = ({ children }) => (
		<div
			style={{
				minHeight: displayHeight ? displayHeight + 'px' : undefined,
				zIndex: 10,
			}}
		>
			{(!children || !displayForm) && (
				<Flex justify="center">
					<Spinner />
				</Flex>
			)}
			{displayForm && children}
		</div>
	);
	const reloadForm = () => {
		setDisplayForm(false);
		dispatch('core').receiveEntityRecords(
			'postType',
			'mailster-form',
			[],
			{},
			true
		);
		setTimeout(() => {
			setDisplayForm(true);
		}, 1);
	};

	const onSelect = (type, index) => {
		location.hash = '#mailster-' + type;
		setContextType(type);

		//select current block
		//const formBlocks = searchBlocks('mailster/form');
		//select the active block
		//dispatch('core/block-editor').selectBlock(formBlocks[index].clientId);
	};

	const editForm = () => {
		window.open(
			'post.php?post=' + formId + '&action=edit',
			'edit_form_' + formId
		);
	};

	const currentTab = TABS.find((tab) => tab.id === contextType);

	const getPlaceholderLabel = () => {
		if (contextType) {
			return sprintf(
				__('Newsletter Homepage: %s', 'mailster'),
				currentTab.name
			);
		}

		return __('Mailster Subscription Form', 'mailster');
	};
	const getPlaceholderInstructions = () => {
		if (contextType) {
			return currentTab.help;
		}

		return __('Select a form you like to display on this page.', 'mailster');
	};

	const blockProps = useBlockProps({
		style: { minHeight: displayHeight ? displayHeight + 'px' : undefined },
	});

	const ServerSideRenderAttributes = {
		...attributes,
		...{
			type: contextType,
			id: formId,
		},
	};

	return (
		<>
			<div {...blockProps}>
				{formId ? (
					<div className="mailster-block-form-editor-wrap" ref={blockRef}>
						<Flex className="update-form-button" justify="center">
							<Button
								variant="primary"
								icon={edit}
								onClick={editForm}
								text={__('Edit form', 'mailster')}
							/>
							<Button
								variant="secondary"
								icon={update}
								onClick={reloadForm}
								text={__('Reload Form', 'mailster')}
							/>
						</Flex>
						<ServerSideRender
							className="mailster-block-form-editor-wrap-inner"
							block="mailster/form"
							attributes={ServerSideRenderAttributes}
							EmptyResponsePlaceholder={EmptyPlaceholder}
							XLoadingResponsePlaceholder={EmptyPlaceholder}
						/>
					</div>
				) : (
					<Placeholder
						icon={email}
						label={getPlaceholderLabel()}
						instructions={getPlaceholderInstructions()}
					>
						<MailsterFormSelector
							{...props}
							selectForm={selectForm}
							formId={formId}
						/>
						<div className="placeholder-buttons-wrap">
							<Button
								variant="secondary"
								icon={plus}
								href={'post-new.php?post_type=mailster-form'}
								target={'edit_form_new'}
								text={__('Create new form', 'mailster')}
							/>
							<Button
								variant="tertiary"
								icon={update}
								onClick={reloadForm}
								text={__('Reload Forms', 'mailster')}
							/>
						</div>
					</Placeholder>
				)}
			</div>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={__('Edit Form', 'mailster')}
						icon={edit}
						disabled={!formId}
						onClick={editForm}
					/>
					<ToolbarButton
						label={__('Reload Form', 'mailster')}
						icon={update}
						onClick={reloadForm}
					/>
				</ToolbarGroup>
			</BlockControls>
			{contextType && (
				<HomepageInspectorControls current={contextType} onSelect={onSelect} />
			)}
			{contextType !== 'subscribe' && (
				<InspectorControls>
					<Panel>
						<PanelBody
							title={__('Form Selector', 'mailster')}
							initialOpen={true}
						>
							<MailsterFormSelector
								{...props}
								selectForm={selectForm}
								formId={formId}
							/>
						</PanelBody>
					</Panel>
				</InspectorControls>
			)}
			<InlineStyles />
		</>
	);
}
