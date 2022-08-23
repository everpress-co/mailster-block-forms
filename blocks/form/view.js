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
		let body = document.querySelector('body');
		let forms = document.querySelectorAll('.mailster-block-form');

		Array.prototype.forEach.call(forms, (form, i) => {
			let placement = form.querySelector('.mailster-block-form-data');
			placement = JSON.parse(placement.textContent);

			let wrap = form.closest('.wp-block-mailster-form-outside-wrapper');
			let isPopup = !!wrap.getAttribute('aria-modal');
			let closeButton = wrap.querySelector('.mailster-block-form-close');
			let storageTime = 60; // seconds
			let countImpressionEvery = 60;
			let scroll = {};
			let delayTimeout = null;
			let inactiveTimeout = null;
			let triggerMethods = {
				delay: () => {
					delayTimeout = setTimeout(() => {
						if (!show()) return;
						openForm();
					}, placement.trigger_delay * 1000);
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
					let elements = document.querySelectorAll(
						placement.trigger_click
					);
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
				}, placement.trigger_inactive * 1000);
			}
			let _trigger_scroll = debounce(_trigger_scroll_debounced, 50);
			function _trigger_scroll_debounced(event) {
				if (getScrollPercent() >= placement.trigger_scroll / 100) {
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

			if (placement) {
				if (isPopup) {
					placement.triggers.forEach((trigger) => {
						triggerMethods[trigger] &&
							triggerMethods[trigger].call(this);
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
					observer.observe(form);
				}
			}

			form.addEventListener('submit', (event) => {
				event.preventDefault();

				let formData = new FormData(form),
					data = {},
					message = [],
					info = form.querySelector('.mailster-block-form-info'),
					submit = form.querySelector('.submit-button'),
					infoSuccess = info.querySelector(
						'.mailster-block-form-info-success .mailster-block-form-info-extra'
					),
					infoError = info.querySelector(
						'.mailster-block-form-info-error .mailster-block-form-info-extra'
					);

				form.classList.remove('has-errors');
				form.classList.remove('completed');
				form.querySelectorAll('.is-error').forEach((wrapper) => {
					wrapper.classList.remove('is-error');
				});
				form.querySelectorAll('[aria-invalid]').forEach((input) => {
					input.removeAttribute('aria-invalid');
				});

				form.classList.add('loading');
				form.setAttribute('disabled', true);

				formData.append('_referer', document.referrer);

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

						info.classList.remove('is-error');

						if (response.data.redirect) {
							window.location.href = response.data.redirect;
							return;
						}

						info.classList.add('is-success');

						infoSuccess.innerHTML = message.join('<br>');

						if (!form.classList.contains('is-profile')) {
							form.classList.add('completed');
							form.reset();
						}
					})
					.catch((error) => {
						if (error.data.fields) {
							form.classList.add('has-errors');
							Object.keys(error.data.fields).map((fieldid) => {
								let field = form.querySelector(
									'.wp-block-mailster-' +
										fieldid +
										', .wp-block-mailster-field-' +
										fieldid
								);
								let input = field.querySelector('input');
								let hintid =
									'hint-' +
									placement.identifier +
									'-' +
									input.id;
								let m =
									field?.dataset?.errorMessage ||
									error.data.fields[fieldid];

								input.setAttribute('aria-invalid', 'true');
								input.setAttribute('aria-describedby', hintid);
								console.error('[' + fieldid + ']', m);
								message.push(
									'<span id="' +
										hintid +
										'" role="alert">' +
										m +
										'</span>'
								);

								field && field.classList.add('is-error');
							});
						}
						info.classList.remove('is-success');
						info.classList.add('is-error');
						infoError.innerHTML = message.join('');
					})
					.finally(() => {
						set('show');
						form.classList.remove('loading');
						form.removeAttribute('disabled');
						submit.removeAttribute('disabled');
						info.setAttribute('aria-hidden', 'false');
					});
			});

			function show(delay) {
				if (placement.isPreview) {
					return true;
				}

				if (get('conversion')) {
					return false;
				}

				if (inTimeFrame('closed', 3600)) {
					return false;
				}

				// if (inTimeFrame('show', placement.delay)) {
				// 	return false;
				// }

				return true;
			}

			function inTimeFrame(key, delay) {
				return !(
					get(key, 0) <
					+new Date() - (delay ? delay : storageTime) * 1000
				);
			}

			function openForm() {
				if (wrap && !wrap.classList.contains('active')) {
					clearTimeout(delayTimeout);
					clearTimeout(inactiveTimeout);
					removeEventListeners();

					document.addEventListener('keyup', closeOnEsc);

					//wrap.addEventListener('click', closeFormExplicit);
					closeButton.addEventListener('click', closeFormExplicit);
					form.addEventListener('click', stopPropagation);

					wrap.classList.add('active');
					wrap.setAttribute('aria-hidden', 'false');
					body.classList.add('mailster-form-active');
					body.setAttribute('aria-hidden', 'true');

					if (event && event.type === 'click') {
						form.querySelector('input.input').focus();
					} else {
						document.addEventListener('keydown', handleTab);
					}
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
				closeButton.removeEventListener('click', closeForm);
				form.removeEventListener('click', stopPropagation);

				wrap.classList.remove('active');
				wrap.setAttribute('aria-hidden', 'true');
				body.classList.remove('mailster-form-active');
				body.setAttribute('aria-hidden', 'false');
			}

			function closeFormExplicit(event) {
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
					wrap.focus();
					//event.preventDefault();
					document.removeEventListener('keydown', handleTab);
				}
			}

			function set(key, value) {
				let data = get();
				data[key] = value || +new Date();
				localStorage.setItem(
					'mailster-form-' + placement.identifier,
					JSON.stringify(data)
				);
				return true;
			}

			function get(key, fallback = null) {
				let store = localStorage.getItem(
					'mailster-form-' + placement.identifier
				);
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
				if (placement.isPreview) {
					return false;
				}
				if (!inTimeFrame('impression', countImpressionEvery)) {
					apiFetch({
						path:
							'mailster/v1/forms/' + placement.id + '/impression',
						method: 'POST',
						data: placement,
					})
						.catch((error) => {
							error.message && console.warn(error.message);
						})
						.finally(() => {
							set('impression');
						});
				}
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

	function _trigger(event, data) {
		data = data ? { detail: data } : null;
		return document.dispatchEvent(new CustomEvent(event, data));
	}
})();
