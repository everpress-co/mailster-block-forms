<?php
/**
Plugin Name: Mailster Block Forms
Requires Plugins: mailster
Plugin URI: https://mailster.co/?utm_campaign=wporg&utm_source=wordpress.org&utm_medium=plugin&utm_term=Mailster+Block+Forms
Description: Create Mailster forms with the block editor
Version: 0.4.1
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


add_action(
	'plugins_loaded',
	function () {

		// require Mailster
		if ( ! defined( 'MAILSTER_VERSION' ) ) {
			return;
		}

		function mailster_block_forms_change_post_type_name() {
			global $wpdb;

			// change the post type of the forms
			$wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->posts} SET `post_type` = %s WHERE post_type = %s", 'mailster-form', 'newsletter_form' ) );
		}

		if ( version_compare( MAILSTER_VERSION, '4.0.0-beta' ) >= 0 ) {

			mailster_block_forms_change_post_type_name();
			$msg  = '<h2>Thanks for testing Mailster Block Forms!</h2>';
			$msg .= '<p>This addon has been merged into the core plugin and is no longer needed and is now disabled.</p>';
			$msg .= '<p>Enjoy building forms with your favorite newsletter plugin.</p>';
			$msg .= '<p><a href="' . admin_url( 'edit.php?post_type=mailster-form' ) . '" class="button button-primary">' . esc_html__( 'Browse your forms' ) . '</a> <a href="' . admin_url( 'post-new.php?post_type=mailster-form' ) . '" class="button button-secondary">Create new form</a></p>';
			mailster_notice( $msg, 'info', false, 'mailster-form_disable_notice', true );

			if ( ! function_exists( 'deactivate_plugins' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}

			// deactivate this plugin
			deactivate_plugins( plugin_basename( __FILE__ ) );

			return;
		}

		add_action( 'admin_print_scripts-edit.php', 'mailster_block_forms_beta_notice' );
		function mailster_block_forms_beta_notice() {
			$msg  = '<h2>Welcome to the new Block Forms page.</h2>';
			$msg .= '<p>Creating forms for Mailster gets easier and more flexible. Utilize the WordPress Block Editor (Gutenberg) to create you custom, feature rich forms.</p>';
			$msg .= '<p><strong>Block forms are currently in <del>beta version</del> in release state. Some features are still subject to change before the stable release.</strong></p>';
			$msg .= '<p><a href="' . admin_url( 'post-new.php?post_type=mailster-form' ) . '" class="button button-primary">' . esc_html__( 'Create new Form' ) . '</a> <a href="https://docs.mailster.co/#/block-forms-overview" class="button button-secondary external">Check out our guide</a> or <a href="https://github.com/everpress-co/mailster-block-forms/issues" class="button button-link external">Submit feedback on Github</a></p>';
			mailster_notice( $msg, 'info', true, 'mailster_form_beta_notice', true, 'edit-mailster-form' );
		}

		// make sure the post type change at some time.
		add_action( 'mailster_cron', 'mailster_block_forms_change_post_type_name' );

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
				content: 'RC 2';
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
				font-size: 10px;
				line-height: 18px;
				text-align: center;
				z-index: 26;
            }"
			);
		}
		add_action( 'admin_enqueue_scripts', 'mailster_block_forms_add_admin_css' );

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
	}
);

function mailster_block_forms_add_class( $classes ) {

	if ( version_compare( MAILSTER_VERSION, '4.0.0-beta' ) >= 0 ) {
		return $classes;
	}

	require_once MAILSTER_FORM_BLOCK_DIR . 'classes/block-forms.class.php';

	$classes['block-forms'] = new MailsterBlockForms();

	return $classes;
}
add_filter( 'mailster_classes', 'mailster_block_forms_add_class' );

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
