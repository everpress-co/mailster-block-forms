<?php

/**
 * Class Mailster_REST_Form_Controller
 */
class Mailster_REST_Form_Controller extends WP_REST_Controller {
	/**
	 * The namespace.
	 *
	 * @var string
	 */
	protected $namespace;

	/**
	 * Rest base for the current object.
	 *
	 * @var string
	 */
	protected $rest_base;


	public function __construct() {

		$this->namespace = 'mailster/v1';
		$this->rest_base = 'forms';
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/impression',
			array(
				'args'   => array(
					'id' => array(
						'description' => __( 'Unique identifier for the form.' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'impression' ),
					'permission_callback' => '__return_true', // everyone can do that
				),
				'schema' => null,

			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/(?P<type>[a-zA-Z0-9-]+)',
			array(

				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'submission' ),
					'permission_callback' => '__return_true', // everyone
				),
				'schema' => null,

			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/data',
			array(

				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'data' ),
					'permission_callback' => '__return_true', // everyone
				),
				'schema' => null,

			)
		);

	}

	public function impression( $request ) {

		$url_params = $request->get_url_params();

		$form_id = (int) $url_params['id'];
		$post_id = url_to_postid( wp_get_referer() );

		$impression = mailster( 'block-forms' )->impression( $form_id, $post_id );

		if ( is_wp_error( $impression ) ) {
			return $impression;
		}

		$response = array(
			'data' => array(
				'status' => 200,
			),
		);

		// Return all of our comment response data.
		return rest_ensure_response( $response );
	}

	public function data( $request ) {

		$url_params = $request->get_url_params();

		$form_id = (int) $url_params['id'];
		$post_id = url_to_postid( wp_get_referer() );

		$subscriber_id = mailster_get_current_user_id();
		if ( ! $subscriber_id ) {
			return new WP_Error( 'no_user_found', __( 'No user found', 'mailster' ) );
		}
		$data  = (array) mailster_get_current_user();
		$lists = mailster( 'subscribers' )->get_lists( $subscriber_id, true );

		if ( ! empty( $data ) ) {
			$data['_hash'] = $data['hash'];
			$data          = array_diff_key( (array) $data, array( 'ID', 'hash' ) );
		}

		$response = array(
			'data'  => $data,
			'lists' => $lists,
		);

		// Return all of our comment response data.
		return rest_ensure_response( $response );
	}


	public function submission( $request ) {

		$data       = $request->get_json_params();
		$url_params = $request->get_url_params();

		$method = $request->get_method();

		$form_id = (int) $url_params['id'];
		$type    = $url_params['type'];

		$_gdpr      = $request->get_param( '_gdpr' );
		$_timestamp = (int) $request->get_param( '_timestamp' );
		$_lists     = (array) $request->get_param( '_lists' );
		$_referer   = $request->get_param( '_referer' );
		$_hash      = $request->get_param( '_hash' );

		$gdpr        = get_post_meta( $form_id, 'gdpr', true );
		$overwrite   = get_post_meta( $form_id, 'overwrite', true );
		$doubleoptin = get_post_meta( $form_id, 'doubleoptin', true );
		$userschoice = get_post_meta( $form_id, 'userschoice', true );
		$lists       = get_post_meta( $form_id, 'lists', true );
		$redirect    = get_post_meta( $form_id, 'redirect', true );

		$fields_errors   = array();
		$entry           = $data;
		$required_fields = mailster( 'block-forms' )->get_required_fields( $form_id );
		$custom_fields   = mailster( 'block-forms' )->get_fields();

		// remove entries starting with "_"
		$data = array_intersect_key( $data, array_flip( preg_grep( '/^_/', array_keys( $data ), PREG_GREP_INVERT ) ) );

		$entry = mailster( 'subscribers' )->verify( $data, true );

		if ( is_wp_error( $entry ) ) {
			$fields_errors[ $entry->get_error_code() ] = $entry->get_error_message();
			return new WP_Error( 'rest_forbidden', mailster_text( 'error' ), $this->response_data( array( 'fields' => $fields_errors ) ) );
		}

		if ( ! mailster_is_email( $entry['email'] ) ) {
			$fields_errors['email'] = esc_html__( 'This isn\'t a valid email address!', 'mailster' );
		}
		if ( $type == 'unsubscribe' ) {
			$required_fields = array( 'email' );
		}
		foreach ( $required_fields as $field ) {
			if ( ! isset( $data[ $field ] ) || empty( $data[ $field ] ) ) {
				$fields_errors[ $field ] = sprintf( esc_html__( '%s is missing or wrong', 'mailster' ), $custom_fields[ $field ]['name'] );
			}
		}

		if ( $type == 'submission' && ! $_gdpr && $gdpr ) {
			$fields_errors['gdpr'] = mailster_text( 'gdpr_error' );
		}

		/**
		* Seconds to prevent forms being submitted
		*
		* @param int $time_in_seconds the time in seconds (default:4)
		*/
		$time_check_value = apply_filters( 'mailster_time_check_value', 4 );

		if ( $type == 'submission' && empty( $fields_errors ) && $time_check_value && time() - $_timestamp <= $time_check_value ) {
			$fields_errors['email'] = sprintf( esc_html__( 'Please wait at least %s seconds before submitting the form.', 'mailster' ), human_time_diff( $time_check_value + $_timestamp ) );
		}

		/**
		* Allow third parties to hook into the form submission errors
		*
		* @param array $fields_errors all current error
		* @param array $entry the collected user data
		* @param object $request the request
		*/
		$fields_errors = apply_filters( 'mailster_block_form_field_errors', $fields_errors, $entry, $request );

		if ( ! empty( $fields_errors ) ) {
			return new WP_Error( 'rest_forbidden', mailster_text( 'error' ), $this->response_data( array( 'fields' => $fields_errors ) ) );
		}

		if ( $gdpr ) {
			$data['_gdpr'] = time();
		}

		if ( empty( $_referer ) ) {
			 $_referer = $request->get_header( 'referer' );
		}

		// use can select lists
		if ( $userschoice ) {
			// only get which are selected and available on this form
			$lists = array_values( array_intersect( $lists, $_lists ) );
		}

		$entry = wp_parse_args(
			array(
				'lang'   => mailster_get_lang(),
				'_lists' => $lists,
			),
			$entry
		);

		if ( $type == 'submission' ) {
			$entry         = wp_parse_args(
				array(
					'confirm' => $doubleoptin ? 0 : time(),
					'status'  => $doubleoptin ? 0 : 1,
					'lang'    => mailster_get_lang(),
					'referer' => $_referer,
				),
				$entry
			);
			$subscriber_id = mailster( 'subscribers' )->add( $entry, $overwrite );

			// handle subscriber updates
			if ( is_wp_error( $subscriber_id ) ) {

				$fields_errors['email'] = $subscriber_id->get_error_message();
				if ( 'email_exists' == $subscriber_id->get_error_code() ) {
					if ( $exists = mailster( 'subscribers' )->get_by_mail( $entry['email'] ) ) {

						 $fields_errors['email'] = mailster_text( 'already_registered' );

						if ( $exists->status == 0 ) {
							$fields_errors['confirmation'] = mailster_text( 'new_confirmation_sent' );
							mailster( 'subscribers' )->send_confirmations( $exists->ID, true, true );

						} elseif ( $exists->status == 1 ) {

							// change status to "pending" if user is other than subscribed
						} elseif ( $exists->status != 1 ) {
							if ( $doubleoptin ) {
								$fields_errors['confirmation'] = mailster_text( 'new_confirmation_sent' );
								mailster( 'subscribers' )->change_status( $exists->ID, 0, true );
								mailster( 'subscribers' )->send_confirmations( $exists->ID, true, true );
							} else {
								mailster( 'subscribers' )->change_status( $exists->ID, 1, true );
							}
						}
					}
				}
			}

			$subscriber = mailster( 'subscribers' )->get( $subscriber_id );

			$message = '';

		}

		if ( $type == 'profile' ) {
			$exists        = mailster( 'subscribers' )->get_by_hash( $_hash );
			$entry['ID']   = $exists->ID;
			$subscriber_id = mailster( 'subscribers' )->update( $entry, true );
			$subscriber    = mailster( 'subscribers' )->get( $subscriber_id );
			$message       = mailster_text( 'profile_update' );
		}

		if ( $type == 'unsubscribe' ) {
			$exists        = mailster( 'subscribers' )->get_by_hash( $_hash );
			$subscriber_id = mailster( 'subscribers' )->unsubscribe( $exists->ID, true );
			$subscriber    = mailster( 'subscribers' )->get( $subscriber_id );
			$message       = mailster_text( 'unsubscribe' );
		}

		if ( ! empty( $fields_errors ) ) {
			return new WP_Error( 'rest_forbidden', mailster_text( 'error' ), $this->response_data( array( 'fields' => $fields_errors ) ) );
		}

		if ( $type == 'submission' ) {
			$post_id = url_to_postid( wp_get_referer() );
			mailster( 'block-forms' )->conversion( $entry['form'], $post_id, $subscriber_id, $doubleoptin ? 2 : 3 );
		}

		$response = array(
			'data'    => array(
				'status'            => 200,
				'subscriber_status' => $subscriber->status,
				'redirect'          => $redirect ? $redirect : null,
			),
			'message' => $message,

		);

		// Return all of our comment response data.
		return rest_ensure_response( $response );
	}

	/**
	 * Sets up the proper HTTP status code for authorization.
	 *
	 * @return int
	 */
	public function authorization_status_code() {

		$status = 401;

		if ( is_user_logged_in() ) {
			$status = 403;
		}

		return $status;
	}
	private function response_data( $args = array() ) {

		$data = wp_parse_args( $args, array( 'status' => $this->authorization_status_code() ) );

		return $data;

	}

}
