/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { useState } from '@wordpress/element';
import { dispatch, useSelect } from '@wordpress/data';

import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */

const SAMPLEFORM = (
	<form className="mailster-block-form">
		<label className="mailster-label">This is my Label</label>
		<select className="input">
			<option>This is a select</option>
		</select>
		<input type="checkbox" />
		<input type="radio" />
		<input type="text" className="input" />
		<input type="email" className="input" />
		<input type="date" className="input" />
		<input type="submit" className="wp-block-button__link" />
	</form>
);

const convertRestArgsIntoStylesArr = ([...args]) => {
	return args.slice(1);
};
const getStyles = function () {
	const args = [...arguments];
	const [element] = args;
	let s = '';

	if (!element) return s;

	const stylesProps =
		[...args][1] instanceof Array
			? args[1]
			: convertRestArgsIntoStylesArr(args);

	const styles = window.getComputedStyle(element);
	stylesProps.reduce((acc, v) => {
		const x = styles.getPropertyValue(v);
		if (x) s += v + ': ' + x + ';';
	}, {});

	return s;
};
const getInlineStyles = () => {
	const iframe = document.getElementById('inlineStylesIframe');

	if (!iframe) return;

	const doc = iframe.contentWindow.document,
		//get a couple of possible DOM elements
		el =
			doc.getElementsByClassName('entry-content')[0] ||
			doc.getElementById('page') ||
			doc.getElementById('site-content') ||
			doc.getElementById('content') ||
			doc.getElementsByClassName('wp-site-blocks')[0] ||
			doc.getElementsByTagName('body')[0],
		properties = [
			'padding',
			'border',
			'font',
			'border-radius',
			'background',
			'box-shadow',
			'line-height',
			'appearance',
			'outline',
			'text-transform',
			'letter-spacing',
		],
		selectors = {
			'input[type="text"]': [],
			'input[type="email"]': [],
			'input[type="date"]': [],
			'input[type="checkbox"]': ['width', 'height'],
			'input[type="radio"]': ['width', 'height'],
			'input[type="submit"]': ['border', 'outline', 'color'],
			select: [],
			'label.mailster-label': [],
		};

	wp.element.render(SAMPLEFORM, el);

	return Object.keys(selectors)
		.map((selector, i) => {
			const style = getStyles(
				doc.querySelector('.mailster-block-form ' + selector),
				[...properties, ...selectors[selector]]
			);
			return '.mailster-block-form ' + selector + '{' + style + '}';
		})
		.join('');
};

export default function InlineStyles(props) {
	const { meta, setMeta } = props;

	const can = useSelect((select) =>
		select('core').canUser('update', 'settings')
	);

	const [inlineStyles, setInlineStyles] = useEntityProp(
		'root',
		'site',
		'mailster_inline_styles'
	);

	const [render, setRender] = useState(true);

	const posts = useSelect((select) => {
		return select('core').getEntityRecords('postType', 'post', {
			per_page: 1,
		});
	});

	const [siteUrl] = useEntityProp('root', 'site', 'url');

	const [title, setTitle] = useEntityProp('root', 'site', 'title');

	if (!can || !posts || !siteUrl) {
		return null;
	}

	const link = posts.length > 0 ? posts[0].link : siteUrl;

	const updateStyles = () => {
		const styles = getInlineStyles();
		if (styles != inlineStyles) {
			setInlineStyles(styles);
			dispatch('core').saveEditedEntityRecord('root', 'site');
			dispatch('core/notices').createNotice(
				'success',
				__('Input field styles have been updated.', 'mailster'),
				{
					type: 'snackbar',
					isDismissible: true,
				}
			);
		}
		setRender(false);
	};

	if (!render) {
		return null;
	}

	return (
		<iframe
			src={link}
			id="inlineStylesIframe"
			style={{
				pointerEvents: 'none',
				width: screen.width,
				zIndex: -1,
				position: 'absolute',
				visibility: 'hidden',
			}}
			onLoad={updateStyles}
		></iframe>
	);
}
