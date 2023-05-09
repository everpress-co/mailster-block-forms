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
	TextareaControl,
	CheckboxControl,
	Spinner,
	SelectControl,
	TabPanel,
	Modal,
} from '@wordpress/components';

import { useDebounce } from '@wordpress/compose';

import { useState, useEffect, useMemo } from '@wordpress/element';

import { external } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */

const BASIC_STYLING = `/*some basic CSS for input fields*/
input, select {
    border: 1px solid;
    border-radius: 3px;
    padding: .6em;
	font: inherit;
}
.submit-button{
    border: initial;
    padding: .6em;
}`;

const CSS_TAB_NAMES = {
	general: __('General', 'mailster'),
	tablet: __('Tablet', 'mailster'),
	mobile: __('Mobile', 'mailster'),
	basic: __('Basic', 'mailster'),
};

//some themes which should come with basic css enabled
const BASIC_CSS_THEMES = ['twentytwentythree', 'twentytwentytwo', 'wabi'];

function getSelectors() {
	const custom = window.mailster_fields.filter((el) => el.id != 'submit');
	return [
		{
			label: __('General', 'mailster'),
			items: [
				{
					selector: '.mailster-block-form',
					title: __('Form selector', 'mailster'),
				},
				{
					selector: '.mailster-wrapper',
					title: __('Field wrapper', 'mailster'),
				},
				{
					selector: '.mailster-wrapper .input',
					title: __('Input fields', 'mailster'),
				},
				{
					selector: '.mailster-wrapper label.mailster-label',
					title: __('Labels', 'mailster'),
				},
				{
					selector: '.wp-block-mailster-form-outside-wrapper',
					title: __('Outside Wrapper', 'mailster'),
				},
			],
		},
		{
			label: __('Custom Field Wrapper divs', 'mailster'),
			items: custom.map((el) => {
				return {
					selector: '.wp-block-mailster-field-' + el.id,
					title: el.name,
				};
			}),
		},
		{
			label: __('Custom Field Inputs', 'mailster'),
			items: custom.map((el) => {
				return {
					selector: '.wp-block-mailster-field-' + el.id + ' .input',
					title: el.name,
				};
			}),
		},
		{
			label: __('Other', 'mailster'),
			items: [
				{
					selector: '.mailster-wrapper-required label.mailster-label::after',
					title: __('Required Asterisk', 'mailster'),
				},
				{
					selector: '.mailster-wrapper .submit-button',
					title: __('Submit Button', 'mailster'),
				},
				{
					selector: '.mailster-block-form-close',
					title: __('Close Button', 'mailster'),
				},
			],
		},
	];
}

const Wrapper = ({ children, isCSSModal, setCSSModal }) => {
	return isCSSModal ? (
		<Modal
			title={__('Enter your custom CSS', 'mailster')}
			className="css-modal"
			onRequestClose={() => setCSSModal(false)}
			style={{
				width: '80vw',
				marginBottom: '5%',
			}}
		>
			{children}
		</Modal>
	) : (
		children
	);
};

export function CssPanel(props) {
	const { attributes = {}, setAttributes, children } = props;

	const { css = {}, basiccss } = attributes;

	const theme = useSelect((select) => select('core').getCurrentTheme());

	useEffect(() => {
		var newCss = { ...css };
		if (basiccss) {
			newCss['basic'] = newCss['basic'] ?? BASIC_STYLING;
		} else {
			delete newCss['basic'];
		}
		setAttributes({ css: newCss });
	}, [basiccss]);

	useEffect(() => {
		if (!theme) return;
		// if basiccss is undefined and theme is one of the BASIC_CSS_THEMES
		if (basiccss == undefined && BASIC_CSS_THEMES.includes(theme.stylesheet)) {
			setAttributes({ basiccss: true });
		}
	}, [theme]);

	const selectors = useMemo(() => {
		return getSelectors();
	}, []);

	const addSelector = (selector) => {
		if (!selector) return;

		const editor = document
				.querySelector('.custom-css-tabs')
				.querySelector('.CodeMirror').CodeMirror,
			placeholder = '/*' + __('Your CSS Rules', 'mailster') + '*/',
			editorValue = editor.getValue(),
			value =
				editorValue +
				(editorValue ? '\n' : '') +
				selector +
				'{\n    ' +
				placeholder +
				'\n}\n',
			lines = value.match(/(\n)/g).length;

		editor.setValue(value);
		editor.focus();
		editor.setSelection(
			{ line: lines - 2, ch: 4 },
			{ line: lines - 2, ch: placeholder.length + 4 }
		);
	};

	const [isCSSModal, setCSSModal] = useState(false);

	const tabs = Object.keys(CSS_TAB_NAMES).filter((tab) => {
		return basiccss || tab != 'basic';
	});

	return (
		<>
			<PanelRow>
				<Button
					onClick={() => setCSSModal(true)}
					variant="link"
					iconPosition="right"
					isSmall={true}
					disabled={isCSSModal}
					icon={external}
				>
					{__('Open in Modal Window', 'mailster')}
				</Button>
			</PanelRow>
			<Wrapper isCSSModal={isCSSModal} setCSSModal={setCSSModal}>
				<PanelRow>
					<CheckboxControl
						label={__('Basic Input Styling', 'mailster')}
						checked={!!basiccss}
						onChange={() => setAttributes({ basiccss: !basiccss })}
						help={__(
							"This option is useful if your theme doesn't add styling to input fields",
							'mailster'
						)}
					/>
				</PanelRow>
				<PanelRow>
					<TabPanel
						className="custom-css-tabs"
						activeClass="is-active"
						orientation="horizontal"
						tabs={tabs.map((tab) => {
							return {
								name: tab,
								title: CSS_TAB_NAMES[tab],
							};
						})}
					>
						{(tab) => <EditTextArea {...props} tab={tab} />}
					</TabPanel>
				</PanelRow>
				<PanelRow>
					<SelectControl
						label={__('Selectors', 'mailster')}
						help="Helps you find the right selector for form elements"
						onChange={addSelector}
					>
						<option value="">{__('Choose Selector', 'mailster')}</option>
						{selectors.map((group, i) => {
							return (
								<optgroup key={i} label={group.label}>
									{group.items.map((el, j) => {
										return (
											<option key={j} value={el.selector}>
												{el.title}
											</option>
										);
									})}
								</optgroup>
							);
						})}
					</SelectControl>
				</PanelRow>
				{!!children && <>{children}</>}
			</Wrapper>
		</>
	);
}

const EditTextArea = (props) => {
	const { attributes, setAttributes, tab } = props;

	const { css = {} } = attributes;
	const setCssDebounce = wp.CodeMirror && useDebounce(setCss, 500);
	const id = 'css-code-editor-' + tab.name;

	function setCss(name, data) {
		var newCss = { ...css };
		newCss[name] = data || undefined;
		setAttributes({ css: newCss });
	}

	useEffect(() => {
		const timeout = setTimeout(() => {
			const placeholder = '/* Style for ' + CSS_TAB_NAMES[tab.name] + ' /*';

			const el = document.getElementById(id);
			if (!el) return;

			const settings = {
				...wp.codeEditor.defaultSettings.codemirror,
				...{
					mode: 'text/css',
					autofocus: true,
					placeholder: placeholder,
				},
			};

			wp.CodeMirror.fromTextArea(el, settings).on('change', (editor) =>
				setCss(tab.name, editor.getValue())
			);
		}, 0);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<TextareaControl
			id={id}
			help={__(
				'Enter your custom CSS here. Every declaration will get prefixed to work only for this specific form.',
				'mailster'
			)}
			value={css[tab.name]}
			onChange={(value) => setCssDebounce(tab, tab.name)}
		/>
	);
};
