/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	useCallback,
} from '@wordpress/element';
import { select, subscribe, useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { escape } from 'lodash';
import { dateI18n } from '@wordpress/date';
import { useBlockEditContext } from '@wordpress/block-editor';

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

export function formatLists(lists) {
	if (!lists || !lists.length) {
		return __('No list defined.', 'mailster');
	}

	const allLists = select('mailster/automation').getLists();

	if (!allLists) {
		return '';
	}

	const getList = (id) => {
		if (id == -1) {
			return __('Any List', 'mailster');
		}
		if (!allLists) {
			return null;
		}
		const list = allLists.filter((list) => {
			return list.ID == id;
		});
		return list.length ? list[0].name : null;
	};

	const listStr = lists.map((list) => {
		const name = getList(list);
		return name
			? ' <strong class="mailster-step-badge">' + name + '</strong>'
			: '';
	});

	return listStr ? listStr : '';
}

export function formatForms(forms) {
	if (!forms || !forms.length) {
		return __('No list defined.', 'mailster');
	}

	const allForms = select('mailster/automation').getForms();

	if (!allForms) {
		return '';
	}

	const getForm = (id) => {
		if (id == -1) {
			return __('Any Form', 'mailster');
		}
		if (!allForms) {
			return null;
		}
		const form = allForms.filter((form) => {
			return form.ID == id;
		});
		return form.length ? form[0].name : null;
	};

	const formStr = forms.map((form) => {
		const name = getForm(form);
		return name
			? ' <strong class="mailster-step-badge">' + name + '</strong>'
			: '';
	});

	return formStr ? formStr : '';
}

export function formatTags(tags) {
	if (!tags || !tags.length) {
		return __('No tags defined.', 'mailster');
	}

	const tagStr = tags.map((tag) => {
		return tag
			? ' <strong class="mailster-step-badge">' + tag + '</strong>'
			: '';
	});

	return tagStr ? tagStr : '';
}

export function formatField(field, value, string) {
	if (!field) {
		return __('No field defined.', 'mailster');
	}

	const allFields = select('mailster/automation').getFields();

	if (!allFields) {
		return __('No field defined.', 'mailster');
	}
	const getField = (id) => {
		if (!allFields) {
			return null;
		}
		const field = allFields.filter((field) => {
			return field.id == id;
		});
		return field.length ? field[0] : null;
	};

	const name =
		field != -1 ? getField(field)?.name : __('Any field', 'mailster');

	if (!name) return '';

	const nameStr =
		'<strong class="mailster-step-badge">' + escape(name) + '</strong>';

	const currentField = allFields.filter((f) => f.id == field).pop();
	if (currentField && currentField.type == 'date') {
		if (!isNaN(parseFloat(value)) && isFinite(value)) {
			if (value < 0) {
				return sprintf(
					__('Decrease %s by %s days.', 'mailster'),
					nameStr,
					'<strong class="mailster-step-badge">' +
						escape(value * -1) +
						'</strong>'
				);
			} else if (value > 0) {
				return sprintf(
					__('Increase %s by %s days.', 'mailster'),
					nameStr,
					'<strong class="mailster-step-badge">' + escape(value) + '</strong>'
				);
			}
			return sprintf(__('Set %s to the current date.', 'mailster'), nameStr);
		}

		const date = new Date(value || new Date()).toLocaleDateString();
		if (date instanceof Date) {
			value = date;
		}
	}
	if (value !== false && currentField && currentField.type == 'checkbox') {
		if (value) {
			return sprintf(__('Check %s.', 'mailster'), nameStr);
		} else {
			return sprintf(__('Uncheck %s.', 'mailster'), nameStr);
		}
	}

	const valueStr =
		'<strong class="mailster-step-badge">' + escape(value) + '</strong>';

	if (value === false) {
		return sprintf(__('Field %s', 'mailster'), nameStr);
	} else if (!value) {
		return sprintf(__('Remove field %s.', 'mailster'), nameStr);
	} else {
		return sprintf(
			string || __('Update field %s with value %s.', 'mailster'),
			nameStr,
			valueStr
		);
	}
}

export function formatPages(pages) {
	if (!pages || !pages.length) {
		return __('No pages defined.', 'mailster');
	}

	const home_url = window.location.origin;

	const pageStr = pages.map((page) => {
		return page
			? ' <strong class="mailster-step-badge">' + page + '</strong>'
			: '';
	});

	return pageStr ? pageStr : '';
}

export function formatLinks(links) {
	if (!links || !links.length) {
		return __('No links defined.', 'mailster');
	}

	const linkStr = links.map((link) => {
		return link
			? ' <strong class="mailster-step-badge">' + link + '</strong>'
			: '';
	});

	return linkStr ? linkStr : '';
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

export function useLocalStorage(key, initialValue) {
	key = 'mailster_' + key;
	// State to store our value
	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = useState(() => {
		if (typeof window === 'undefined') {
			return initialValue;
		}
		try {
			// Get from local storage by key
			const item = window.localStorage.getItem(key);
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			// If error also return initialValue
			console.error(error);
			return initialValue;
		}
	});
	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue = (value) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			// Save state
			setStoredValue(valueToStore);
			// Save to local storage
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			// A more advanced implementation would handle the error case
			console.error(error);
		}
	};
	return [storedValue, setValue];
}

export function useSessionStorage(key, initialValue) {
	key = 'mailster_' + key;
	// State to store our value
	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = useState(() => {
		if (typeof window === 'undefined') {
			return initialValue;
		}
		try {
			// Get from local storage by key
			const item = window.sessionStorage.getItem(key);
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			// If error also return initialValue
			console.error(error);
			return initialValue;
		}
	});
	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to sessionStorage.
	const setValue = (value) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			// Save state
			setStoredValue(valueToStore);
			// Save to local storage
			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			// A more advanced implementation would handle the error case
			console.error(error);
		}
	};
	return [storedValue, setValue];
}
export const usePostTypes = () => {
	const postTypes = useSelect((select) => {
		const { getPostTypes } = select('core');
		const excludedPostTypes = ['attachment', 'newsletter'];
		const filteredPostTypes = getPostTypes({ per_page: -1 })?.filter(
			({ viewable, slug }) => viewable && !excludedPostTypes.includes(slug)
		);
		return filteredPostTypes;
	}, []);
	const postTypesTaxonomiesMap = useMemo(() => {
		if (!postTypes?.length) return;
		return postTypes.reduce((accumulator, type) => {
			accumulator[type.slug] = type.taxonomies;
			return accumulator;
		}, {});
	}, [postTypes]);
	const postTypesSelectOptions = useMemo(
		() =>
			(postTypes || []).map(({ labels, slug }) => ({
				label: labels.singular_name,
				singular: labels.singular_name,
				plural: labels.name,
				value: slug,
			})),
		[postTypes]
	);
	return { postTypesTaxonomiesMap, postTypesSelectOptions };
};
export const useTaxonomies = (postType) => {
	const taxonomies = useSelect(
		(select) => {
			const { getTaxonomies } = select('core');
			const filteredTaxonomies = getTaxonomies({
				type: postType,
				per_page: -1,
				context: 'view',
			});
			return filteredTaxonomies;
		},
		[postType]
	);
	return taxonomies;
};
export const getEntitiesInfo = (entities) => {
	const mapping = entities?.reduce(
		(accumulator, entity) => {
			const { mapById, mapByName, names } = accumulator;
			mapById[entity.id] = entity;
			mapByName[entity.name] = entity;
			names.push(entity.name);
			return accumulator;
		},
		{ mapById: {}, mapByName: {}, names: [] }
	);
	return {
		entities,
		...mapping,
	};
};

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

export function useBlockAttributes(clientId) {
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

export function useEmailSteps() {
	const steps = searchBlocks('mailster/email');

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

export function searchBlock(blockName, clientId, deep = true) {
	const all = select('core/block-editor').getBlocks(clientId);

	var found = all.find((block) => {
		return new RegExp(blockName, 'g').test(block.name);
	});

	if (found) {
		found.rootClientId = clientId;
		return found;
	} else if (deep) {
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
