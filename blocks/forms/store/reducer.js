const DEFAULT_STATE = {
	lists: null,
};

const reducer = (state = DEFAULT_STATE, action) => {
	switch (action.type) {
		case 'SET_LISTS': {
			return {
				...state,
				lists: action.lists,
			};
		}
		default: {
			return state;
		}
	}
};

export default reducer;
