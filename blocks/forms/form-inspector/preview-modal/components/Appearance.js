/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	PanelBody,
	PanelRow,
	SelectControl,
	__experimentalBoxControl as BoxControl,
	__experimentalItemGroup as ItemGroup,
} from '@wordpress/components';

/**
 * Internal dependencies
 */

export default function PlacementSettings(props) {
	const { options, setOptions, placement, attributes } = props;
	const { type } = placement;

	const padding =
		options.padding || attributes?.style?.spacing?.padding || {};

	return (
		<PanelBody title={__('Appearance', 'mailster')} initialOpen={false}>
			<PanelRow>
				<RangeControl
					className="widefat"
					label={__('Form Width', 'mailster')}
					help={__('Set the with of your form in %', 'mailster')}
					value={options.width}
					allowReset={true}
					onChange={(val) => setOptions({ width: val })}
					min={10}
					max={100}
					initialPosition={100}
				/>
			</PanelRow>
			<PanelRow>
				<ItemGroup isBordered={false} size="small" className="widefat">
					<BoxControl
						label={__('Form Padding', 'mailster')}
						values={padding}
						resetValues={null}
						onChange={(val) => setOptions({ padding: val })}
					/>
				</ItemGroup>
			</PanelRow>
			<PanelRow>
				<ItemGroup isBordered={false} size="small" className="widefat">
					<SelectControl
						label={__('Show form', 'mailster')}
						value={options.cooldown}
						help={__(
							'Mailster will show this popup again when it has been explicitly closed. If there is a conversation the popup will not show up again.',
							'mailster'
						)}
						onChange={(val) => setOptions({ cooldown: val })}
					>
						<option value={0}>{__('Always', 'mailster')}</option>
						<option value={1}>
							{__('every 1 hour', 'mailster')}
						</option>
						<option value={12}>
							{__('every 12 hours', 'mailster')}
						</option>
						<option value={24}>
							{__('every 24 hours', 'mailster')}
						</option>
						<option value={168}>
							{__('every 1 week', 'mailster')}
						</option>
						<option value={720}>
							{__('every 1 month', 'mailster')}
						</option>
					</SelectControl>
				</ItemGroup>
			</PanelRow>
			{'content' != type && (
				<PanelRow>
					<ItemGroup
						isBordered={false}
						size="small"
						className="widefat"
					>
						<SelectControl
							label={__('Animation', 'mailster')}
							value={options.animation}
							help={__(
								'Define how the popup should appear on the screen.',
								'mailster'
							)}
							onChange={(val) => setOptions({ animation: val })}
						>
							<option value="">{__('None', 'mailster')}</option>
							<option value="fadein">
								{__('FadeIn', 'mailster')}
							</option>
							<option value="shake">
								{__('Shake', 'mailster')}
							</option>
							<option value="swing">
								{__('Swing', 'mailster')}
							</option>
							<option value="heartbeat">
								{__('Heart Beat', 'mailster')}
							</option>
							<option value="tada">
								{__('Tada', 'mailster')}
							</option>
							<option value="wobble">
								{__('Wobble', 'mailster')}
							</option>
						</SelectControl>
					</ItemGroup>
				</PanelRow>
			)}
		</PanelBody>
	);
}
