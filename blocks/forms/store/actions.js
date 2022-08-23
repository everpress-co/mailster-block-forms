export function setLists(lists) {
	return {
		type: 'SET_LISTS',
		lists,
	};
}

export function getLists(path) {
	return {
		type: 'GET_LISTS',
		path,
	};
}
