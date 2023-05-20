<?php
/**
Plugin Name: Mailster Block Forms
Plugin URI: https://mailster.co/?utm_campaign=wporg&utm_source=wordpress.org&utm_medium=plugin&utm_term=Mailster+Block+Forms
Description: Create Mailster forms with the block editor
Version: 0.2.2
Author: EverPress
Author URI: https://mailster.co
Text Domain: mailster-block-forms
License: GPLv2 or later
 */

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

define( 'MAILSTER_FORM_BLOCK_DIR', plugin_dir_path( __FILE__ ) );
define( 'MAILSTER_FORM_BLOCK_URI', plugin_dir_url( __FILE__ ) );


function mailster_block_forms_add_class( $classes ) {
	global $mailster_block_forms;
	$classes['block-forms'] = $mailster_block_forms;
	return $classes;
}
add_filter( 'mailster_classes', 'mailster_block_forms_add_class' );

function mailster_block_forms_table_structure( $structure, $collate ) {

	global $wpdb;
	$structure[] = "CREATE TABLE {$wpdb->prefix}mailster_form_actions (
                `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `form_id` bigint(20) unsigned NOT NULL,
                `post_id` bigint(20) unsigned NOT NULL,
                `subscriber_id` bigint(20) unsigned NULL DEFAULT NULL,
                `timestamp` int(11) NOT NULL DEFAULT 0,
                `type` tinyint(1) unsigned NOT NULL,
                PRIMARY KEY  (`ID`)
            ) $collate;";
	return $structure;

}
add_action( 'mailster_table_structure', 'mailster_block_forms_table_structure', 10, 2 );


function mailster_block_forms_add_admin_css() {
	wp_add_inline_style(
		'admin-menu',
		"#menu-posts-newsletter
			a[href='edit.php?post_type=mailster-form']::after {
				content: 'RC 1';
				display: inline-block;
				vertical-align: top;
				box-sizing: border-box;
				margin: 1px 5px -1px 5px;
				padding: 0 5px;
				min-width: 18px;
				height: 18px;
				border-radius: 9px;
				background-color: #d63638;
				color: #fff;
				font-size: 11px;
				line-height: 1.6;
				text-align: center;
				z-index: 26;
			}"
	);
}
add_action( 'admin_enqueue_scripts', 'mailster_block_forms_add_admin_css' );

function mailster_block_forms_change_menu_position() {
	global $submenu;
	if ( ! isset( $submenu['edit.php?post_type=newsletter'] ) ) {
		return;
	}
	$entry = $submenu['edit.php?post_type=newsletter'][12];
	unset( $submenu['edit.php?post_type=newsletter'][12] );
	$submenu['edit.php?post_type=newsletter'][] = $entry;
}
// add_action( 'admin_menu', 'mailster_block_forms_change_menu_position', 30 );


function mailster_block_forms_activate() {
	if ( ! function_exists( 'mailster' ) ) {
		die( 'Please enable the <a href="https://mailster.co" target="_blank">Mailster Newsletter Plugin</a> to use this plugin!' );
	}

	if ( version_compare( MAILSTER_VERSION, '3.2' ) < 0 ) {
		die( 'Mailster Block Forms require Mailster version 3.2.0 or above. Please update Mailster first!' );
	}

	update_option( 'mailster_inline_styles', '', 'no' );
	mailster()->dbstructure();

}
register_activation_hook( __FILE__, 'mailster_block_forms_activate' );


function mailster_block_forms_deactivate() {
	delete_option( 'mailster_inline_styles' );
}
register_deactivation_hook( __FILE__, 'mailster_block_forms_deactivate' );


function mailster_block_forms_register_settings() {

	register_setting(
		'mailster_settings',
		'mailster_inline_styles',
		array(
			'description'  => 'contains the styles of your sites input fields',
			'show_in_rest' => true,
			'type'         => 'string',
		)
	);

}
add_action( 'rest_api_init', 'mailster_block_forms_register_settings' );


function mailster_block_forms_verify_subscriber( $entry ) {
	return $entry;
}
add_filter( 'mailster_verify_subscriber', 'mailster_block_forms_verify_subscriber' );


function mailster_block_forms_change_post_type_name() {
	global $wpdb;

	// change the post type of the forms
	$wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->posts} SET `post_type` = %s WHERE post_type = %s", 'mailster-form', 'newsletter_form' ) );
}

function mailster_block_forms_filter( $content, $template, $subscriber, $options ) {

	if ( $template != 'confirmation' ) {
		return $content;
	}

	$form_id = mailster( 'subscribers' )->meta( $subscriber->ID, 'form' );
	$form    = get_post( $form_id );

	if ( ! $form || $form->post_type != 'mailster-form' ) {
		return $content;
	}

	$current_filter = current_filter();

	switch ( $current_filter ) {
		case 'mailster_notification_headline':
			return get_post_meta( $form_id, 'headline', true );
		case 'mailster_notification_subject':
			return get_post_meta( $form_id, 'subject', true );
		case 'mailster_notification_content':
			return wpautop( get_post_meta( $form_id, 'content', true ) );
		case 'mailster_notification_replace':
			$subscriber_lists = mailster( 'subscribers' )->get_lists( $subscriber->ID );
			$list_names       = wp_list_pluck( $subscriber_lists, 'name' );

			$list_ids = isset( $options['list_ids'] ) ? array_filter( $options['list_ids'] ) : null;

			$link = mailster( 'subscribers' )->get_confirm_link( $subscriber->ID, $form_id, $list_ids );

			return wp_parse_args(
				array(
					'link'        => '<a href="' . htmlentities( $link ) . '">' . $form->link . '</a>',
					'linkaddress' => $link,
					'lists'       => implode( ', ', $list_names ),
				),
				$content
			);
	}

	return $content;
}
add_filter( 'mailster_notification_to', 'mailster_block_forms_filter', 10, 4 );
add_filter( 'mailster_notification_subject', 'mailster_block_forms_filter', 10, 4 );
add_filter( 'mailster_notification_headline', 'mailster_block_forms_filter', 10, 4 );
add_filter( 'mailster_notification_content', 'mailster_block_forms_filter', 10, 4 );
add_filter( 'mailster_notification_replace', 'mailster_block_forms_filter', 10, 4 );


function mailster_block_forms_confirm_target( $target, $subscriber_id ) {

	$form_id = mailster( 'subscribers' )->meta( $subscriber_id, 'form' );
	$form    = get_post( $form_id );

	if ( $form->post_type != 'mailster-form' ) {
		return $target;
	}

	if ( $confirm_target = get_post_meta( $form_id, 'confirmredirect', true ) ) {
		return $confirm_target;
	}

	return $target;
}
add_filter( 'mailster_confirm_target', 'mailster_block_forms_confirm_target', 10, 2 );


function mailster_block_forms_subscriber_subscribed( $subscriber_id ) {

	$form_id = mailster( 'subscribers' )->meta( $subscriber_id, 'form' );

	$form = get_post( $form_id );

	if ( $form && $form->post_type === 'mailster-form' ) {
		mailster( 'block-forms' )->conversion( $form_id, $subscriber_id );
	}

}
add_action( 'mailster_subscriber_subscribed', 'mailster_block_forms_subscriber_subscribed' );



function mailster_block_forms_shortcode( $atts, $content ) {

	return mailster( 'block-forms' )->render_form( $atts['id'], array(), false );

}
add_shortcode( 'newsletter_block_form', 'mailster_block_forms_shortcode' );

function mailster_block_forms_enable_on_classic_editor( $settings ) {
	if ( ! $settings && isset( $_GET['post'] ) && get_post_type( (int) $_GET['post'] ) === 'mailster-form' ) {
		$settings = array( 'editor' => 'block' );
	}
	if ( ! $settings && isset( $_GET['post_type'] ) && $_GET['post_type'] === 'mailster-form' ) {
		$settings = array( 'editor' => 'block' );
	}

	return $settings;
}
add_filter( 'classic_editor_plugin_settings', 'mailster_block_forms_enable_on_classic_editor' );


/**
 * Register oEmbed Widget.
 *
 * Include widget file and register widget class.
 *
 * @since 1.0.0
 * @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
 * @return void
 */
function register_oembed_widget( $widgets_manager ) {

	require_once __DIR__ . '/classes/elementor.class.php';

	$widgets_manager->register( new Elementor_Mailster_Form() );

}
add_action( 'elementor/widgets/register', 'register_oembed_widget' );

global $mailster_block_forms;
require_once MAILSTER_FORM_BLOCK_DIR . 'classes/block-forms.class.php';
$mailster_block_forms = new MailsterBlockForms();
