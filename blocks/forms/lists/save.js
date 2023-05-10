/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */

export default function save(props) {
	const { attributes, setAttributes, isSelected } = props;
	const { lists, vertical } = attributes;
	const className = ['mailster-wrapper mailster-wrapper-_lists'];

	if (vertical) className.push('mailster-wrapper-is-vertical');

	const blockProps = useBlockProps.save({
		className: classnames({}, className),
	});

	return (
		<div {...blockProps}>
			<fieldset>
				<legend>{__('Lists', 'mailster')}</legend>
				{lists.map((list, i) => {
					const fieldid = attributes.id + (i ? '-' + i : '');
					return (
						<div key={i} className="mailster-group mailster-group-checkbox">
							<input
								type="checkbox"
								name="_lists[]"
								id={fieldid}
								value={list.id}
								checked={list.checked}
								aria-label={list.name}
							/>
							<RichText.Content
								tagName="label"
								htmlFor={fieldid}
								value={list.name}
								className="mailster-label"
							/>
						</div>
					);
				})}
			</fieldset>
		</div>
	);
}
