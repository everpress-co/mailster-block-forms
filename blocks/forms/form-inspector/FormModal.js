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

import { useState, useEffect, useRef } from '@wordpress/element';
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

const ModalContent = (props) => {
	const { setOpen, patterns } = props;
	if (!patterns) {
		return <></>;
	}

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
					return <FormPattern key={i} pattern={pattern} {...props} />;
				})}
			</Grid>
			<InlineStyles />
		</>
	);
};

function FormPattern({ pattern, setOpen }) {
	const { content } = pattern;
	const block = wp.blocks.parse(content);

	const [title, setTitle] = useEntityProp(
		'postType',
		'newsletter_form',
		'title'
	);

	const attributes = block[0].attributes;

	const { background } = attributes;

	const setPattern = (pattern, block) => {
		if (!title) {
			setTitle(pattern.title);
		}
		dispatch('core/block-editor').resetBlocks(block);
		setOpen(false);
	};

	const ref = useRef(null);

	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setVisible(true);
					observer.unobserve(ref.current);
				}
			},
			{ threshold: [0] }
		);
		observer.observe(ref.current);
	}, [ref.current]);

	return (
		<Card
			ref={ref}
			onClick={() => setPattern(pattern, block)}
			className="form-pattern-card"
			style={{ displays: 'flex' }}
			isRounded={false}
			//isBorderless
			size="xSmall"
			title={pattern.description ?? pattern.title}
		>
			<CardBody size="large">
				{visible && (
					<BlockPreview blocks={block} viewportWidth={pattern.viewportWidth} />
				)}
			</CardBody>
			<CardFooter className="form-pattern-title">{pattern.title}</CardFooter>
		</Card>
	);
}

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
			.filter((pattern) => pattern.categories?.includes('mailster-forms'));
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
