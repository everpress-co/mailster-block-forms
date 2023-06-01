<?php

/**
 * Class Mailster_REST_List_Controller
 */
class Mailster_REST_List_Controller extends WP_REST_Controller {
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
		$this->rest_base = 'lists';
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
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				'schema' => null,

			)
		);

	}

	/**
	 * Check permissions for the read.
	 *
	 * @param WP_REST_Request $request get data from request.
	 *
	 * @return bool|WP_Error
	 */
	public function get_items_permissions_check( $request ) {
		if ( ! current_user_can( 'mailster_edit_forms' ) ) {
			return new WP_Error( 'rest_forbidden', esc_html__( 'You cannot view this resource.' ), array( 'status' => $this->authorization_status_code() ) );
		}
		return true;
	}


	public function get_items( $request ) {

		$lists = mailster( 'lists' )->get();

		foreach ( $lists as $i => $list ) {
			$lists[ $i ]->ID        = (int) $list->ID;
			$lists[ $i ]->added     = (int) $list->added;
			$lists[ $i ]->updated   = (int) $list->updated;
			$lists[ $i ]->parent_id = (int) $list->parent_id;
		}

		// Return all of our comment response data.
		return rest_ensure_response( $lists );
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
}
