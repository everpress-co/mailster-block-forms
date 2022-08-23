/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DisplayOptionsExtra from './DisplayOptionsExtra';
import PostTypeFields from './PostTypeFields';

export default function DisplayOptions(props) {
	const { options, setOptions, placement } = props;
	const { type } = placement;

	function Title() {
		return <>{__('Display Options', 'mailster')}</>;
	}

	return (
		<PanelBody title={<Title />} initialOpen={true}>
			<PostTypeFields options={options} setOptions={setOptions} />
			<DisplayOptionsExtra {...props} />
		</PanelBody>
	);
}
