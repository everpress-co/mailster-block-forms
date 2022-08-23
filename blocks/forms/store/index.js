import { registerStore } from '@wordpress/data';

import * as selectors from './selectors';
import * as actions from './actions';
import * as resolvers from './resolvers';
import * as controls from './controls';
import reducer from './reducer';

registerStore('mailster/form', {
	selectors,
	actions,
	resolvers,
	reducer,
	controls,
});
