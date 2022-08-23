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
					'callback'            => array( $this, 'create_impression' ),
					'permission_callback' => '__return_true', // everyone can do that
				),
				'schema' => null,

			)
		);

	}

	public function create_impression( $request ) {

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

}
