# Mailster Block Forms

Contributors: everpress, mailster, xaverb  
Tags: mailster, blocks, forms, mailsterblockforms  
Requires at least: 6.0  
Tested up to: 6.5  
Stable tag: 0.4.1
Requires PHP: 7.2.5+  
License: GPLv2 or later  
Author: EverPress  
Author URI: <https://mailster.co>

## Description

Create newsletter signup forms for [Mailster](https://mailster.co/?utm_campaign=wporg&utm_source=wordpress.org&utm_medium=readme&utm_term=Mailster+Block+Forms) with the block editor.

**Read the [documentation](https://docs.mailster.co/#/block-forms-overview)**

> **This is a BETA feature and requires a dedicate plugin. Some features are subject to change before the stable release. Please submit your [feedback on Github](https://github.com/everpress-co/mailster-block-forms/issues)**

## Installation

1. Upload the entire `mailster-block-forms` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to Newsletter => Block Forms
4. Click on "add New" to create a new form.

## Screenshots

### 1. Block Editor Overview

![Block Editor Overview](https://ps.w.org/mailster-block-forms/assets/screenshot-1.png)

### 2. Form Pattern Selector

![Form Pattern Selector](https://ps.w.org/mailster-block-forms/assets/screenshot-2.png)

## Frequently Asked Questions

### Can I use this as a stand alone plugin?

No, Mailster 3.2.0 or above is required to use this plugin. Get it [here](https://mailster.co/?utm_campaign=wporg&utm_source=wordpress.org&utm_medium=readme&utm_term=Mailster+Block+Forms).

## Changelog

## 0.4.1

- updated blocks to API version 3
- better caching for frontend queries
- added new form pattern

## 0.4.0

- RC 2!
- fixed: editor problems on WordPress 6.3 with iframed editor
- improved: inline style mechanism
- improved: honey pot mechanism

## 0.3.1

- fixed: form submission works again by using return key
- fixed: error when localStorage is not avialable
- improved: inline style mechanism

## 0.3.0

- RC 1: We'll soon merge this into the core plugin!
- change: changed the post type from `newsletter_form` to `mailster-form`
- improved: performance in the editor by preventing unnecessary re-renders
- new: 2 patterns added
- improved: updated existing patterns
- added: support for textareas from custom fields
- change: move styling options to styling section in the inspector if feasible
- improved: inline styles are now also updated if form is used on other pages
- improved: forms can now get submitted if no submit button is present
- improved: removed some CSS effects for accessibility

## 0.2.2

- fixed: invalid method in shortcode callback

## 0.2.1

- new: 6 new form patterns
- new: option for fullscreen background image
- new: support for Elementor with a dedicate widget
- fixed: user choice of lists were disabled if switching from code view back to editor view
- improved storing of block attributes

## 0.2.0

- new: newsletter homepage block (<https://kb.mailster.co/convert-your-newsletter-homepage/>)
- fixed: proper removing of GDPR block
- change: endpoint for form submission
- improved: renamed internal methods
- reverted: form name is now back in the options panel
- preparations for Mailster 4.0

## 0.1.9

- improved: rendering of compontents
- improved: css for latest WordPress version
- improved: frontend script to make it more relyable
- improved: frontend storage selector now working if localStorage is not available
- improved: Form and Input styles panel is now collapsable again
- improved: auto block recovery now works with nested blocks
- fixed: CSS and Events code editor now working correctly
- change: Form name is now a dedicate section and not collapsable
- update: display Mailster admin header with Mailster 3.3.3

### 0.1.8

- new filter `mailster_block_form_field_errors` for third parties
- new `mailster_block_form` filter containing form html
- new 'load' trigger on forms
- fixed: check referrer to prevent errors if it's not defined

### 0.1.7

- fixed: display issue of cover block in forms with WP 6.1 and Gutenberg 14.2+
- fixed: message block are not added correctly with WP 6.1 and Gutenberg 14.2+

### 0.1.6

- new: define custom JavaScript code to get triggered on certain form events.
- fixed: unable to change the value of the scroll trigger threshold.
- fixed: don't scroll to bottom of page in preview pane if form has not been saved for the first time.
- fixed: excerpt was empty on archive page if form was used in content.
- improved: accessibility on form submission messages (may require form updates).
- improved: close button accessibility.
- redirection after form submission now delayed for 150ms to complete all remote events.
- updated: referrer is now the current page if no the referrer is from the same origin.
- padding for popups in preview panel is not unset by default.

### 0.1.5

- updated cool down method (Please update this settings in the Appearance menu)
- using fieldsets for accessibility
- use preventDefault on button click to prevent default behavior
- preview improvements

### 0.1.4

- tab now iterates through elements for accessibility.
- fixed: close button wasn't visible on some mobile devices

### 0.1.3

- new block with a close link to close the popup
- improved accessibility on close buttons
- re-enabled kses filter on HTML output

### 0.1.2

- fixed: classic editor is shown if classic editor plugin is enabled
- improved: validation of post message in preview modal
- fixed: always load form data even on preview screen

### 0.1.1

- added option to change to alignment of form fields

### 0.1.0

- initial release

## Additional Info

> This Plugin requires [Mailster Newsletter Plugin for WordPress](https://mailster.co/?utm_campaign=wporg&utm_source=wordpress.org&utm_medium=readme&utm_term=Mailster+Block+Forms)
