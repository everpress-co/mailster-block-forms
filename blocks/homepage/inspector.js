/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __, sprintf } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';
import {
	Panel,
	PanelBody,
	PanelRow,
	ItemGroup,
	BaseControl,
	MenuGroup,
	MenuItem,
	CheckboxControl,
	TextControl,
	RangeControl,
	Button,
	Tip,
	ExternalLink,
} from '@wordpress/components';

import { useState } from '@wordpress/element';
import { select, dispatch, useSelect } from '@wordpress/data';

import { external } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { TABS } from './constants';
import { searchBlock } from '../util';

export default function HomepageInspectorControls(props) {
	const { current, onSelect } = props;

	const homepage = searchBlock('mailster/homepage');

	const attributes = useSelect((select) => {
		return select('core/block-editor').getBlockAttributes(homepage.clientId);
	});
	const permalink = useSelect((select) => {
		return select('core/editor').getPermalink();
	});

	const ContextButtons = ({ onClose = () => {} }) => {
		return TABS.map((a, i) => {
			const link =
				a.id == 'submission'
					? permalink
					: sprintf('%s%s', permalink, mailster_homepage_slugs[a.id] || a.id);
			const defined = attributes[a.id] || a.id == 'subscribe';
			return (
				<MenuGroup key={i} isSelected={a.id === current}>
					<MenuItem
						info={defined ? link : __('Not defined yet!', 'mailster')}
						isDestructive={!defined}
						isPressed={a.id === current}
						onClick={() => {
							onSelect(a.id, i);
							onClose();
						}}
					>
						{a.name}
						<ExternalLink href={link} />
					</MenuItem>
				</MenuGroup>
			);
		});
	};

	const getHelp = () => {
		if (TABS[current]) return TABS[current].help;

		return __(
			'You have to define a form for each section. You can use the same form as well.',
			'mailster'
		);
	};

	return (
		<InspectorControls>
			<Panel>
				<PanelBody initialOpen={true}>
					<PanelRow>
						<BaseControl label={__('Newsletter Homepage Sections', 'mailster')}>
							<div className="components-dropdown-menu__menu context-buttons">
								<ContextButtons />
							</div>
						</BaseControl>
					</PanelRow>
				</PanelBody>
				<PanelBody initialOpen={true}>
					<PanelRow>
						<Tip>{getHelp()}</Tip>
					</PanelRow>
				</PanelBody>
				{(current == 'profile' || current == 'unsubscribe') && (
					<PanelBody initialOpen={true}>
						<PanelRow>
							<ExternalLink href="edit.php?post_type=newsletter&page=mailster_settings#texts">
								{__(
									'Change the text of the button on the Texts tab in the settings.',
									'mailster'
								)}
							</ExternalLink>
						</PanelRow>
					</PanelBody>
				)}
			</Panel>
		</InspectorControls>
	);
}
