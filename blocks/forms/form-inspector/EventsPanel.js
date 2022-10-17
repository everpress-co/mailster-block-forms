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

/**
 * Internal dependencies
 */

const Wrapper = ({ children, isEventsModal, setEventsModal }) => {
	return isEventsModal ? (
		<Modal
			title={__('Enter your custom Events', 'mailster')}
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

	if (!attributes) {
		return <Spinner />;
	}

	const { events = {} } = attributes;

	const tabnames = {
		impression: __('Impression', 'mailster'),
		open: __('Open', 'mailster'),
		close: __('Close', 'mailster'),
		submit: __('Submit', 'mailster'),
		error: __('Error', 'mailster'),
	};
	const explanation = {
		impression: __(
			'Gets triggered whenever a form is visible to a user. The creator of the form does not trigger an impression.',
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

	useEffect(() => {
		var newEvents = { ...events };
		setAttributes({ events: newEvents });
	}, []);

	let codeEditor;

	function setEvents(name, data) {
		var newEvents = { ...events };
		newEvents[name] = data;
		setAttributes({ events: newEvents });
	}

	const setEventsDebounce = wp.CodeMirror && useDebounce(setEvents, 500);

	const initCodeMirror = (isOpened, name) => {
		const placeholder =
			'/* JavsScript triggered on ' + tabnames[name] + ' /*';
		if (!isOpened || !wp.CodeMirror) return;

		setTimeout(() => {
			const el = document.getElementById('custom-events-textarea');
			if (!el) return;

			const settings = {
				...wp.codeEditor.defaultSettings.codemirror,
				...{
					mode: 'javascript',
					autofocus: true,
					placeholder: placeholder,
				},
			};
			codeEditor = wp.CodeMirror.fromTextArea(el, settings).on(
				'change',
				(editor) => setEventsDebounce(name, editor.getValue())
			);
		}, 0);

		return;
	};

	const [isEventsModal, setEventsModal] = useState(false);

	useEffect(() => {
		initCodeMirror(true, 'impression');
	}, [isEventsModal]);

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
			<Wrapper
				isEventsModal={isEventsModal}
				setEventsModal={setEventsModal}
			>
				<PanelRow>
					<TabPanel
						className="custom-events-tabs"
						activeClass="is-active"
						orientation="horizontal"
						initialTabName="impression"
						onSelect={(tabName) => {
							initCodeMirror(true, tabName);
						}}
						tabs={Object.keys(events).map((tab) => {
							return {
								name: tab,
								title: tabnames[tab],
							};
						})}
					>
						{(tab) => (
							<TextareaControl
								id="custom-events-textarea"
								help={explanation[tab.name]}
								value={events[tab.name]}
								onChange={(value) =>
									setEventsDebounce(tab, name)
								}
							/>
						)}
					</TabPanel>
				</PanelRow>
				{!!children && <>{children}</>}
			</Wrapper>
		</>
	);
};
