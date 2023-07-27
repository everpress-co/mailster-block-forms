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
	Button,
} from '@wordpress/components';

import { useState, useEffect, useRef, useMemo } from '@wordpress/element';
import { useSelect, select, dispatch, subscribe } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */

import InlineStyles from '../../util/InlineStyles';
import { PluginPostStatusInfo } from '@wordpress/edit-post';

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

const FormTitle = ({ blockRef, title }) => {
	const [tempTitle, setTitle] = useState(title);

	return (
		<TextControl
			label={__('Form Name', 'mailster')}
			className="form-title"
			value={tempTitle}
			onChange={(value) => setTitle(value)}
			help={__('Define a name for your form.', 'mailster')}
			placeholder={__('Add title', 'mailster')}
			ref={blockRef}
		/>
	);
};

const ModalContent = (props) => {
	const { setOpen, patterns } = props;
	if (!patterns) {
		return <></>;
	}

	const [meta, setMeta] = useEntityProp('postType', 'mailster-form', 'meta');

	const blockRef = useRef(null);

	const [title, setTitle] = useEntityProp('postType', 'mailster-form', 'title');

	const onPatternSelect = (pattern, block) => {
		if (blockRef.current.value) {
			setTitle(blockRef.current.value);
		} else {
			setTitle(pattern.title);
		}
		block.attributes.isPreview = undefined;

		dispatch('core/block-editor').resetBlocks([block]);
		setOpen(false);
	};

	return (
		<>
			<FormTitle blockRef={blockRef} title={title} />

			<Grid columns={3}>
				{patterns.map((pattern, i) => {
					return (
						<FormPattern
							key={i}
							pattern={pattern}
							onPatternSelect={onPatternSelect}
							{...props}
						/>
					);
				})}
			</Grid>

			<InlineStyles />
		</>
	);
};

function FormPattern({ pattern, setOpen, onPatternSelect }) {
	const { content } = pattern;

	const [visible, setVisible] = useState(false);

	const ref = useRef(null);

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

	const block = useMemo(() => {
		let blocks = wp.blocks.parse(content).pop();
		blocks.attributes.isPreview = true;
		return blocks;
	}, [content]);

	return (
		<Card
			ref={ref}
			onClick={() => onPatternSelect(pattern, block)}
			className="form-pattern-card"
			isRounded={false}
			//isBorderless
			size="xSmall"
			title={pattern.description ?? pattern.title}
		>
			<CardBody size="large">
				{visible && (
					<BlockPreview
						blocks={[block]}
						viewportWidth={pattern.viewportWidth}
					/>
				)}
			</CardBody>
			<CardFooter className="form-pattern-title">{pattern.title}</CardFooter>
		</Card>
	);
}

export default function FormModal(props) {
	const { meta, setMeta } = props;

	const [isOpen, setOpen] = useState(false);
	//const [isEmpty, setEmpty] = useState(EmptyEditor());

	const openModal = () => setOpen(true);

	const { isCleanNewPost } = useSelect('core/editor');

	const closeModal = () => {
		if (isCleanNewPost()) {
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

	useEffect(() => {
		if (isCleanNewPost()) {
			setOpen(true);
		}
	}, []);

	// const { __experimentalGetAllowedPatterns, getSettings } =
	// 	select('core/block-editor');

	// const patterns = __experimentalGetAllowedPatterns();

	const { allPatterns } = useSelect(
		(select) => ({
			allPatterns: select('core').getBlockPatterns(),
		}),
		[]
	);

	const patterns = useMemo(
		() =>
			[...(allPatterns || [])].filter(({ categories }) =>
				categories?.includes('mailster-forms')
			),
		[allPatterns]
	);

	return (
		<>
			<PluginPostStatusInfo className="mailster-block-forms-post-status-info-select-template">
				<Button variant="secondary" className="widefat" onClick={openModal}>
					{__('Select Template', 'mailster')}
				</Button>
			</PluginPostStatusInfo>
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
