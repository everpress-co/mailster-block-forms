/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { MenuGroup, MenuItem } from '@wordpress/components';

import { warning } from '@wordpress/icons';
import { dispatch, select } from '@wordpress/data';

/**
 * Internal dependencies
 */

const showEditorPanel = (name) => {
	const id = 'mailster-block-form-settings-panel/' + name;
	const isOpen = select('core/edit-post').isEditorPanelOpened(id);
	dispatch('core/edit-post').closePublishSidebar();
	if (!isOpen) dispatch('core/edit-post').toggleEditorPanelOpened(id);
};

export default function PublishChecks(props) {
	const { meta, setMeta } = props;
	const { gdpr, lists } = meta;

	let errors = [];
	let warnings = [];

	if (lists.length < 1) {
		errors.push({
			msg: __('Please select a list', 'mailster'),
			onClick: () => showEditorPanel('lists'),
		});
	}
	if (!gdpr) {
		warnings.push({
			msg: __('You have no GDPR field in place', 'mailster'),
			onClick: () => showEditorPanel('options'),
		});
	}

	return (
		<MenuGroup className="widefat">
			{errors.map((obj, i) => (
				<MenuItem
					key={i}
					className="is-warning"
					icon={warning}
					onClick={obj.onClick}
					isTertiary
					iconPosition="left"
				>
					{obj.msg}
				</MenuItem>
			))}
			{warnings.map((obj, i) => (
				<MenuItem
					key={i}
					className="is-warning"
					icon={warning}
					onClick={obj.onClick}
					isTertiary
					iconPosition="left"
				>
					{obj.msg}
				</MenuItem>
			))}
		</MenuGroup>
	);
}
