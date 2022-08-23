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
	Button,
	Dropdown,
	BaseControl,
	Notice,
	DateTimePicker,
	Flex,
	FlexItem,
	FlexBlock,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
} from '@wordpress/components';

import { useState, useEffect } from '@wordpress/element';
import { format, __experimentalGetSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import PostTypeFields from './PostTypeFields';

function ScheduleEntry(props) {
	const { index, setDate, schedule, removeSchedule } = props;

	const [isValid, setIsValid] = useState(true);

	function setStartDate(date) {
		setDate(index, 'start', date);
	}
	function setEndDate(date) {
		setDate(index, 'end', date);
	}

	function formatDate(date, fallback) {
		const settings = __experimentalGetSettings();
		if (!date) return fallback;
		return format(
			`${settings.formats.date} ${settings.formats.time}`,
			date
		);
	}

	useEffect(() => {
		const isValid =
			+new Date(schedule.end) - +new Date(schedule.start) > 0 ||
			(!schedule.start && !schedule.end);
		setIsValid(isValid);
	}, [schedule]);

	return (
		<Item className="schedule-box">
			<BaseControl label={__('Start', 'mailster') + ': '}>
				<Dropdown
					position="bottom left"
					renderToggle={({ onToggle, isOpen }) => (
						<Button
							onClick={onToggle}
							aria-expanded={isOpen}
							variant="tertiary"
						>
							{formatDate(
								schedule.start,
								__('immediately', 'mailster')
							)}
						</Button>
					)}
					onClose={() => console.warn('asdasdasd')}
					renderContent={() => (
						<DateTimePicker
							currentDate={schedule.start}
							onChange={(newDate) => setStartDate(newDate)}
							//is12Hour={true}
						/>
					)}
				/>
			</BaseControl>
			<BaseControl label={__('End', 'mailster') + ': '}>
				<Dropdown
					position="bottom left"
					renderToggle={({ onToggle, isOpen }) => (
						<Button
							onClick={onToggle}
							aria-expanded={isOpen}
							variant="tertiary"
						>
							{formatDate(schedule.end, __('never', 'mailster'))}
						</Button>
					)}
					renderContent={() => (
						<DateTimePicker
							currentDate={schedule.end}
							onChange={(newDate) => setEndDate(newDate)}
							//is12Hour={true}
						/>
					)}
				/>
			</BaseControl>
			{!isValid && (
				<Notice status="warning" isDismissible={false}>
					{__(
						'The start time is after the end time. Please fix schedule settings to function properly.',
						'mailster'
					)}
				</Notice>
			)}
			<BaseControl>
				<Button
					onClick={() => {
						removeSchedule(index);
					}}
					isDestructive
					isSmall
					variant="tertiary"
					label={__('Remove Entry', 'mailster')}
				>
					{__('Remove Entry', 'mailster')}
				</Button>
			</BaseControl>
		</Item>
	);
}

const EMPTY_SCHEDULE = {
	start: null,
	end: null,
};

export default function Schedule(props) {
	const { options, setOptions, placement } = props;
	const { type } = placement;
	const { schedule = [] } = options;

	function addSchedule() {
		const newSchedule = [...schedule];
		newSchedule.push(EMPTY_SCHEDULE);
		setOptions({ schedule: newSchedule });
	}

	function removeSchedule(i) {
		const newSchedule = [...schedule];
		newSchedule.splice(i, 1);
		setOptions({ schedule: newSchedule });
	}

	function setDate(i, prop, value) {
		const newSchedule = [...schedule];
		newSchedule[i][prop] = value;
		console.warn(newSchedule);
		setOptions({ schedule: newSchedule });
	}

	const isOpen = false;

	function onToggle() {
		console.warn('onToggle');
	}

	function Title() {
		return (
			<>
				{__('Schedule', 'mailster')}
				{schedule.length > 0 && (
					<span className="component-count-indicator">
						{schedule.length}
					</span>
				)}
			</>
		);
	}

	return (
		<PanelBody
			title={__('Schedule', 'mailster')}
			title={<Title />}
			initialOpen={false}
		>
			<PanelRow>
				<p>
					{__(
						'Show the form if at least one schedule applies.',
						'mailster'
					)}
				</p>
			</PanelRow>
			<PanelRow>
				<ItemGroup
					className="widefat"
					size="small"
					isBordered
					isSeparated
				>
					{schedule.map((s, i) => {
						return (
							<ScheduleEntry
								index={i}
								key={i}
								setDate={setDate}
								removeSchedule={removeSchedule}
								schedule={s}
							/>
						);
					})}
				</ItemGroup>
			</PanelRow>
			<PanelRow>
				<Button
					variant="secondary"
					onClick={addSchedule}
					icon="plus"
					isSmall
				>
					{__('Add Schedule', 'mailster')}
				</Button>
			</PanelRow>
		</PanelBody>
	);
}
