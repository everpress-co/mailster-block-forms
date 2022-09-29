/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	TextControl,
	Flex,
	FlexItem,
	TabPanel,
	Toolbar,
	ToolbarButton,
} from '@wordpress/components';

import { useState, useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

import { Modal } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';

import { desktop, tablet, mobile, update, login } from '@wordpress/icons';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */

import { useEventListener } from '../../../util';

import PlacementSettings from './components/PlacementSettings';

const ModalContent = (props) => {
	const { placements, meta, setMeta, initialType } = props;

	const [type, setType] = useState(initialType);
	const [url, setUrl] = useState('');
	const [displayUrl, setDisplayUrl] = useState('');
	const [urlLoggedIn, setUrlLoggedIn] = useState(false);
	const [useThemeStyle, setUseThemeStyle] = useState(true);
	const [device, setDevice] = useState('desktop');
	const [siteUrl] = useEntityProp('root', 'site', 'url');

	const [currentPage, setCurrentPage] = useState(false);

	const options = meta['placement_' + type] || {};

	const isOther = type == 'other';

	const iframeRef = useRef(null);

	const typeActive = meta.placements.includes(type) || isOther;

	const formId = useSelect((select) =>
		select('core/editor').getCurrentPostId()
	);

	const postContent = useSelect((select) =>
		select('core/editor').getEditedPostContent()
	);

	const [isLoading, setIsLoading] = useState(true);

	const [isDisplayed, setIsDisplayed] = useState(false);

	useEffect(() => {
		if (isOther) {
			setIsDisplayed(true);
		} else if (
			options.all?.length ||
			options.posts?.length ||
			options.taxonomies?.length
		) {
			if (type == 'content') {
				setIsDisplayed(true);
			} else if (options.triggers?.length) {
				setIsDisplayed(true);
			} else {
				setIsDisplayed(false);
			}
		} else {
			setIsDisplayed(false);
		}
	}, [options.all, options.posts, options.taxonomies, options.triggers]);

	const setUrlDebounce = useDebounce(setUrl, 100);
	const setPreviewOptionsDebounce = useDebounce(setPreviewOptions, 100);

	useEffect(() => {
		if (!type || !siteUrl) {
			return;
		}

		let newUrl = new URL(siteUrl);

		if (isOther) {
			const formendpoint = new URL(
				siteUrl + '/wp-content/plugins/mailster/block-form.php'
			);

			formendpoint.searchParams.set('id', formId);
			useThemeStyle && formendpoint.searchParams.set('style', 1);

			newUrl = formendpoint;
		} else if (
			!options.all?.length &&
			!options.posts?.length &&
			!options.taxonomies?.length
		) {
			return;
		}

		setUrlDebounce(mapUrl(newUrl.toString()));
	}, [
		options.all,
		options.posts,
		options.taxonomies,
		options.display,
		options.pos,
		options.tag,
		siteUrl,
		urlLoggedIn,
		useThemeStyle,
	]);

	useEffect(() => {
		if (!options || Object.keys(options).length === 0) {
			return;
		}
		typeActive && isDisplayed && setIsLoading(true);
		setPreviewOptions();
	}, [options]);

	useEventListener('message', (e) => {
		if (!e.data || typeof e.data !== 'string') return;
		if (!iframeRef.current) return;

		const data = JSON.parse(e.data);
		const form = iframeRef.current.contentWindow.document.querySelector(
			'.wp-block-mailster-form-outside-wrapper-' + formId
		);
		setDisplayUrl(data.location);
		setIsLoading(false);

		if (form && 'content' == type) {
			form.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'nearest',
			});
		}
	});

	function setOptions(options) {
		var newOptions = { ...meta['placement_' + type] };
		newOptions = { ...newOptions, ...options };
		setMeta({ ['placement_' + type]: newOptions });
	}

	function mapUrl(url) {
		const newUrl = new URL(url);

		const { display, pos, tag, triggers } = meta['placement_' + type] || {};

		const obj = {
			type: type,
			user: urlLoggedIn,
			options: options,
			form_id: formId,
		};

		newUrl.searchParams.set('mailster-block-preview', JSON.stringify(obj));

		return newUrl.toString();
	}

	function setPreviewOptions() {
		const obj = {
			type: type,
			user: urlLoggedIn,
			options: {
				...options,
				all: true,
				trigger_delay: 2,
				trigger_inactive: 4,
			},
			form_id: formId,
			post_content: postContent,
		};

		if (iframeRef.current && isDisplayed) {
			setIsLoading(true);
			iframeRef.current.contentWindow.postMessage(
				JSON.stringify(obj),
				siteUrl
			);
		}
	}

	function reload() {
		const currentUrl = url;
		setUrl('');
		setUrlDebounce(currentUrl);
	}

	return (
		<div className="preview-pane-grid-wrap">
			<Flex align="stretch">
				<div className="preview-pane">
					<div
						className="interface-interface-skeleton__header"
						role="region"
						tabIndex="-1"
					>
						<Toolbar
							label="Options"
							className="preview-pane-toolbar widefat"
						>
							<ToolbarButton
								icon={desktop}
								label="Edit"
								isDisabled={device == 'desktop' || !url}
								isPressed={device == 'desktop'}
								onClick={() => setDevice('desktop')}
							/>
							<ToolbarButton
								icon={tablet}
								label="Edit"
								isDisabled={device == 'tablet' || !url}
								isPressed={device == 'tablet'}
								onClick={() => setDevice('tablet')}
							/>
							<ToolbarButton
								icon={mobile}
								label="More"
								isDisabled={device == 'mobile' || !url}
								isPressed={device == 'mobile'}
								onClick={() => setDevice('mobile')}
							/>

							<div className="preview-pane-url">
								<TextControl
									className="widefat"
									value={isDisplayed ? displayUrl : ''}
									readOnly
								/>
							</div>
							<ToolbarButton
								icon={login}
								label={__(
									'Show the preview as currently logged in user.',
									'mailster'
								)}
								isDisabled={isOther}
								isPressed={!urlLoggedIn}
								onClick={() => setUrlLoggedIn(!urlLoggedIn)}
								showTooltip={true}
							/>
							<ToolbarButton
								icon={update}
								label="reload"
								isDisabled={!url}
								onClick={reload}
								isBusy={isLoading}
							/>
						</Toolbar>
					</div>
					{typeActive && isDisplayed ? (
						<div
							className={
								'preview-pane-iframe preview-pane-iframe-' +
								device
							}
						>
							<iframe
								ref={iframeRef}
								src={url}
								onLoad={setPreviewOptionsDebounce}
								_sandbox="allow-scripts allow-same-origin"
								hidden={!url}
							/>
						</div>
					) : (
						<Flex
							className="preview-pane-info"
							justify="center"
							align="center"
						>
							<FlexItem>
								<h3>
									{isDisplayed
										? __(
												'Please enable a Placement option on the right',
												'mailster'
										  )
										: __(
												'This form is currently not displayed anywhere.',
												'mailster'
										  )}
								</h3>
							</FlexItem>
						</Flex>
					)}
				</div>
				<div className="preview-sidebar">
					<TabPanel
						className="placement-tabs"
						activeClass="is-active"
						orientation="horizontal"
						initialTabName={initialType}
						onSelect={(tabName) => setType(tabName)}
						tabs={placements.map((placement) => {
							return {
								name: placement.type,
								title: placement.title,
								type: placement.type,
							};
						})}
					>
						{(placement) => (
							<PlacementSettings
								{...props}
								isDisplayed={isDisplayed}
								placement={placement}
								useThemeStyle={useThemeStyle}
								setUseThemeStyle={setUseThemeStyle}
								options={meta['placement_' + placement.type]}
								setOptions={setOptions}
							/>
						)}
					</TabPanel>
				</div>
			</Flex>
		</div>
	);
};

export default function PreviewModal(props) {
	const { setOpen, isOpen } = props;

	return (
		<>
			{isOpen && (
				<Modal
					title={__('Define your placement options', 'mailster')}
					className="preview-modal"
					onRequestClose={() => setOpen(false)}
					shouldCloseOnClickOutside={false}
					isFullScreen={true}
				>
					<ModalContent {...props} />
				</Modal>
			)}
		</>
	);
}
