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
		switch (current) {
			case 'submission':
				return __(
					'This form is displayed if users visits the newsletter homepage.',
					'mailster'
				);
				break;
			case 'profile':
				return __(
					'This form is displayed if users visits the profile page. People can update their subscription on this page.',
					'mailster'
				);
				break;
			case 'unsubscribe':
				return __(
					'This form is displayed on the unsubscribe page. If the user clicks an unsubscribe link in a newsletter, he will be redirected to this page.',
					'mailster'
				);
			case 'subscribe':
				return __(
					'Use this section to define the content when people click on the link in the confirmation email.',
					'mailster'
				);
				break;
		}

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
						<BaseControl
							label={__(
								'Setup your newsletter homepage by defining a form for each section.',
								'mailster'
							)}
							help={getHelp()}
						>
							<div className="components-dropdown-menu__menu">
								<ContextButtons />
							</div>
						</BaseControl>
					</PanelRow>
				</PanelBody>
			</Panel>
		</InspectorControls>
	);
}
