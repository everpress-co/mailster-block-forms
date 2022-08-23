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
} from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';

import { useState, useEffect, useRef } from '@wordpress/element';
import { edit, update } from '@wordpress/icons';

/**
 * Internal dependencies
 */

import './editor.scss';

function MailsterFormSelector(props) {
	const { attributes, setAttributes, isSelected } = props;
	const { id } = attributes;

	const forms = useSelect((select) => {
		return select('core').getEntityRecords('postType', 'newsletter_form');
	});

	const isLoading = useSelect((select) => {
		return select('core/data').isResolving('core', 'getEntityRecords', [
			'postType',
			'newsletter_form',
		]);
	});

	if (isLoading) return <Spinner />;

	return (
		<>
			{forms && (
				<SelectControl
					value={id}
					onChange={(val) => setAttributes({ id: parseInt(val, 10) })}
				>
					<option value={0}>{__('Choose a form', 'mailster')}</option>
					{forms.map((form) => {
						return (
							<option key={form.id} value={form.id}>
								{form.title.rendered}
							</option>
						);
					})}
				</SelectControl>
			)}
		</>
	);
}

export default function Edit(props) {
	const { attributes, setAttributes, isSelected } = props;
	const { id = false, height = 200 } = attributes;

	const [displayForm, setDisplayForm] = useState(false);

	const blockRef = useRef();

	function EmptyPlaceholder({ children }) {
		return (
			<div
				style={{
					minHeight: height + 'px',
					zIndex: 10,
				}}
			>
				{(!children || !displayForm) && (
					<Flex
						justify="center"
						style={{
							minHeight: height + 'px',
							backgroundColor: '#fafafa44',
						}}
					>
						<Spinner />
					</Flex>
				)}
				{displayForm && children}
			</div>
		);
	}

	useEffect(() => {
		if (!blockRef.current) return;
		const observer = new MutationObserver((entries) => {
			entries.forEach((entry) => {
				if (
					entry.addedNodes.length > 0 &&
					height != entry.addedNodes[0].offsetHeight &&
					entry.addedNodes[0].classList.contains(
						'mailster-block-form-editor-wrap-inner'
					)
				) {
					setAttributes({
						height: entry.addedNodes[0].offsetHeight,
					});
				}
			});
		});

		observer.observe(blockRef.current, {
			childList: true,
		});
	}, [blockRef, id]);

	useEffect(() => {
		setDisplayForm(!!id);
	}, [id]);

	const reloadForm = () => {
		setDisplayForm(false);
		setTimeout(() => {
			setDisplayForm(true);
		}, 0);
	};

	const editForm = () => {
		window.open('post.php?post=' + id + '&action=edit', 'edit_form_' + id);
	};

	return (
		<>
			<div {...useBlockProps()}>
				{id ? (
					<div
						className="mailster-block-form-editor-wrap"
						ref={blockRef}
					>
						<Flex
							className="update-form-button"
							justify="space-evenly"
						>
							<strong className="align-center">
								{__(
									'Please click on the edit button in the toolbar to edit this form.',
									'mailster'
								)}
							</strong>
						</Flex>
						<ServerSideRender
							className="mailster-block-form-editor-wrap-inner"
							block="mailster/form"
							attributes={attributes}
							EmptyResponsePlaceholder={EmptyPlaceholder}
							LoadingResponsePlaceholder={EmptyPlaceholder}
						/>
					</div>
				) : (
					<Placeholder
						icon={email}
						label={__('Mailster Subscription Form', 'mailster')}
					>
						<MailsterFormSelector {...props} />
						<div className="placeholder-buttons-wrap">
							<Button
								variant="tertiary"
								href={'post-new.php?post_type=newsletter_form'}
								target={'edit_form_new'}
								text={__('create new form', 'mailster')}
							/>
							<Button
								variant="primary"
								icon={email}
								className="is-primary"
								onClick={reloadForm}
								text={__('Update Forms', 'mailster')}
							/>
						</div>
					</Placeholder>
				)}
			</div>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={__('Reload Form', 'mailster')}
						icon={update}
						onClick={reloadForm}
					/>
					<ToolbarButton
						label={__('Edit Form', 'mailster')}
						icon={edit}
						onClick={editForm}
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<Panel>
					<PanelBody
						title={__('Settings', 'mailster')}
						initialOpen={true}
					>
						<MailsterFormSelector {...props} />
					</PanelBody>
				</Panel>
			</InspectorControls>
		</>
	);
}
