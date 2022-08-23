/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { useSelect, select, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalBoxControl as BoxControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */

export const DimensionsPanel = (props) => {
	const { attributes, setAttributes } = props;

	function hasPaddingValue() {
		return true;
	}
	function resetPadding() {}
	function resetAll() {}

	return (
		<ToolsPanel
			label={__('Dimensions')}
			resetAll={resetAll}
			hasInnerWrapper
			shouldRenderPlaceholderItems
		>
			<BoxControl
				label={__('Form Padding', 'mailster')}
				values={attributes.padding}
				help={__('Set the padding of your form in %', 'mailster')}
				resetValues={{
					top: undefined,
					left: undefined,
					right: undefined,
					bottom: undefined,
				}}
				onChange={(val) =>
					setAttributes({
						padding: val,
					})
				}
			/>
			<ToolsPanelItem
				hasValue={() => hasPaddingValue(props)}
				label={__('Padding')}
				onDeselect={() => resetPadding(props)}
				//resetAllFilter={createResetAllFilter('padding')}
				isShownByDefault
				panelId={props.clientId}
			>
				<BoxControl
					label={__('Form Padding', 'mailster')}
					values={attributes.padding}
					help={__('Set the padding of your form in %', 'mailster')}
					resetValues={{
						top: undefined,
						left: undefined,
						right: undefined,
						bottom: undefined,
					}}
					onChange={(val) =>
						setAttributes({
							padding: val,
						})
					}
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
};
