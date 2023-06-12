/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */

(function () {
	'use strict';

	const addEvent = (el, type, handler) => {
		el.addEventListener(type, handler);
	};

	const removeEvent = (el, type, handler) => {
		el.removeEventListener(type, handler);
	};

	const querySelectorAll = (el, selector) => {
		return Array.prototype.slice.call(el.querySelectorAll(selector));
	};

	const querySelector = (el, selector) => {
		return el.querySelector(selector);
	};

	const windowObj = window;
	const document = windowObj.document;
	const setTimeout = windowObj.setTimeout;
	const clearTimeout = windowObj.clearTimeout;

	const CLICK = 'click';
	const SUBMIT = 'submit';
	const MOUSEOUT = 'mouseout';
	const SCROLL = 'scroll';
	const TOUCHSTART = 'touchstart';
	const MOUSEDOWN = 'mousedown';
	const MOUSEMOVE = 'mousemove';
	const KEYDOWN = 'keydown';
	const KEYUP = 'keyup';
	const KEYPRESS = 'keypress';
	const DOMCONTENTLOADED = 'DOMContentLoaded';

	// initialize instant or wait if the DOM is not loaded yet
	document.readyState === 'complete'
		? app()
		: addEvent(windowObj, DOMCONTENTLOADED, app);

	function app() {
		const html = document.documentElement;
		const forms = querySelectorAll(document, '.mailster-block-form');
		const events = windowObj.mailsterBlockEvents || {};

		Array.prototype.forEach.call(forms, (formEl) => {
			const form_el = querySelector(formEl, '.mailster-block-form-data');
			const form = JSON.parse(form_el.textContent);
			const wrap = formEl.closest('.wp-block-mailster-form-outside-wrapper');
			const closeButtons = querySelectorAll(
				wrap,
				'.mailster-block-form-close, .mailster-block-form-inner-close'
			);
			const closeButton = closeButtons[closeButtons.length - 1];
			const firstFocusable = querySelector(
				wrap,
				'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
			);
			const info = querySelector(formEl, '.mailster-block-form-info');
			const countImpressionEvery = 3600;
			const cooldown = (form.cooldown || 0) * 3600;
			const isSubmission = form.type == 'submission';
			let delayTimeout = null;
			let inactiveTimeout = null;
			const triggerMethods = {
				delay: () => {
					delayTimeout = setTimeout(() => {
						if (!show()) return;
						openForm();
					}, form.trigger_delay * 1000);
				},
				inactive: () => {
					addEvent(windowObj, MOUSEDOWN, _trigger_inactive);
					addEvent(windowObj, MOUSEMOVE, _trigger_inactive);
					addEvent(windowObj, KEYPRESS, _trigger_inactive);
					addEvent(windowObj, SCROLL, _trigger_inactive);
					addEvent(windowObj, TOUCHSTART, _trigger_inactive);
				},
				scroll: function () {
					addEvent(windowObj, SCROLL, _trigger_scroll);
					addEvent(windowObj, TOUCHSTART, _trigger_scroll);
				},
				click: () => {
					const elements = querySelectorAll(document, form.trigger_click);
					Array.prototype.forEach.call(elements, (element, i) => {
						addEvent(element, CLICK, openForm);
					});
				},
				exit: () => {
					addEvent(document, MOUSEOUT, _trigger_exit);
				},
			};

			const _trigger_inactive = debounce(_trigger_inactive_debounced, 100);
			function _trigger_inactive_debounced(event) {
				clearTimeout(inactiveTimeout);
				inactiveTimeout = setTimeout(() => {
					if (!show()) return;
					openForm();
				}, form.trigger_inactive * 1000);
			}
			const _trigger_scroll = debounce(_trigger_scroll_debounced, 50);
			function _trigger_scroll_debounced(event) {
				if (getScrollPercent() >= form.trigger_scroll / 100) {
					if (!show()) return;
					openForm();
				}
			}

			function _trigger_exit(event) {
				if (!event.toElement && !event.relatedTarget) {
					if (!show()) return;
					openForm();
				}
			}

			function formSubmit(event) {
				event.preventDefault();

				let formData = new FormData(formEl),
					data = {},
					message = [],
					submit = querySelector(formEl, '.submit-button'),
					infoSuccess = querySelector(
						info,
						'.mailster-block-form-info-success'
					),
					infoError = querySelector(info, '.mailster-block-form-info-error');

				//formEl.classList.remove('has-errors');
				formEl.classList.remove('completed');
				querySelectorAll(formEl, '.is-error').forEach((wrapper) => {
					wrapper.classList.remove('is-error');
				});
				querySelectorAll(formEl, '[aria-invalid]').forEach((input) => {
					input.removeAttribute('aria-invalid');
				});

				formEl.classList.add('loading');
				formEl.setAttribute('disabled', true);

				if (
					document.referrer &&
					new URL(document.referrer).origin !== document.location.origin
				) {
					formData.append('_referer', document.referrer);
				} else {
					formData.append('_referer', document.location.href);
				}
				let lists = formData.getAll('_lists[]');
				if (!lists.length) {
					formData.append('_lists[]', []);
				}

				let v;
				for (let key of formData.keys()) {
					if (key == '_lists[]') {
						v = lists;
						key = key.replace('[]', '');
					} else {
						v = formData.get(key);
					}

					data[key] = v;
				}

				apiFetch({
					path: 'mailster/v1/forms/' + form.id + '/' + form.type,
					method: isSubmission ? 'POST' : 'PATCH',
					data: data,
				})
					.then((response) => {
						set('conversion');
						triggerEvent('submit', {
							...response.data,
							formdata: data,
						});

						info.classList.remove('is-error');
						formEl.classList.remove('has-errors');

						if (isSubmission && response.data.redirect) {
							setTimeout(() => (location.href = response.data.redirect), 150);
							return;
						}

						if (response.message) {
							message.push(response.message);
						}

						if (message.length) infoSuccess.innerHTML = message.join('<br>');
						info.setAttribute('role', 'alert');
						info.classList.add('is-success');

						if (isSubmission) {
							formEl.classList.add('completed');
							document.activeElement.blur();

							triggerEvent('complete', {
								...response.data,
								formdata: data,
							});

							form.triggers &&
								setTimeout(() => {
									closeForm();
									formEl.reset();
								}, 3000);
						}
					})
					.catch((error) => {
						if (error.data.fields) {
							formEl.classList.add('has-errors');
							Object.keys(error.data.fields).map((fieldid) => {
								const selector =
										'.wp-block-mailster-' +
										fieldid +
										', .wp-block-mailster-field-' +
										fieldid,
									field = querySelector(formEl, selector),
									hintid = 'hint-' + form.identifier + '-' + fieldid;

								if (field) {
									const input = querySelector(field, 'input, select, textarea');
									input.setAttribute('aria-invalid', 'true');
									input.setAttribute('aria-describedby', hintid);
									field.classList.add('is-error');
								}
								let m =
									field?.dataset?.errorMessage || error.data.fields[fieldid];

								console.error('[' + fieldid + ']', m);
								message.push(
									'<div id="' + hintid + '" role="alert">' + m + '</div>'
								);
							});
						}
						info.classList.remove('is-success');
						info.classList.add('is-error');
						infoError.innerHTML = message.join('');
						triggerEvent('error', {
							...error.data,
							formdata: data,
						});
					})
					.finally(() => {
						set('show');
						formEl.classList.remove('loading');
						formEl.removeAttribute('disabled');
						submit.removeAttribute('disabled');
						info.setAttribute('aria-hidden', 'false');
					});
			}

			function show() {
				//always show on preview
				if (form.isPreview) {
					return true;
				}

				if (get('conversion')) {
					return false;
				}

				if (inTimeFrame('closed', cooldown)) {
					return false;
				}

				// if (inTimeFrame('show', form.delay)) {
				// 	return false;
				// }

				return true;
			}

			function inTimeFrame(key, delay) {
				return !(get(key, 0) < +new Date() - delay * 1000);
			}

			function openForm(event) {
				if (wrap && !wrap.classList.contains('active')) {
					clearTimeout(delayTimeout);
					clearTimeout(inactiveTimeout);
					removeEventListeners();

					addEvent(document, KEYUP, closeOnEsc);
					addEvent(document, KEYDOWN, handleKeyEvents);
					setTimeout(() => addEvent(wrap, CLICK, closeFormExplicit), 1500);

					closeButtons.forEach((btn) =>
						addEvent(btn, CLICK, closeFormExplicit)
					);
					addEvent(formEl, CLICK, stopPropagation);

					wrap.classList.add('active');
					info.classList.remove('is-success');
					formEl.classList.remove('completed');
					wrap.setAttribute('aria-hidden', 'false');
					wrap.focus();
					html.classList.add('mailster-form-active');

					if (event && event.type === CLICK) {
						event.preventDefault();
						firstFocusable.focus();
					}
					triggerEvent('open');
					countImpression();
				}
			}

			function removeEventListeners() {
				removeEvent(document, MOUSEOUT, _trigger_exit);
				removeEvent(windowObj, SCROLL, _trigger_scroll);
				removeEvent(windowObj, TOUCHSTART, _trigger_scroll);
				removeEvent(windowObj, MOUSEDOWN, _trigger_inactive);
				removeEvent(windowObj, MOUSEMOVE, _trigger_inactive);
				removeEvent(windowObj, KEYPRESS, _trigger_inactive);
				removeEvent(windowObj, MOUSEMOVE, _trigger_inactive);
				removeEvent(windowObj, SCROLL, _trigger_inactive);
				removeEvent(windowObj, TOUCHSTART, _trigger_inactive);
			}

			function closeForm() {
				removeEvent(document, KEYUP, closeOnEsc);
				removeEvent(document, KEYDOWN, handleKeyEvents);
				removeEvent(wrap, CLICK, closeForm);
				removeEvent(wrap, CLICK, closeFormExplicit);
				closeButtons.forEach((btn) =>
					removeEvent(btn, CLICK, closeFormExplicit)
				);
				removeEvent(formEl, CLICK, stopPropagation);

				wrap.classList.add('closing');
				html.classList.remove('mailster-form-active');

				triggerEvent('close');

				setTimeout(() => {
					wrap.classList.remove('closing');
					wrap.classList.remove('active');
					wrap.setAttribute('aria-hidden', 'true');
				}, 500);
			}

			function closeFormExplicit(event) {
				event && event.preventDefault();
				closeForm();
				set('closed');
			}

			function closeOnEsc(event) {
				if (event.key === 'Escape' || event.keyCode == 27) {
					closeFormExplicit();
				}
			}

			function handleKeyEvents(event) {
				if (event.key === 'Tab' || event.keyCode === 9) {
					// select close button when using tab navigation on the first element
					if (firstFocusable === event.target && event.shiftKey) {
						closeButton.focus();
						event.preventDefault();
					}
					// select first element when close button is focused
					if (closeButton === event.target && !event.shiftKey) {
						firstFocusable.focus();
						event.preventDefault();
					}
				}
				//prevent close buttons from submitting the form
				if (event.key === 'Enter' || event.keyCode == 13) {
					formSubmit(event);
					event.preventDefault();
				}
			}

			function set(key, value) {
				if (!isSubmission) return null;
				return storage(form.identifier, key, value || +new Date());
			}

			function get(key, fallback = null) {
				if (!isSubmission) return null;
				let data = storage(form.identifier, key);
				if (!data) {
					return fallback;
				}
				return data;
			}

			function countImpression() {
				if (form.isPreview || !isSubmission) {
					return false;
				}
				if (!inTimeFrame('impression', countImpressionEvery)) {
					apiFetch({
						path: 'mailster/v1/forms/' + form.id + '/impression',
						method: 'POST',
						data: form,
					})
						.catch((error) => {
							error.message && console.error(error.message);
						})
						.finally(() => {
							triggerEvent('impression');
							set('impression');
						});
				}
			}

			function triggerEvent(name, data) {
				const detail = {
					type: name,
					el: formEl,
					form: form,
					data: data,
				};
				const event = new CustomEvent('mailster:' + name, {
					bubbles: true,
					detail,
				});

				detail['event'] = event;

				if (events[form.id] && events[form.id][name]) {
					events[form.id][name].apply(detail);
				}

				return formEl.dispatchEvent(event);
			}

			if (form) {
				if (form.triggers) {
					form.triggers.forEach((trigger) => {
						triggerMethods[trigger] && triggerMethods[trigger].call(this);
					});
					wrap.classList.add(
						rgb2Contrast(
							windowObj
								.getComputedStyle(wrap, '')
								.getPropertyValue('background-color')
						)
					);
				} else {
					const observer = new IntersectionObserver(
						(entries) => {
							if (entries[0].isIntersecting) {
								countImpression();
								observer.unobserve(entries[0].target);
							}
						},
						{ threshold: 1 }
					);
					observer.observe(formEl);
					triggerEvent('load');
				}

				if (!isSubmission) {
					formEl.classList.add('loading', 'silent');
					formEl.setAttribute('disabled', true);

					apiFetch({
						path: 'mailster/v1/forms/' + form.id + '/data',
						method: 'GET',
					})
						.then((response) => {
							for (const property in response.data) {
								const el = querySelector(formEl, '[name="' + property + '"]');
								const val = response.data[property];
								if (el && val) {
									switch (el.type) {
										case 'checkbox':
											el.checked = !!val;
											break;
										case 'radio':
											const rel = querySelectorAll(
												formEl,
												'[name="' + property + '"]'
											);
											for (let i = 0; i < rel.length; i++) {
												rel[i].checked = rel[i].value == val;
											}
											break;

										default:
											el.value = val;
											break;
									}
								}
							}

							if (response.lists) {
								const lists = querySelectorAll(formEl, '[name="_lists[]"]');
								for (let i = 0; i < lists.length; i++) {
									lists[i].checked = response.lists.includes(lists[i].value);
								}
							}
						})
						.catch((error) => {})
						.finally(() => {
							formEl.classList.remove('loading', 'silent');
							formEl.removeAttribute('disabled');
							info.setAttribute('aria-hidden', 'false');
						});
				}
			}

			addEvent(formEl, SUBMIT, formSubmit);
		});
	}

	function stopPropagation(event) {
		event.stopPropagation();
	}

	function getScrollPercent() {
		scroll.el = scroll.el || html;
		scroll.body = scroll.body || document.body;

		return (
			(scroll.el['scrollTop'] || scroll.body['scrollTop']) /
			((scroll.el['scrollHeight'] || scroll.body['scrollHeight']) -
				scroll.el.clientHeight)
		);
	}

	function debounce(func, wait, immediate) {
		let timeout;

		return () => {
			let context = this;
			let args = arguments;

			let later = () => {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);
				}
			};

			let callNow = immediate && !timeout;

			clearTimeout(timeout);

			timeout = setTimeout(later, wait);

			if (callNow) {
				func.apply(context, args);
			}
		};
	}

	function rgb2Contrast(rgb) {
		let c = rgb.match(
			/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/
		);
		let yiq = (c[1] * 299 + c[2] * 587 + c[3] * 114) / 1000;
		return yiq >= 128 ? 'is-light-bg' : 'is-dark-bg';
	}

	function storageWithLocalStorage(identifier, key, value) {
		const global_key = 'mailster-form-' + identifier;

		if (typeof value !== 'undefined') {
			const data = storageWithLocalStorage(identifier) || {};
			data[key] = value;
			windowObj.localStorage.setItem(global_key, JSON.stringify(data));
		} else {
			const store = JSON.parse(windowObj.localStorage.getItem(global_key));
			if (!key) {
				return store;
			}
			return store && store[key] ? store[key] : null;
		}
	}

	function storageWithWindowVariables(identifier, key, value) {
		const global_key = 'mailster_form_' + identifier;
		const store = windowObj[global_key] || {};

		if (typeof value !== 'undefined') {
			store[key] = value;
			windowObj[global_key] = store;
		} else {
			if (!key) {
				return store;
			}
			return store[key];
		}
	}

	function storage(identifier, key, value) {
		try {
			const test = '__test__';
			// Try to access localStorage to see if it's available
			windowObj.localStorage.setItem(test, test);
			windowObj.localStorage.removeItem(test);
			// throw new Error('localStorage is available');
			storage = storageWithLocalStorage;
		} catch (e) {
			// If localStorage is not available, fallback to using variables
			storage = storageWithWindowVariables;
		}

		return storage(identifier, key, value);
	}
})();
