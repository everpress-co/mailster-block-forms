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

	// initialize instant or wait if the DOM is not loaded yet
	document.readyState === 'complete'
		? app()
		: window.addEventListener('DOMContentLoaded', app);

	function app() {
		let html = document.documentElement;
		let forms = document.querySelectorAll('.mailster-block-form');
		let events = window.mailsterBlockEvents || {};

		Array.prototype.forEach.call(forms, (formEl, i) => {
			let form = formEl.querySelector('.mailster-block-form-data');
			form = JSON.parse(form.textContent);
			let wrap = formEl.closest('.wp-block-mailster-form-outside-wrapper');
			let closeButtons = wrap.querySelectorAll(
				'.mailster-block-form-close, .mailster-block-form-inner-close'
			);
			let closeButton = closeButtons[closeButtons.length - 1];
			let firstFocusable = wrap.querySelector(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			let info = formEl.querySelector('.mailster-block-form-info');
			let countImpressionEvery = 3600;
			let cooldown = (form.cooldown || 0) * 3600;
			let scroll = {};
			let delayTimeout = null;
			let inactiveTimeout = null;
			let triggerMethods = {
				delay: () => {
					delayTimeout = setTimeout(() => {
						if (!show()) return;
						openForm();
					}, form.trigger_delay * 1000);
				},
				inactive: () => {
					window.addEventListener('mousedown', _trigger_inactive);
					window.addEventListener('mousemove', _trigger_inactive);
					window.addEventListener('keypress', _trigger_inactive);
					window.addEventListener('mousemove', _trigger_inactive);
					window.addEventListener('scroll', _trigger_inactive);
					window.addEventListener('touchstart', _trigger_inactive);
				},
				scroll: function () {
					window.addEventListener('scroll', _trigger_scroll);
					window.addEventListener('touchstart', _trigger_scroll);
				},
				click: () => {
					let elements = document.querySelectorAll(form.trigger_click);
					Array.prototype.forEach.call(elements, (element, i) => {
						element.addEventListener('click', openForm);
					});
				},
				exit: () => {
					document.addEventListener('mouseout', _trigger_exit);
				},
			};

			let _trigger_inactive = debounce(_trigger_inactive_debounced, 100);
			function _trigger_inactive_debounced(event) {
				clearTimeout(inactiveTimeout);
				inactiveTimeout = setTimeout(() => {
					if (!show()) return;
					openForm();
				}, form.trigger_inactive * 1000);
			}
			let _trigger_scroll = debounce(_trigger_scroll_debounced, 50);
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

			if (form) {
				if (form.triggers) {
					form.triggers.forEach((trigger) => {
						triggerMethods[trigger] && triggerMethods[trigger].call(this);
					});
					wrap.classList.add(
						rgb2Contrast(
							window
								.getComputedStyle(wrap, '')
								.getPropertyValue('background-color')
						)
					);
				} else {
					let observer = new IntersectionObserver(
						(entries) => {
							if (entries[0].isIntersecting) {
								countImpression();
								observer.unobserve(entries[0].target);
							}
						},
						{
							threshold: 1,
						}
					);
					observer.observe(formEl);
					triggerEvent('load');
				}
			}

			formEl.addEventListener('submit', (event) => {
				event.preventDefault();

				let formData = new FormData(formEl),
					data = {},
					message = [],
					submit = formEl.querySelector('.submit-button'),
					infoSuccess = info.querySelector(
						'.mailster-block-form-info-success .mailster-block-form-info-extra'
					),
					infoError = info.querySelector(
						'.mailster-block-form-info-error .mailster-block-form-info-extra'
					);

				formEl.classList.remove('has-errors');
				formEl.classList.remove('completed');
				formEl.querySelectorAll('.is-error').forEach((wrapper) => {
					wrapper.classList.remove('is-error');
				});
				formEl.querySelectorAll('[aria-invalid]').forEach((input) => {
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

				for (let key of formData.keys()) {
					data[key] = formData.get(key);
				}

				apiFetch({
					path: 'mailster/v1/subscribe',
					method: 'POST',
					data: data,
				})
					.then((response) => {
						set('conversion');
						triggerEvent('submit', {
							...response.data,
							formdata: data,
						});

						info.classList.remove('is-error');

						if (response.data.redirect) {
							setTimeout(() => (location.href = response.data.redirect), 150);
							return;
						}

						infoSuccess.innerHTML = message.join('<br>');
						info.setAttribute('role', 'alert');
						info.classList.add('is-success');

						if (!formEl.classList.contains('is-profile')) {
							formEl.classList.add('completed');
							formEl.reset();
							document.activeElement.blur();
							form.triggers && setTimeout(() => closeForm(), 3000);
						}
					})
					.catch((error) => {
						if (error.data.fields) {
							formEl.classList.add('has-errors');
							Object.keys(error.data.fields).map((fieldid) => {
								let field = formEl.querySelector(
										'.wp-block-mailster-' +
											fieldid +
											', .wp-block-mailster-field-' +
											fieldid
									),
									hintid = 'h-' + form.identifier + '-' + fieldid,
									input;
								if (field) {
									input = field.querySelector('input');
									input.setAttribute('aria-invalid', 'true');
									input.setAttribute('aria-describedby', hintid);
									field.classList.add('is-error');
								}
								let m =
									field?.dataset?.errorMessage || error.data.fields[fieldid];

								console.error('[' + fieldid + ']', m);
								message.push(
									'<span id="' + hintid + '" role="alert">' + m + '</span>'
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
			});

			function show() {
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

					document.addEventListener('keyup', closeOnEsc);
					document.addEventListener('keydown', handleTab);
					setTimeout(
						() => wrap.addEventListener('click', closeFormExplicit),
						1500
					);

					closeButtons.forEach((btn) =>
						btn.addEventListener('click', closeFormExplicit)
					);
					formEl.addEventListener('click', stopPropagation);

					wrap.classList.add('active');
					info.classList.remove('is-success');
					formEl.classList.remove('completed');
					wrap.setAttribute('aria-hidden', 'false');
					wrap.focus();
					html.classList.add('mailster-form-active');

					if (event && event.type === 'click') {
						event.preventDefault();
						firstFocusable.focus();
					}
					triggerEvent('open');
					countImpression();
				}
			}

			function removeEventListeners() {
				document.removeEventListener('mouseout', _trigger_exit);
				window.removeEventListener('scroll', _trigger_scroll);
				window.removeEventListener('touchstart', _trigger_scroll);
				window.removeEventListener('mousedown', _trigger_inactive);
				window.removeEventListener('mousemove', _trigger_inactive);
				window.removeEventListener('keypress', _trigger_inactive);
				window.removeEventListener('mousemove', _trigger_inactive);
				window.removeEventListener('scroll', _trigger_inactive);
				window.removeEventListener('touchstart', _trigger_inactive);
			}

			function closeForm() {
				document.removeEventListener('keyup', closeOnEsc);
				document.removeEventListener('keydown', handleTab);
				wrap.removeEventListener('click', closeForm);
				wrap.removeEventListener('click', closeFormExplicit);
				closeButtons.forEach((btn) =>
					btn.removeEventListener('click', closeFormExplicit)
				);
				formEl.removeEventListener('click', stopPropagation);

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

			function handleTab(event) {
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
			}

			function set(key, value) {
				let data = get();
				data[key] = value || +new Date();
				localStorage.setItem(
					'mailster-form-' + form.identifier,
					JSON.stringify(data)
				);
				return true;
			}

			function get(key, fallback = null) {
				let store = localStorage.getItem('mailster-form-' + form.identifier);
				store = store ? JSON.parse(store) : {};
				if (!key) {
					return store;
				}
				if (store[key]) {
					return store[key];
				}
				return fallback;
			}

			function countImpression() {
				if (form.isPreview) {
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
		});
	}

	function stopPropagation(event) {
		event.stopPropagation();
	}

	function getScrollPercent() {
		scroll.el = scroll.el || document.documentElement;
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
})();
