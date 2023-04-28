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
	},
	{
		id: 'profile',
		name: __('Profile', 'mailster'),
		title_DEL: '/profile',
		label: __('This is the profile page', 'mailster'),
	},
	{
		id: 'unsubscribe',
		name: __('Unsubscribe', 'mailster'),
		title_DEL: '/unsubscribe',
		label: __('This is the unsubscribe page', 'mailster'),
	},
	{
		id: 'subscribe',
		name: __('Subscribe', 'mailster'),
		title_DEL: '/subscribe',
		label: __('This is the Landing page', 'mailster'),
	},
];
