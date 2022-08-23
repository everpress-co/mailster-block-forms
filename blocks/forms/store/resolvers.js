/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

/**
 * Internal dependencies
 */
import * as actions from './actions';

export function* getLists() {
	const lists = yield actions.getLists('/mailster/v1/lists/');
	return actions.setLists(lists);
}
