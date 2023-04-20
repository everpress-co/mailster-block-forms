/**
 * External dependencies
 */

const { kebabCase } = lodash;
import classnames from 'classnames';

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	useBlockProps,
	__experimentalUseBorderProps as useBorderProps,
	__experimentalUseColorProps as useColorProps,
	__experimentalGetSpacingClassesAndStyles as useSpacingProps,
} from '@wordpress/block-editor';

import { useSelect, select, useDispatch, dispatch } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */

import './editor.scss';

import { searchBlock, whenEditorIsReady } from '../../util';
import BlockRecovery from './BlockRecovery';
import InlineStyles from '../../util/InlineStyles';

import '../form-inspector';
import '../input';

const prefixCss = (css, className, type) => {
	if (!css) return css;

	var classLen = className.length,
		char,
		nextChar,
		isAt,
		isIn,
		rules = css;

	// removes comments
	rules = rules.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '');

	// makes sure nextChar will not target a space
	rules = rules.replace(/}(\s*)@/g, '}@');
	rules = rules.replace(/}(\s*)}/g, '}}');

	for (var i = 0; i < rules.length - 2; i++) {
		char = rules[i];
		nextChar = rules[i + 1];

		if (char === '@' && nextChar !== 'f') isAt = true;
		if (!isAt && char === '{') isIn = true;
		if (isIn && char === '}') isIn = false;

		if (
			!isIn &&
			nextChar !== '@' &&
			nextChar !== '}' &&
			(char === '}' || char === ',' || ((char === '{' || char === ';') && isAt))
		) {
			rules = rules.slice(0, i + 1) + className + ' ' + rules.slice(i + 1);
			i += classLen;
			isAt = false;
		}
	}

	// prefix the first select if it is not `@media` and if it is not yet prefixed
	if (rules.indexOf(className) !== 0 && rules.indexOf('@') !== 0) {
		rules = className + ' ' + rules;
	}

	//make sure the root element is not prefixed
	rules = rules.replaceAll(
		className + ' .mailster-block-form{',
		className + '.mailster-block-form{'
	);

	if ('tablet' == type) {
		rules = '@media only screen and (max-width: 800px) {' + rules + '}';
	} else if ('mobile' == type) {
		rules = '@media only screen and (max-width: 400px) {' + rules + '}';
	}

	return rules;
};

export default function Edit(props) {
	const { attributes, setAttributes, toggleSelection, isSelected, clientId } =
		props;
	const { css, style, background, inputs } = attributes;

	const [meta, setMeta] = useEntityProp('postType', 'newsletter_form', 'meta');

	const borderProps = useBorderProps(attributes);
	const colorProps = useColorProps(attributes);
	const spacingProps = useSpacingProps(attributes);

	const inEditor = searchBlock('mailster/form-wrapper');

	const formClasses = classnames(
		'mailster-block-form',
		'mailster-block-form-' + clientId,
		colorProps.className,
		borderProps.className,
		spacingProps.className
	);

	const formStyle = {
		...borderProps.style,
		...colorProps.style,
		...spacingProps.style,
		...{
			//color: attributes.color,
			//backgroundColor: attributes.backgroundColor,
			//fontSize: attributes.fontSize,
			borderRadius: attributes.borderRadius,
		},
	};

	const cleanedFormStyle = Object.fromEntries(
		Object.entries(formStyle).filter(([_, v]) => v != null)
	);

	const mediaPosition = ({ x, y }) => {
		return `${Math.round(x * 200) - 50}% ${Math.round(y * 100)}%`;
	};

	const backgroundStyles = useMemo(() => {
		let s = '';
		if (background.image) {
			s +=
				'.wp-block.wp-block.wp-block-mailster-form-wrapper.mailster-block-form-' +
				clientId +
				'::before{';
			s += "content:'';";
			s += 'background-image: url(' + background.image + ');';
			if (background.fixed) s += 'background-attachment:fixed;';
			if (background.repeat) s += 'background-repeat:repeat;';
			s +=
				'background-size:' +
				(isNaN(background.size) ? background.size : background.size + '%') +
				';';
			if (background.position)
				s += 'background-position:' + mediaPosition(background.position) + ';';
			s += 'opacity:' + background.opacity + '%;';
			if (attributes.borderRadius) {
				s += 'border-radius:' + attributes.borderRadius + ';';
			}
			s += '}';
		}
		return s;
	}, [background, attributes.borderRadius]);

	const inputStyle = useMemo(() => {
		let s = '';
		style &&
			Object.entries(style).map(([k, v]) => {
				if (!v) return;
				s +=
					// higher specificity
					'.wp-block.wp-block.wp-block-mailster-form-wrapper.mailster-block-form-' +
					clientId;

				switch (k) {
					case 'labelColor':
						s += ' .mailster-label{';
						s += 'color:' + v + ';';
						break;
					case 'inputColor':
						k = 'color';
					default:
						s += ' .input{';
						s += kebabCase(k) + ':' + v + ';';
				}

				s += '}';
			});
		return s;
	}, [style]);

	const prefixedCss = useMemo(() => {
		return Object.keys(css).map((name, b) => {
			return prefixCss(
				css[name],
				'.editor-styles-wrapper div.wp-block-mailster-form-wrapper.mailster-block-form-' +
					clientId,
				name
			);
		});
	}, [css]);

	// enter the root wrapper or replace it with a new one
	inEditor &&
		useEffect(() => {
			const all = select('core/block-editor').getBlocks(),
				count = all.length;

			if (count > 1) {
				console.warn('enter the root wrapper or replace it with a new one');
				const inserted = select('core/block-editor').getBlock(clientId);
				const current = all.find(
					(block) =>
						block.name == 'mailster/form-wrapper' && block.clientId != clientId
				);
				if (
					confirm(
						'This will replace your current form with the selected one. Continue?'
					)
				) {
					dispatch('core/block-editor').removeBlock(current.clientId);
				} else {
					dispatch('core/block-editor').removeBlock(inserted.clientId);
				}
			}
		}, []);

	inEditor &&
		whenEditorIsReady().then(() => {
			const messagesBlock = searchBlock('mailster/messages', clientId);

			if (!messagesBlock) {
				console.warn('Add message block');
				const block = wp.blocks.createBlock('mailster/messages');
				const referenceBlock = searchBlock(/^mailster\/field-/);
				const pos = referenceBlock
					? select('core/block-editor').getBlockIndex(
							referenceBlock.clientId,
							referenceBlock.rootClientId
					  )
					: 0;

				dispatch('core/block-editor').insertBlock(
					block,
					pos,
					referenceBlock.rootClientId,
					false
				);

				// clear any selected block
				dispatch('core/block-editor').clearSelectedBlock();
				// select "Form" in side panel
				dispatch('core/edit-post').openGeneralSidebar('edit-post/document');
			}
		});

	inEditor &&
		useEffect(() => {
			const block = searchBlock('mailster/gdpr', clientId);

			if (block && !meta.gdpr) {
				console.warn('Remove gdpr block');
				dispatch('core/block-editor').removeBlock(block.clientId);
				dispatch('core/edit-post').openGeneralSidebar('edit-post/document');
			} else if (!block && meta.gdpr) {
				console.warn('Add gdpr block');
				const block = wp.blocks.createBlock('mailster/gdpr');
				const referenceBlock = searchBlock('mailster/field-submit');

				const pos = referenceBlock
					? select('core/block-editor').getBlockIndex(
							referenceBlock.clientId,
							referenceBlock.rootClientId
					  )
					: all.length;

				dispatch('core/block-editor').insertBlock(
					block,
					pos,
					referenceBlock.rootClientId
				);
			}
		}, [meta.gdpr]);

	inEditor &&
		useEffect(() => {
			const block = searchBlock('mailster/lists', clientId);

			if (block && !meta.userschoice) {
				block.attributes.lock.remove = false;
				dispatch('core/block-editor').removeBlock(block.clientId);
				dispatch('core/edit-post').openGeneralSidebar('edit-post/document');
			} else if (!block && meta.userschoice) {
				console.warn('Add lists block');
				const block = wp.blocks.createBlock('mailster/lists');
				const referenceBlock = searchBlock('mailster/field-submit');
				const pos = referenceBlock
					? select('core/block-editor').getBlockIndex(
							referenceBlock.clientId,
							referenceBlock.rootClientId
					  )
					: all.length;

				dispatch('core/block-editor').insertBlock(
					block,
					pos,
					referenceBlock.rootClientId
				);
			}
		}, [meta.userschoice]);

	const [inlineStyles, setInlineStyles] = useEntityProp(
		'root',
		'site',
		'mailster_inline_styles'
	);

	return (
		<>
			<div
				{...useBlockProps({
					className: formClasses,
				})}
				hidden // overwritten via CSS
				style={cleanedFormStyle}
			>
				{window.mailster_inline_styles && !inlineStyles && (
					<style className="mailster-custom-styles">
						{window.mailster_inline_styles}
					</style>
				)}

				{inlineStyles && (
					<style className="mailster-custom-styles">{inlineStyles}</style>
				)}
				{prefixedCss && (
					<style className="mailster-prefixed-custom-styles">
						{prefixedCss}
					</style>
				)}
				{backgroundStyles && (
					<style className="mailster-bg-styles">{backgroundStyles}</style>
				)}
				{inputStyle && (
					<style className="mailster-inline-styles">{inputStyle}</style>
				)}
				<div className="mailster-block-form-inner">
					<InnerBlocks renderAppender={null} />
				</div>
			</div>
			<div
				className="mailster-editor-info"
				hidden // overwritten via CSS
			>
				{__(
					'Forms may look different in the editor. Please check the final result on your website.',
					'mailster'
				)}
			</div>
			{inEditor && (
				<div className="mailster-editor-inlinestyles" hidden>
					<InlineStyles />
				</div>
			)}
			<BlockRecovery {...props} />
		</>
	);
}
