/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	CheckboxControl,
	TextControl,
	TextareaControl,
} from '@wordpress/components';

import { useState, useEffect } from '@wordpress/element';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */

export default function Doubleoptin(props) {
	const { meta, setMeta } = props;
	const { doubleoptin, subject, headline, link, content, confirmredirect } =
		meta;

	const [isValidContent, setValidContent] = useState(false);

	useEffect(() => {
		setValidContent(/{link}/.test(content));
	}, [content]);

	return (
		<PluginDocumentSettingPanel
			name="doubleoptin"
			initialOpen={false}
			title={
				doubleoptin
					? __('Double Opt In', 'mailster')
					: __('Single Opt In', 'mailster')
			}
		>
			<CheckboxControl
				label={__('Enable double opt in', 'mailster')}
				checked={!!doubleoptin}
				onChange={() => setMeta({ doubleoptin: !doubleoptin })}
			/>
			{doubleoptin && (
				<>
					<TextControl
						label={__('Subject', 'mailster')}
						value={subject}
						help={__('Subject for the confirmation message.', 'mailster')}
						onChange={(value) => setMeta({ subject: value })}
					/>
					<TextControl
						label={__('Headline', 'mailster')}
						value={headline}
						help={__(
							'The headline is part of the confirmation message. If empty the subject line will be used.',
							'mailster'
						)}
						onChange={(value) => setMeta({ headline: value })}
					/>
					<TextareaControl
						label={__('Content', 'mailster')}
						className={!isValidContent && 'error-message'}
						rows={10}
						value={content}
						help={
							!isValidContent && 'Make sure this field contain a {link} tag.'
						}
						onChange={(value) => setMeta({ content: value })}
					/>
					<TextControl
						label={__('Linktext', 'mailster')}
						value={link}
						help={__(
							'This is the text of the link subscribers have to click to confirm their email address.',
							'mailster'
						)}
						onChange={(value) => setMeta({ link: value })}
					/>
					<TextControl
						label={__('Redirect after confirm', 'mailster')}
						help={__(
							'Redirect subscribers after they clicked the link.',
							'mailster'
						)}
						placeholder="https://example.com/thank-you"
						value={confirmredirect}
						onChange={(value) => setMeta({ confirmredirect: value })}
						type="url"
					/>
				</>
			)}
		</PluginDocumentSettingPanel>
	);
}
