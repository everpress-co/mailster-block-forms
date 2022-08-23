/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { useEffect, useRef } from '@wordpress/element';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */

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
