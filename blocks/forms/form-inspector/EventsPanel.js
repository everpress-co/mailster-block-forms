/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	PanelRow,
	TextareaControl,
	Spinner,
	TabPanel,
	Modal,
	Tip,
	ExternalLink,
	Button,
} from '@wordpress/components';

import { useDebounce } from '@wordpress/compose';

import { useState, useEffect } from '@wordpress/element';

import { external } from '@wordpress/icons';

/**
 * Internal dependencies
 */

const EVENT_TAB_NAMES = {
	impression: __('Impression', 'mailster'),
	open: __('Open', 'mailster'),
	close: __('Close', 'mailster'),
	submit: __('Submit', 'mailster'),
	error: __('Error', 'mailster'),
};

const EVENT_EXPLANATIONS = {
	impression: __(
		'Gets triggered whenever a form is visible to a user.',
		'mailster'
	),
	open: __(
		"Gets triggered either when the for is explicitly opened (via a click) or via a trigger method. This event doesn't get triggered on forms in content.",
		'mailster'
	),
	close: __('Gets triggered whenever a popup is closed.', 'mailster'),
	submit: __(
		'Gets triggered whenever a form has been submitted successfully without errors.',
		'mailster'
	),
	error: __(
		'Gets triggered whenever a form has been submitted with errors.',
		'mailster'
	),
};
const Wrapper = ({ children, isEventsModal, setEventsModal }) => {
	return isEventsModal ? (
		<Modal
			title={__('Define code triggered on Events', 'mailster')}
			className="events-modal"
			onRequestClose={() => setEventsModal(false)}
			style={{
				width: '80vw',
			}}
		>
			{children}
		</Modal>
	) : (
		children
	);
};

export const EventsPanel = (props) => {
	const { attributes, setAttributes, children } = props;

	const { events = {} } = attributes;

	const [isEventsModal, setEventsModal] = useState(false);

	return (
		<>
			<PanelRow>
				<Button
					onClick={() => setEventsModal(true)}
					variant="link"
					iconPosition="right"
					isSmall={true}
					disabled={isEventsModal}
					icon={external}
				>
					{__('Open in Modal Window', 'mailster')}
				</Button>
			</PanelRow>
			<Wrapper isEventsModal={isEventsModal} setEventsModal={setEventsModal}>
				{isEventsModal && (
					<PanelRow>
						<Tip>
							{__(
								'You can use certain events to trigger custom JavaScript code on your form. This can be helpful if you want to connect your Analytics with those events and track them in your reports.',
								'mailster'
							)}
						</Tip>
						<ExternalLink href="https://kb.mailster.co/trigger-custom-javascript-on-form-submission/">
							{__('Learn more about Events', 'mailster')}
						</ExternalLink>
					</PanelRow>
				)}
				<PanelRow>
					<TabPanel
						className="custom-events-tabs"
						activeClass="is-active"
						orientation="horizontal"
						tabs={Object.keys(events).map((tab) => {
							return {
								name: tab,
								title: EVENT_TAB_NAMES[tab],
							};
						})}
					>
						{(tab) => <EditTextArea {...props} tab={tab} />}
					</TabPanel>
				</PanelRow>
				{!!children && <>{children}</>}
			</Wrapper>
		</>
	);
};

const EditTextArea = (props) => {
	const { attributes, setAttributes, tab } = props;

	const { events = {} } = attributes;
	const setEventsDebounce = wp.CodeMirror && useDebounce(setEvents, 500);
	const id = 'events-code-editor-' + tab.name;

	function setEvents(name, data) {
		var newEvents = { ...events };
		newEvents[name] = data;
		setAttributes({ events: newEvents });
	}

	useEffect(() => {
		const timeout = setTimeout(() => {
			const placeholder =
				'/* JavaScript triggered on ' + EVENT_TAB_NAMES[tab.name] + ' /*';

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
				setEventsDebounce(tab.name, editor.getValue())
			);
		}, 0);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<TextareaControl
			id={id}
			help={EVENT_EXPLANATIONS[tab.name]}
			value={events[tab.name]}
			onChange={(value) => setEventsDebounce(tab, tab.name)}
		/>
	);
};
