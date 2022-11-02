# Mailster Block Forms

Contributors: everpress, xaverb  
Tags: mailster, blocks, forms, mailsterblockforms  
Requires at least: 6.0  
Tested up to: 6.1  
Stable tag: 0.1.7  
Requires PHP: 7.2.5+  
License: GPLv2 or later  
Author: EverPress  
Author URI: https://mailster.co

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

### 0.1.7

-   fixed: display issue of cover block in forms with WP 6.1 and Gutenberg 14.2+
-   fixed: message block are not added correctly with WP 6.1 and Gutenberg 14.2+

### 0.1.6

-   new: define custom JavaScript code to get triggered on certain form events.
-   fixed: unable to change the value of the scroll trigger threshold.
-   fixed: don't scroll to bottom of page in preview pane if form has not been saved for the first time.
-   fixed: excerpt was empty on archive page if form was used in content.
-   improved: accessibility on form submission messages (may require form updates).
-   improved: close button accessibility.
-   redirection after form submission now delayed for 150ms to complete all remote events.
-   updated: referrer is now the current page if no the referrer is from the same origin.
-   padding for popups in preview panel is not unset by default.

### 0.1.5

-   updated cool down method (Please update this settings in the Appearance menu)
-   using fieldsets for accessibility
-   use preventDefault on button click to prevent default behavior
-   preview improvements

### 0.1.4

-   tab now iterates through elements for accessibility.
-   fixed: close button wasn't visible on some mobile devices

### 0.1.3

-   new block with a close link to close the popup
-   improved accessibility on close buttons
-   re-enabled kses filter on HTML output

### 0.1.2

-   fixed: classic editor is shown if classic editor plugin is enabled
-   improved: validation of post message in preview modal
-   fixed: always load form data even on preview screen

### 0.1.1

-   added option to change to alignment of form fields

### 0.1.0

-   initial release

## Additional Info

> This Plugin requires [Mailster Newsletter Plugin for WordPress](https://mailster.co/?utm_campaign=wporg&utm_source=wordpress.org&utm_medium=readme&utm_term=Mailster+Block+Forms)
