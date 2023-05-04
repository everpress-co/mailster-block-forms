/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const TABS = [
	{
		id: 'submission',
		name: __('Signup Form', 'mailster'),
		title_DEL: '/',
		label: __('This is the homepage', 'mailster'),
		help: __(
			'This section is displayed if users visit the newsletter homepage.',
			'mailster'
		),
	},
	{
		id: 'profile',
		name: __('Profile', 'mailster'),
		title_DEL: '/profile',
		label: __('This is the profile page', 'mailster'),
		help: __(
			'This section is displayed if users visits the profile page. People can update their subscription on this page.',
			'mailster'
		),
	},
	{
		id: 'unsubscribe',
		name: __('Unsubscribe', 'mailster'),
		title_DEL: '/unsubscribe',
		label: __('This is the unsubscribe page', 'mailster'),
		help: __(
			'This section is displayed on the unsubscribe page. If the user clicks an unsubscribe link in a newsletter, he will be redirected to this page.',
			'mailster'
		),
	},
	{
		id: 'subscribe',
		name: __('Subscribe', 'mailster'),
		title_DEL: '/subscribe',
		label: __('This is the Landing page', 'mailster'),
		help: __(
			'Use this section to define the content when people click on the link in the confirmation email.',
			'mailster'
		),
	},
];
