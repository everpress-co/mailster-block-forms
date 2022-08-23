/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	PanelRow,
	Button,
	BaseControl,
	__experimentalGrid as Grid,
} from '@wordpress/components';

import { useState } from '@wordpress/element';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */

import PlacementOption from './placement-option';
import PlacementIcons from './placement-icons';
import PreviewModal from './preview-modal';

const placements = [
	{
		title: __('In Content', 'mailster'),
		type: 'content',
		image: PlacementIcons.content,
	},
	// {
	//	title: __('Fixed bar', 'mailster'),
	// 	type: 'bar',
	// 	image: PlacementIcons.bar,
	// },
	{
		title: __('Popup', 'mailster'),
		type: 'popup',
		image: PlacementIcons.popup,
	},
	// {
	//	title: __('Slide-in', 'mailster'),
	// 	type: 'side',
	// 	image: PlacementIcons.side,
	// },
	// {
	//	title: __('Other', 'mailster'),
	// 	type: 'other',
	// 	image: PlacementIcons.other,
	// },
];

export default function Placement(props) {
	const { meta, setMeta } = props;

	const [isOpen, setOpen] = useState(false);

	function setPlacements(placement, add) {
		var newPlacements = [...meta.placements];
		if (add) {
			newPlacements.push(placement);
		} else {
			newPlacements = newPlacements.filter((el) => {
				return el != placement;
			});
		}

		setMeta({ placements: newPlacements });
	}

	const closeModal = () => {
		setOpen(false);
	};

	return (
		<PluginDocumentSettingPanel name="placement" title="Placement">
			<PreviewModal
				{...props}
				isOpen={isOpen}
				setOpen={setOpen}
				placements={placements}
				setPlacements={setPlacements}
				initialType={isOpen}
			/>
			<PanelRow>
				<BaseControl className="widefat">
					<Grid columns={2}>
						{placements.map((placement) => {
							return (
								<PlacementOption
									{...props}
									key={placement.type}
									placement={placement}
									setPlacements={setPlacements}
									setOpen={setOpen}
								/>
							);
						})}
					</Grid>
				</BaseControl>
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
}
