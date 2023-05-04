/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { useEffect, useRef } from '@wordpress/element';
import { select, subscribe } from '@wordpress/data';

/**
 * Internal dependencies
 */

export function HelpBeacon({ id, align }) {
	const href = new URL('https://kb.mailster.co/' + id);
	href.searchParams.set('utm_campaign', 'plugin');
	href.searchParams.set('utm_medium', 'link');
	href.searchParams.set('utm_source', 'Mailster Plugin');
	href.searchParams.set('utm_term', 'workflow');

	var styles = {};

	if (align) {
		styles['float'] = align;
	}

	return (
		<a
			className="mailster-help"
			href={href.toString()}
			data-article={id}
			style={styles}
		></a>
	);
}
export function useUpdateEffectCustom(callback, dependencies) {
	const firstRenderRef = useRef(true);

	useEffect(() => {
		if (firstRenderRef.current) {
			firstRenderRef.current = false;
			return;
		}
		return callback();
	}, dependencies);
}

export function useUpdateEffect(effect, deps) {
	const mounted = useRef(false);

	useEffect(() => {
		if (mounted.current) {
			return effect();
		}
		mounted.current = true;
		return undefined;
	}, deps);
}

export function useCustomFields(callback, dependencies) {
	const firstRenderRef = useRef(true);

	useEffect(() => {
		if (firstRenderRef.current) {
			firstRenderRef.current = false;
			return;
		}
		return callback();
	}, dependencies);
}

export function useEventListener(eventType, callback, element = window) {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (element == null) return;
		const handler = (e) => callbackRef.current(e);
		element.addEventListener(eventType, handler);

		return () => element.removeEventListener(eventType, handler);
	}, [eventType, element]);
}

export function useBlockAttributes() {
	const { clientId } = useBlockEditContext();
	const { updateBlockAttributes } = useDispatch('core/block-editor');

	const attributes = useSelect(
		(select) => {
			const { getBlockAttributes } = select('core/block-editor');
			const _attributes = getBlockAttributes(clientId) || {};

			return _attributes;
		},
		[clientId]
	);

	const setAttributes = useCallback(
		(newAttributes) => {
			updateBlockAttributes(clientId, newAttributes);
		},
		[clientId]
	);

	return [attributes, setAttributes];
}

export function searchBlock(blockName, clientId) {
	const all = select('core/block-editor').getBlocks(clientId);

	var found = all.find((block) => {
		return new RegExp(blockName, 'g').test(block.name);
	});

	if (found) {
		found.rootClientId = clientId;
		return found;
	} else {
		for (var i = 0; i < all.length; i++) {
			if ((found = searchBlock(blockName, all[i].clientId))) {
				return found;
			}
		}
	}

	return false;
}

export function searchBlocks(blockName, clientId = null, deep = true) {
	const blocks = select('core/block-editor').getBlocks(clientId);

	const matchingBlocks = blocks.filter((block) => block.name === blockName);

	for (const block of blocks) {
		if (deep && block.innerBlocks.length > 0) {
			for (const innerblock of block.innerBlocks) {
				matchingBlocks.push(
					...searchBlocks(blockName, innerblock.clientId, deep)
				);
			}
		}
	}

	return matchingBlocks;
}

export function whenEditorIsReady() {
	return new Promise((resolve) => {
		const unsubscribe = subscribe(() => {
			if (
				select('core/editor').isCleanNewPost() ||
				select('core/block-editor').getBlockCount() > 0
			) {
				unsubscribe();
				resolve();
			}
		});
	});
}
