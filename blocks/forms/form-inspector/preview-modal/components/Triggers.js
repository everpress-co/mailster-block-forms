/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	PanelRow,
	CheckboxControl,
	TextControl,
	Icon,
	Tooltip,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */

export default function Triggers(props) {
	const { options, setOptions, placement } = props;
	const { type } = placement;

	// no trigger on content
	if ('content' == type) return null;

	const triggers = options.triggers || [];

	function setTriggers(trigger, add) {
		var newTriggers = [...triggers];
		if (add) {
			newTriggers.push(trigger);
		} else {
			newTriggers = newTriggers.filter((el) => {
				return el != trigger;
			});
		}
		setOptions({ triggers: newTriggers });
	}

	function Title() {
		return (
			<>
				{__('Triggers', 'mailster')}
				{triggers.length > 0 && (
					<span className="component-count-indicator">
						{triggers.length}
					</span>
				)}
			</>
		);
	}

	return (
		<PanelBody title={<Title />} initialOpen={false}>
			<PanelRow>
				<CheckboxControl
					label={__('Trigger after delay', 'mailster')}
					checked={triggers.includes('delay')}
					onChange={(val) => setTriggers('delay', val)}
				/>
				<Tooltip
					text={__(
						'Mailster will show this popup after a give time. The preview will always trigger after 2 seconds.',
						'mailster'
					)}
				>
					<Icon icon="editor-help" />
				</Tooltip>
			</PanelRow>
			{triggers.includes('delay') && (
				<PanelRow>
					<NumberControl
						className="small-text"
						onChange={(val) => setOptions({ trigger_delay: val })}
						isDragEnabled
						isShiftStepEnabled
						step={1}
						min={1}
						value={options.trigger_delay}
						label={__('Delay in Seconds', 'mailster')}
						labelPosition="edge"
					/>
				</PanelRow>
			)}
			<PanelRow>
				<CheckboxControl
					label={__('Trigger after inactive', 'mailster')}
					checked={triggers.includes('inactive')}
					onChange={(val) => setTriggers('inactive', val)}
				/>
				<Tooltip
					text={__(
						"Mailster will show this popup when the user doesn't do any interaction with the website. The preview will always trigger after 4 seconds.",
						'mailster'
					)}
				>
					<Icon icon="editor-help" />
				</Tooltip>
			</PanelRow>
			{triggers.includes('inactive') && (
				<PanelRow>
					<NumberControl
						className="small-text"
						onChange={(val) =>
							setOptions({ trigger_inactive: val })
						}
						isDragEnabled
						isShiftStepEnabled
						step={1}
						min={1}
						value={options.trigger_inactive}
						label={__('Inactive for x Seconds', 'mailster')}
						labelPosition="edge"
					/>
				</PanelRow>
			)}
			<PanelRow>
				<CheckboxControl
					label={__('Trigger after scroll', 'mailster')}
					checked={triggers.includes('scroll')}
					onChange={(val) => setTriggers('scroll', val)}
				/>
				<Tooltip
					text={__(
						'Mailster will show this popup once the user scrolls to a certain position on your website.',
						'mailster'
					)}
				>
					<Icon icon="editor-help" />
				</Tooltip>
			</PanelRow>
			{triggers.includes('scroll') && (
				<PanelRow>
					<NumberControl
						className="small-text"
						onChange={(val) => setOptions({ trigger_scroll: val })}
						isDragEnabled
						isShiftStepEnabled
						step={1}
						min={1}
						min={100}
						value={options.trigger_scroll}
						label={__('Scroll Position in %', 'mailster')}
						labelPosition="edge"
					/>
				</PanelRow>
			)}
			<PanelRow>
				<CheckboxControl
					label={__('Trigger after click', 'mailster')}
					checked={triggers.includes('click')}
					onChange={(val) => setTriggers('click', val)}
				/>
				<Tooltip
					text={__(
						'Show the form once the user clicks on specific element on the website.',
						'mailster'
					)}
				>
					<Icon icon="editor-help" />
				</Tooltip>
			</PanelRow>
			{triggers.includes('click') && (
				<PanelRow>
					<TextControl
						className="small-text"
						onChange={(val) => setOptions({ trigger_click: val })}
						value={options.trigger_click}
						label={__('Selector', 'mailster')}
					/>
				</PanelRow>
			)}
			<PanelRow>
				<CheckboxControl
					label={__('Trigger after exit intent', 'mailster')}
					checked={triggers.includes('exit')}
					onChange={(val) => setTriggers('exit', val)}
				/>
				<Tooltip
					text={__(
						"Mailster will show this popup once the user tries to move away from the site. This doens't work on mobile.",
						'mailster'
					)}
				>
					<Icon icon="editor-help" />
				</Tooltip>
			</PanelRow>
		</PanelBody>
	);
}
