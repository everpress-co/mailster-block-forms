/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { BlockPreview } from '@wordpress/block-editor';
import {
	TextControl,
	TextareaControl,
	Card,
	CardBody,
	CardFooter,
	Modal,
	__experimentalGrid as Grid,
} from '@wordpress/components';

import { useState, useEffect } from '@wordpress/element';
import { useSelect, select, dispatch, subscribe } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */

import InlineStyles from '../../util/InlineStyles';

const editor = select('core/editor');

const EmptyEditor = () => {
	if (editor.isEditedPostEmpty()) {
		return true;
	}

	if (
		editor
			.getEditedPostContent()
			.indexOf('<!-- /wp:mailster/form-wrapper -->') !== 0
	) {
		return false;
	}

	return true;
};

const ModalContent = ({ setOpen, patterns }) => {
	if (!patterns) {
		return <></>;
	}
	const setPattern = (pattern, block) => {
		if (!title) {
			setTitle(pattern.title);
		}
		dispatch('core/block-editor').resetBlocks(block);
		setOpen(false);
	};

	const [title, setTitle] = useEntityProp(
		'postType',
		'newsletter_form',
		'title'
	);

	return (
		<>
			<TextControl
				label={__('Form Name', 'mailster')}
				className="form-title"
				value={title}
				onChange={(value) => setTitle(value)}
				help={__('Define a name for your form.', 'mailster')}
				placeholder={__('Add title', 'mailster')}
			/>

			<Grid columns={3}>
				{patterns.map((pattern, i) => {
					const block = wp.blocks.parse(pattern.content);
					return (
						<Card
							key={i}
							onClick={() => setPattern(pattern, block)}
							className="form-pattern-card"
							style={{ displays: 'flex' }}
							isRounded={false}
							//isBorderless
							size="xSmall"
							title={pattern.description ?? pattern.title}
						>
							<CardBody size="small">
								<BlockPreview
									blocks={block}
									viewportWidth={pattern.viewportWidth}
								/>
							</CardBody>
							<CardFooter className="form-pattern-title">
								{pattern.title}
							</CardFooter>
						</Card>
					);
				})}
			</Grid>
			<InlineStyles />
		</>
	);
};

export default function FormModal(props) {
	const { meta, setMeta } = props;

	const [isOpen, setOpen] = useState(false);
	const [isEmpty, setEmpty] = useState(EmptyEditor());

	const openModal = () => setOpen(true);

	const closeModal = () => {
		if (isEmpty) {
			const insertedBlock = wp.blocks.createBlock(
				'mailster/form-wrapper',
				{},
				['field-email', 'gdpr', 'field-submit'].flatMap((field) => {
					if (false) {
						return [];
					}
					return wp.blocks.createBlock('mailster/' + field);
				})
			);
			//insert block
			dispatch('core/block-editor').resetBlocks([insertedBlock]);
		}
		setOpen(false);
	};

	subscribe(() => {
		const newRequireModal = EmptyEditor();
		if (newRequireModal !== isEmpty) {
			setEmpty(newRequireModal);
		}
	});

	// const { __experimentalGetAllowedPatterns, getSettings } =
	// 	select('core/block-editor');

	// const patterns = __experimentalGetAllowedPatterns();

	const patterns = useSelect((select) => {
		return select('core')
			.getBlockPatterns()
			.filter((pattern) =>
				pattern.categories?.includes('mailster-forms')
			);
	});

	useEffect(() => {
		setOpen(isEmpty);
	}, [isEmpty]);

	return (
		<>
			{isOpen && (
				<Modal
					title={__('Select a template to get started', 'mailster')}
					className="form-select-modal"
					isFullScreen
					onRequestClose={closeModal}
				>
					<ModalContent setOpen={setOpen} patterns={patterns} />
				</Modal>
			)}
		</>
	);
}
