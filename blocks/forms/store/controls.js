import apiFetch from '@wordpress/api-fetch';

export function GET_LISTS(action) {
	return apiFetch({ path: action.path });
}
