<?php

/**
 * Class Mailster_REST_Subscribe_Controller
 */
class Mailster_REST_Subscribe_Controller extends WP_REST_Controller {
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
		$this->rest_base = 'subscribe';
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(

				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => '__return_true', // everyone
				),
				'schema' => null,

			)
		);

	}


	public function create_item( $request ) {

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
