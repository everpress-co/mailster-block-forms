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

	const padding = options.padding ||
		attributes?.style?.spacing?.padding || {
			top: '1em',
			left: '1em',
			right: '1em',
			bottom: '1em',
		};

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
				<BoxControl
					label={__('Form Padding', 'mailster')}
					values={padding}
					help={__('Set the padding of your form in %', 'mailster')}
					resetValues={null}
					onChange={(val) => setOptions({ padding: val })}
				/>
			</PanelRow>
			<PanelRow>
				<SelectControl
					label={__('Show form every', 'mailster')}
					value={options.delay}
					onChange={(val) => setOptions({ delay: val })}
				>
					<option value={0}>{__('Always', 'mailster')}</option>
					<option value={1}>{__('1 hour', 'mailster')}</option>
					<option value={12}>{__('12 hours', 'mailster')}</option>
					<option value={24}>{__('1 day', 'mailster')}</option>
				</SelectControl>
			</PanelRow>
			{'content' != type && (
				<PanelRow>
					<ItemGroup isBordered={false} size="small">
						<SelectControl
							label={__('Animation', 'mailster')}
							value={options.animation}
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
