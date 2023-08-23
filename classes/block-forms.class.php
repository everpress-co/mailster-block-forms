<?php

class MailsterBlockForms {



	private $forms = array();
	private $preview_data;

	public function __construct() {

		// since 5.8
		if ( ! function_exists( 'get_allowed_block_types' ) ) {
			return;
		}
		add_action( 'plugins_loaded', array( &$this, 'maybe_preview' ) );

		add_action( 'init', array( &$this, 'register_post_type' ) );
		add_action( 'init', array( &$this, 'register_post_meta' ) );
		add_action( 'init', array( &$this, 'block_init' ) );
		add_action( 'rest_api_init', array( &$this, 'register_block_patterns' ) );
		add_action( 'rest_api_init', array( &$this, 'rest_api_init' ) );
		add_action( 'rest_api_init', array( &$this, 'register_settings' ) );

		add_action( 'admin_print_scripts-edit.php', array( &$this, 'overview_script_styles' ), 1 );

		// add_action( 'enqueue_block_editor_assets', array( &$this, 'block_script_styles' ), 1 );
		add_action( 'enqueue_block_assets', array( &$this, 'block_script_styles' ), 1 );

		add_filter( 'allowed_block_types_all', array( &$this, 'allowed_block_types' ), 9999, 2 );
		add_filter( 'block_editor_settings_all', array( &$this, 'block_editor_settings' ), PHP_INT_MAX, 2 );
		add_filter( 'block_categories_all', array( &$this, 'block_categories' ) );

		add_filter( 'manage_mailster-form_posts_columns', array( &$this, 'columns' ), 1 );
		add_action( 'manage_mailster-form_posts_custom_column', array( &$this, 'custom_column' ), 10, 2 );
		// add_filter( 'wp_list_table_class_name', array( &$this, 'wp_list_table_class_name' ), 10, 2 );

		add_filter( 'template_redirect', array( &$this, 'prepare_forms' ) );

		add_action( 'save_post_mailster-form', array( &$this, 'clear_cache' ) );
		add_action( 'save_post_page', array( &$this, 'maybe_set_homepage' ), 10, 3 );
		add_action( 'switch_theme', array( &$this, 'clear_inline_style' ) );

		add_filter( 'block_editor_settings_all', array( &$this, 'disable_block_unlocks' ), 10, 2 );

		add_shortcode( 'newsletter_block_form', array( &$this, 'shortcode' ) );

	}


	public function get_theme_styles( $selector = '.is-root-container .mailster-block-form.wp-block-mailster-form-wrapper' ) {

		$value = '';

		$styles = wp_get_global_styles();

		if ( isset( $styles['color'] ) ) {
			$value .= $selector . '{';
			if ( isset( $styles['color']['background'] ) ) {
				$value .= 'background-color:' . preg_replace( '/^var:([a-z-]+)\|([a-z-]+)\|([a-z-]+)$/', 'var(--wp--$1--$2--$3)', $styles['color']['background'] ) . ';';
			}
			if ( isset( $styles['color']['text'] ) ) {
				$value .= 'color:' . preg_replace( '/^var:([a-z-]+)\|([a-z-]+)\|([a-z-]+)$/', 'var(--wp--$1--$2--$3)', $styles['color']['text'] ) . ';';
			}
			$value .= '}';
		}

		return $value;
	}


	public function disable_block_unlocks( $settings, $context ) {

		// just skip if not on our cpt
		if ( 'mailster-form' != get_post_type() || $context->name !== 'core/edit-post' ) {
			return $settings;
		}

		$settings['canLockBlocks'] = false;

		return $settings;
	}


	public function rest_api_init() {

		include MAILSTER_FORM_BLOCK_DIR . 'classes/rest-controller/rest.lists.class.php';

		$controller = new Mailster_REST_List_Controller();
		$controller->register_routes();

		include MAILSTER_FORM_BLOCK_DIR . 'classes/rest-controller/rest.form.class.php';

		$controller = new Mailster_REST_Form_Controller();
		$controller->register_routes();

	}

	public function register_settings() {

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


	public function maybe_preview() {

		// enter preview mode
		if ( isset( $_GET['mailster-block-preview'] ) ) {

			$data = json_decode( stripcslashes( $_GET['mailster-block-preview'] ), true );

			// sanitize
			$data = $this->sanitize( $data );

			// stop if an error occurred
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				return;
			}

			if ( ! is_array( $data ) ) {
				return;
			}

			if ( ! isset( $data['p'] ) && 'other' != $data['type'] ) {
				$data['p'] = $this->get_preview_page( $data );
				// check if user can actually edit this form
				$redirect = add_query_arg(
					array(
						'mailster-block-preview' => rawurlencode( json_encode( $data ) ),
						'p'                      => $data['p'],
					),
					home_url()
				);

				wp_redirect( $redirect );
				exit;
			}

			if ( ! current_user_can( 'edit_post', $data['p'] ) ) {
				return;
			}

			// handle logged in status
			if ( ! $data['user'] ) {
				wp_set_current_user( 0 );
				add_filter( 'determine_current_user', '__return_false', PHP_INT_MAX );
			}

			$this->preview_data = $data;

		}
	}


	public function sanitize( $value ) {

		if ( is_scalar( $value ) ) {
			$value = sanitize_text_field( $value );
		} elseif ( is_array( $value ) ) {
			$value = array_map( array( $this, 'sanitize' ), $value );
		} elseif ( is_object( $value ) ) {
			$vars = get_object_vars( $value );
			foreach ( $vars as $key => $data ) {
				$value->{$key} = $this->sanitize( $data );
			}
		}

		return $value;
	}


	public function get_preview_page( $data ) {

		global $wpdb;

		$sql = "SELECT wp_posts.ID FROM {$wpdb->posts} AS wp_posts";

		if ( ! empty( $data['options']['all'] ) ) {
			$sql .= ' WHERE wp_posts.post_type IN ("' . implode( '", "', $data['options']['all'] ) . '")';
		} elseif ( ! empty( $data['options']['posts'] ) ) {
			$sql .= ' WHERE wp_posts.ID IN (' . implode( ', ', $data['options']['posts'] ) . ')';
		} elseif ( ! empty( $data['options']['taxonomies'] ) ) {
			$sql .= " LEFT JOIN {$wpdb->term_relationships} AS terms ON terms.object_id = wp_posts.ID WHERE terms.term_taxonomy_id IN (" . implode( ', ', $data['options']['taxonomies'] ) . ')';
		} else {
			$sql .= ' WHERE 1=1';
		}

		$sql .= " AND (wp_posts.post_status = 'publish') ORDER BY wp_posts.post_date DESC LIMIT 0, 1";

		return $wpdb->get_var( $sql );

	}


	public function wp_list_table_class_name( $class_name, $args ) {

		if ( $args['screen']->id !== 'edit-mailster-form' ) {
			return $class_name;
		}

		require_once MAILSTER_FORM_BLOCK_DIR . 'classes/block-forms.table.class.php';
		$class_name = 'Mailster_Block_Forms_Table';

		return $class_name;

	}


	public function columns( $columns ) {

		$columns = array(
			'cb'              => '<input type="checkbox" />',
			'title'           => esc_html__( 'Title', 'mailster' ),
			'info'            => '',
			'impressions'     => esc_html__( 'Impressions', 'mailster' ) . ' <span class="count">' . number_format_i18n( $this->get_impressions() ) . '</span>',
			'conversions'     => esc_html__( 'Conversions', 'mailster' ) . ' <span class="count">' . number_format_i18n( $this->get_conversions() ) . '</span>',
			'conversion_rate' => '<abbr title="' . esc_attr__( 'Conversation Rate', 'mailster' ) . '">' . esc_html__( 'CVR', 'mailster' ) . '</abbr> <span class="count">' . sprintf( '%s %%', number_format_i18n( $this->get_conversion_rate() * 100, 1 ) ) . '</span>',
			'date'            => esc_html__( 'Date', 'mailster' ),
		);
		return $columns;
	}


	public function custom_column( $column, $post_id ) {

		switch ( $column ) {
			case 'info':
				$placements = get_post_meta( $post_id, 'placements' );
				echo '<span title="' . esc_attr__( 'Displayed in Content', 'mailster' ) . '" class="form-option placement-content ' . ( in_array( 'content', $placements ) ? 'is-checked' : '' ) . '">&nbsp;</span>';
				echo '<span title="' . esc_attr__( 'Displayed as Popup', 'mailster' ) . '" class="form-option placement-popup ' . ( in_array( 'popup', $placements ) ? 'is-checked' : '' ) . '">&nbsp;</span>';
				echo '<span title="' . esc_attr__( 'Double-Opt-In', 'mailster' ) . '" class="form-option doubleoptin ' . ( get_post_meta( $post_id, 'doubleoptin', true ) ? 'is-checked' : '' ) . '">&nbsp;</span>';
				echo '<span title="' . esc_attr__( 'GDPR compliant', 'mailster' ) . '" class="form-option gdpr ' . ( get_post_meta( $post_id, 'gdpr', true ) ? 'is-checked' : '' ) . '">&nbsp;</span>';
				echo '<span title="' . esc_attr__( 'Overwrite user data', 'mailster' ) . '" class="form-option overwrite ' . ( get_post_meta( $post_id, 'overwrite', true ) ? 'is-checked' : '' ) . '">&nbsp;</span>';
				echo '<span title="' . sprintf( esc_attr__( 'Redirect users to %s after form submission.', 'mailster' ), get_post_meta( $post_id, 'redirect', true ) ) . '" class="form-option redirect ' . ( get_post_meta( $post_id, 'redirect', true ) ? 'is-checked' : '' ) . '">&nbsp;</span>';
				$lists = mailster( 'lists' )->get( get_post_meta( $post_id, 'lists', true ) );
				$names = wp_list_pluck( $lists, 'name', 'ID' );
				echo '<span title="' . sprintf( esc_attr__( 'Lists: %s', 'mailster' ), "\n" . implode( "\n", $names ) ) . '" class="form-option lists ' . ( count( $lists ) ? 'is-checked' : '' ) . '">' . count( $lists ) . '</span>';

				break;
			case 'impressions':
				echo number_format_i18n( $this->get_impressions( $post_id ) );
				break;
			case 'conversions':
				echo number_format_i18n( $this->get_conversions( $post_id ) );
				break;
			case 'conversion_rate':
				printf( '%s %%', number_format_i18n( $this->get_conversion_rate( $post_id ) * 100, 1 ) );
				break;
			default:
				break;
		}

	}




	public function prepare_forms() {

		if ( $this->preview_data ) {

			$this->forms[ $this->preview_data['type'] ][ $this->preview_data['form_id'] ] = $this->preview_data['options'];

			$suffix = '';
			wp_enqueue_script( 'mailster-form-block-preview', MAILSTER_FORM_BLOCK_URI . 'assets/js/form-block-preview' . $suffix . '.js', array( 'jquery', 'mailster-form-view-script', 'wp-api-fetch' ), MAILSTER_VERSION );
			wp_enqueue_style( 'mailster-form-block-preview', MAILSTER_FORM_BLOCK_URI . 'assets/css/form-block-preview' . $suffix . '.css', array(), MAILSTER_VERSION );

		} elseif ( get_post_type() == 'mailster-form' ) {
			add_filter( 'the_content', array( &$this, 'render_form_in_content' ) );
		} elseif ( $forms = $this->query_forms() ) {
			$this->forms = $forms;
		}

		if ( isset( $this->forms['popup'] ) || isset( $this->forms['bar'] ) || isset( $this->forms['side'] ) ) {
			add_filter( 'wp_footer', array( &$this, 'maybe_add_form_to_footer' ) );
		}
		if ( isset( $this->forms['content'] ) ) {
			add_filter( 'the_content', array( &$this, 'maybe_add_form_to_content' ) );
		}

	}


	public function check_validity( $options = array() ) {

		$post_type = get_post_type();

		// fails if not in a schedule
		if ( ! $this->preview_data && ! empty( $options['schedule'] ) ) {
			$now  = current_time( 'timestamp' );
			$pass = false;

			foreach ( $options['schedule'] as $schedule ) {
				if ( $now > strtotime( $schedule['start'] ) && ( $now < strtotime( $schedule['end'] ) || empty( $schedule['end'] ) ) ) {
					$pass = true;
					break;
				}
			}
			if ( ! $pass ) {
				return false;
			}
		}

		$is_single_or_page = ( is_single() || is_page() );

		if ( ! empty( $options['all'] ) && in_array( $post_type, $options['all'] ) && $is_single_or_page ) {
			return true;
		}

		$current_id = get_the_ID();

		if ( isset( $options['posts'] ) && in_array( $current_id, $options['posts'] ) && $is_single_or_page ) {
			return true;
		}

		if ( ! empty( $options['taxonomies'] ) && $is_single_or_page ) {
			// get all assigned term ids of this post
			$terms = wp_get_object_terms( $current_id, get_object_taxonomies( $post_type ), array( 'fields' => 'ids' ) );
			if ( array_intersect( $options['taxonomies'], $terms ) ) {
				return true;
			}
		}

		return false;

	}



	public function shortcode( $atts, $content ) {

		return $this->render_form( $atts['id'], array(), false );

	}



	public function render_form_in_content( $content ) {

		$options = array(
			'classes' => array( 'mailster-block-form-type-content' ),
		);

		$form_html = $this->render_form( get_the_ID(), $options, false );
		return $this->kses( $form_html );
	}



	public function maybe_add_form_to_content( $content ) {

		if ( ! is_singular() ) {
			return $content;
		}

		foreach ( $this->forms['content'] as $form_id => $options ) {
			if ( isset( $displayed[ $form_id ] ) ) {
				continue;
			}
			if ( $form_html = $this->render_form( $form_id, $options ) ) {
				$display = $options['display'];

				$form_html = $this->kses( $form_html );

				if ( 'start' == $display ) {
					$content = $form_html . $content;
				} elseif ( 'end' == $display ) {
					$content = $content . $form_html;
				} else {
					$tag = $options['tag'];
					$pos = $options['pos'];

					if ( 'more' == $tag ) {
						$split_at = '<span id="more-' . get_the_ID() . '"></span>';
						$pos      = 1;
					} else {
						$split_at = '</' . $tag . '>';
					}

					$chunks = explode( $split_at, $content );
					if ( $pos < 0 ) {
						$pos = max( 0, count( $chunks ) + $pos );
					}

					if ( ! $pos && false === strpos( $content, $split_at ) ) {
						$pos = -1;
					}

					if ( isset( $chunks[ $pos ] ) ) {
						$chunks[ $pos ] = $form_html . $chunks[ $pos ];
						$content        = implode( $split_at, $chunks );
					} else {
						$content .= $form_html;
					}
				}
			}
		}

		return $content;
	}

	public function maybe_add_form_to_footer() {

		if ( isset( $this->forms['popup'] ) ) {
			foreach ( $this->forms['popup'] as $form_id => $options ) {
				$options['classes'] = array( 'mailster-block-form-type-popup' );
				if ( $form_html = $this->render_form( $form_id, $options ) ) {
					echo $this->kses( $form_html );
				}
			}
		}

		return;

		if ( isset( $this->forms['bar'] ) ) {
			foreach ( $this->forms['bar'] as $form_id => $options ) {
				$options['classes'] = array( 'mailster-block-form-type-bar' );
				if ( $form_html = $this->render_form( $form_id, $options ) ) {
					echo $this->kses( $form_html );
				}
			}
		}

		if ( isset( $this->forms['side'] ) ) {
			foreach ( $this->forms['side'] as $form_id => $options ) {
				$options['classes'] = array( 'mailster-block-form-type-side' );
				if ( $form_html = $this->render_form( $form_id, $options ) ) {
					echo $this->kses( $form_html );
				}
			}
		}

	}

	private function query_forms( $force = false ) {

		if ( $force || ! ( $forms = get_transient( 'mailster_forms' ) ) ) {

			$args = array(
				'post_type'     => 'mailster-form',
				'post_status'   => 'publish',
				'no_found_rows' => true,
				'fields'        => 'ids',
			);

			$query = new WP_Query( $args );

			$forms = array();

			foreach ( $query->posts as $form_id ) {
				$placements = (array) get_post_meta( $form_id, 'placements', false );
				// TODO check for A/B Test
				foreach ( $placements as $placement ) {
					$placement_options = get_post_meta( $form_id, 'placement_' . $placement, true );
					if ( $placement_options ) {
						$forms[ $placement ][ $form_id ] = $placement_options;
					}
				}
			}

			set_transient( 'mailster_forms', $forms );

		}

		return $forms;

	}


	public function register_post_type() {

		$name = _x( 'Block Forms', 'Post Type General Name', 'mailster' );

		$labels = array(
			'name'                     => $name,
			'singular_name'            => _x( 'Form', 'Post Type Singular Name', 'mailster' ),
			'menu_name'                => $name,
			'attributes'               => __( 'Form Attributes', 'mailster' ),
			'all_items'                => $name,
			'add_new_item'             => __( 'Add New Form', 'mailster' ),
			'add_new'                  => __( 'Add New', 'mailster' ),
			'new_item'                 => __( 'New Form', 'mailster' ),
			'edit_item'                => __( 'Edit Form', 'mailster' ),
			'update_item'              => __( 'Update Form', 'mailster' ),
			'view_item'                => __( 'View Form', 'mailster' ),
			'view_items'               => __( 'View Forms', 'mailster' ),
			'search_items'             => __( 'Search Form', 'mailster' ),
			'not_found'                => __( 'Not found', 'mailster' ),
			'not_found_in_trash'       => __( 'Not found in Trash', 'mailster' ),
			'uploaded_to_this_item'    => __( 'Uploaded to this form', 'mailster' ),
			'items_list'               => __( 'Forms list', 'mailster' ),
			'items_list_navigation'    => __( 'Forms list navigation', 'mailster' ),
			'filter_items_list'        => __( 'Filter forms list', 'mailster' ),
			'item_published'           => __( 'Form published', 'mailster' ),
			'item_published_privately' => __( 'Form published privately.', 'mailster' ),
			'item_reverted_to_draft'   => __( 'Form reverted to draft.', 'mailster' ),
			'item_scheduled'           => __( 'Form scheduled.', 'mailster' ),
			'item_updated'             => __( 'Form updated.', 'mailster' ),

		);
		$capabilities = array(
			'edit_post'          => 'mailster_edit_form',
			'read_post'          => 'mailster_read_form',
			'delete_post'        => 'mailster_delete_forms',
			'edit_posts'         => 'mailster_edit_forms',
			'edit_others_posts'  => 'mailster_edit_others_forms',
			'publish_posts'      => 'mailster_publish_forms',
			'read_private_posts' => 'mailster_read_private_forms',
		);
		$args         = array(
			'label'               => __( 'Form', 'mailster' ),
			'description'         => __( 'Newsletter Form', 'mailster' ),
			'labels'              => $labels,
			'supports'            => array( 'title', 'editor', 'revisions', 'custom-fields' ),
			'hierarchical'        => false,
			'public'              => false,
			'publicly_queryable'  => ! is_admin(),
			'show_ui'             => true,
			'show_in_menu'        => 'edit.php?post_type=newsletter',
			'show_in_admin_bar'   => false,
			'show_in_nav_menus'   => true,
			'can_export'          => false,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'rewrite'             => false,
			'rewrite'             => array(
				'with_front' => false,
				'feeds'      => false,
				'slug'       => 'mailster-form',
			),
			// 'capabilities'        => $capabilities,
			'show_in_rest'        => true,

		);
		register_post_type( 'mailster-form', $args );

	}

	public function register_post_meta() {

		register_post_meta(
			'mailster-form',
			'doubleoptin',
			array(
				'type'         => 'boolean',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => true,

			)
		);
		register_post_meta(
			'mailster-form',
			'gdpr',
			array(
				'type'         => 'boolean',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => false,

			)
		);

		register_post_meta(
			'mailster-form',
			'userschoice',
			array(
				'type'         => 'boolean',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => false,

			)
		);

		register_post_meta(
			'mailster-form',
			'redirect',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => '',

			)
		);

		register_post_meta(
			'mailster-form',
			'confirmredirect',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => '',

			)
		);

		register_post_meta(
			'mailster-form',
			'overwrite',
			array(
				'type'         => 'boolean',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => false,

			)
		);

		register_post_meta(
			'mailster-form',
			'lists',
			array(
				'type'         => 'array',
				'show_in_rest' => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type' => 'number',
						),
					),
				),
				'single'       => true,
				'default'      => array(),
			)
		);

		register_post_meta(
			'mailster-form',
			'subject',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => esc_html__( 'Welcome to {company}!', 'mailster' ),
			)
		);
		register_post_meta(
			'mailster-form',
			'headline',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => esc_html__( 'Please confirm your email', 'mailster' ),
			)
		);

		register_post_meta(
			'mailster-form',
			'content',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => sprintf( esc_html__( 'You have to confirm your email address to subscribe. Please click the link below to confirm. %s', 'mailster' ), "\n{link}" ),
			)
		);

		register_post_meta(
			'mailster-form',
			'link',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
				'single'       => true,
				'default'      => esc_html__( 'Click here to confirm', 'mailster' ),
			)
		);

		register_post_meta(
			'mailster-form',
			'tags',
			array(
				'type'         => 'array',
				'show_in_rest' => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type' => 'number',
						),
					),
				),
				'single'       => true,
				'default'      => array(),
			)
		);

		register_post_meta(
			'mailster-form',
			'placements',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
				'single'       => false,
			)
		);

		foreach ( array( 'content', 'bar', 'popup', 'side', 'other' ) as $placement_type ) {

			if ( 'content' == $placement_type ) {
				$default = array(
					'all'     => array( 'post' ),
					'tag'     => 'p',
					'pos'     => 0,
					'display' => 'end',
				);
			} elseif ( 'other' == $placement_type ) {
				$default = array();
			} else {
				$default = array(
					'all'              => array( 'post' ),
					'triggers'         => array( 'delay' ),
					'trigger_delay'    => 120,
					'trigger_inactive' => 120,
					'trigger_click'    => '',
					'trigger_scroll'   => 66,
					'width'            => 70,
					'cooldown'         => 24,

				);
			}

			register_post_meta(
				'mailster-form',
				'placement_' . $placement_type,
				array(
					'single'       => true,
					'type'         => 'object',
					'default'      => $default,
					'show_in_rest' => array(
						'schema' => array(
							'type'       => 'object',
							'properties' => array(
								'all'              => array(
									'type' => 'array',
								),
								'triggers'         => array(
									'type' => 'array',
								),
								'schedule'         => array(
									'type' => 'array',
								),
								'posts'            => array(
									'type' => 'array',
								),
								'taxonomies'       => array(
									'type' => 'array',
								),
								'tag'              => array(
									'type' => 'string',
								),
								'pos'              => array(
									'type' => 'integer',
								),
								'trigger_delay'    => array(
									'type' => 'integer',
								),
								'trigger_inactive' => array(
									'type' => 'integer',
								),
								'trigger_click'    => array(
									'type' => 'string',
								),
								'trigger_scroll'   => array(
									'type' => 'integer',
								),
								'display'          => array(
									'type' => 'string',
								),
								'align'            => array(
									'type' => 'string',
								),
								'width'            => array(
									'type' => 'integer',
								),
								'padding'          => array(
									'type'                 => 'object',
									'additionalProperties' => array(
										'type' => 'string',
									),
								),
								'animation'        => array(
									'type' => 'string',
								),
								'cooldown'         => array(
									'type' => 'integer',
								),
							),
						),
					),
				)
			);
		}

	}



	public function get( $id ) {
		$post = get_post( $id );
		if ( 'mailster-form' !== $post->post_type ) {
			return false;
		}
		return $post;
	}


	public function get_all( $args = array() ) {

		$defaults = array(
			'post_type'      => 'mailster-form',
			'posts_per_page' => -1,
		);

		$args = wp_parse_args( $args, $defaults );

		return get_posts( $args );

	}



	public function block_init() {

		register_block_type( MAILSTER_FORM_BLOCK_DIR . 'build/form', array( 'render_callback' => array( $this, 'render_form_callback' ) ) );
		register_block_type( MAILSTER_FORM_BLOCK_DIR . 'build/homepage/', array() );
		register_block_type( MAILSTER_FORM_BLOCK_DIR . 'build/homepage-context/', array( 'render_callback' => array( $this, 'render_homepage_context_callback' ) ) );

		if ( ! is_admin() ) {
			return;
		}

		global $pagenow, $post_id;
		$typenow = '';

		// from https://www.designbombs.com/registering-gutenberg-blocks-for-custom-post-type/
		if ( 'post-new.php' === $pagenow ) {
			if ( isset( $_REQUEST['post_type'] ) && post_type_exists( $_REQUEST['post_type'] ) ) {
				$typenow = sanitize_key( $_REQUEST['post_type'] );
			};

		} elseif ( 'post.php' === $pagenow ) {
			if ( isset( $_GET['post'] ) && isset( $_POST['post_ID'] ) && (int) $_GET['post'] !== (int) $_POST['post_ID'] ) {
				// Do nothing
			} elseif ( isset( $_GET['post'] ) ) {
				$post_id = (int) $_GET['post'];
			} elseif ( isset( $_POST['post_ID'] ) ) {
				$post_id = (int) $_POST['post_ID'];
			}
			if ( $post_id ) {
				if ( $post = get_post( $post_id ) ) {
					$typenow = $post->post_type;
				}
			}
		}

		// homepage only on pages
		if ( $typenow !== 'page' ) {
			// TODO check if unregistered above
			unregister_block_type( 'mailster/homepage' );
			unregister_block_type( 'mailster/homepage-context' );
		} else {
			$homepage = (int) mailster_option( 'homepage' );
			if ( $homepage && $post_id !== $homepage ) {
				unregister_block_type( 'mailster/homepage' );
				unregister_block_type( 'mailster/homepage-context' );
			} else {

				do_action( 'mailster_admin_header' );

				wp_add_inline_script( 'wp-blocks', 'var mailster_homepage_slugs = ' . json_encode( mailster_option( 'slugs' ) ) . ';' );
			}
		}

		if ( $typenow === 'mailster-form' ) {

			// not in use on the form edit page
			unregister_block_type( 'mailster/form' );

			wp_enqueue_code_editor(
				array(
					'type'       => 'htmlmixed',
					'codemirror' => array( 'lint' => true ),
				)
			);

			$blocks = $this->get_blocks();

			foreach ( $blocks as $block ) {
				$args = array();

				$block_name = str_replace( '-', '_', basename( dirname( $block ) ) );

				if ( method_exists( $this, 'render_' . $block_name . '_callback' ) ) {
					$args['render_callback'] = array( $this, 'render_' . $block_name . '_callback' );
				}

				register_block_type( $block, $args );
			}
		}

	}

	private function get_blocks() {
		$blocks = glob( MAILSTER_FORM_BLOCK_DIR . 'build/forms/*/block.json' );
		return $blocks;
	}

	public function overview_script_styles() {

		$post_type = get_post_type();
		if ( ! $post_type ) {
			$post_type = get_current_screen()->post_type;
		}

		if ( 'mailster-form' != $post_type ) {
			return;
		}

		$suffix = '';

		do_action( 'mailster_admin_header' );

		wp_enqueue_style( 'mailster-block-forms-overview', MAILSTER_FORM_BLOCK_URI . 'assets/css/block-form-overview' . $suffix . '.css', array(), MAILSTER_VERSION );
	}

	public function block_script_styles() {

		if ( 'mailster-form' != get_post_type() ) {
			return;
		}

		$suffix = '';

		do_action( 'mailster_admin_header' );

		wp_enqueue_style( 'mailster-form-block-editor', MAILSTER_FORM_BLOCK_URI . 'assets/css/forms-blocks-editor' . $suffix . '.css', array(), MAILSTER_VERSION );
		wp_add_inline_style( 'mailster-form-block-editor', $this->get_theme_styles() );
		wp_add_inline_script( 'wp-blocks', 'var mailster_fields = ' . json_encode( array_values( $this->get_fields() ) ) . ';' );
	}

	public function get_fields() {
		$custom_fields = mailster()->get_custom_fields();

		$fields = array(
			'submit'    => array(
				'name'    => __( 'Submit Button', 'mailster' ),
				'id'      => 'submit',
				'default' => mailster_text( 'submitbutton' ),
				'type'    => 'submit',
			),
			'email'     => array(
				'name' => mailster_text( 'email' ),
				'id'   => 'email',
				'type' => 'email',
			),
			'firstname' => array(
				'name' => mailster_text( 'firstname' ),
				'id'   => 'firstname',
				'type' => 'text',
			),

			'lastname'  => array(
				'name' => mailster_text( 'lastname' ),
				'id'   => 'lastname',
				'type' => 'text',
			),
		);

		return array_merge( $fields, $custom_fields );
	}

	public function allowed_block_types( $allowed_block_types, $context ) {

		// just skip if not on our cpt
		if ( 'mailster-form' != get_post_type() || $context->name !== 'core/edit-post' ) {
			return $allowed_block_types;
		}

		$block_types = WP_Block_Type_Registry::get_instance()->get_all_registered();
		$types       = array_keys( $block_types );

		// only allow core and Mailster blocks
		$types = preg_grep( '/^(core|mailster)\//', $types );

		// remove certain blocks
		$remove = array( 'core/more', 'core/read-more', 'core/nextpage' );
		$remove = array_merge( $remove, preg_grep( '/core\/(comment-|comments-|navigation-|post-|query-)/', $types ) );
		$types  = array_diff( $types, $remove );

		$custom_fields = array_keys( $this->get_fields() );
		foreach ( $custom_fields as $block ) {
			$types[] = 'mailster/field-' . $block;
		}

		return apply_filters( 'mailster_forms_allowed_block_types', array_values( $types ) );

	}

	public function block_editor_settings( $editor_settings, $block_editor_context ) {

		if ( get_post_type( $block_editor_context->post ) !== 'mailster-form' ) {
			return $editor_settings;
		}

		// add inline styles
		if ( $css = get_option( 'mailster_inline_styles' ) ) {
			$editor_settings['styles'][] = array(
				'css'            => $css,
				'__unstableType' => 'user',
				'isGlobalStyles' => true,
			);
		}

		// disable code editor
		// $editor_settings['codeEditingEnabled'] = false;

		return $editor_settings;

	}

	public function block_categories( $categories ) {

		if ( 'mailster-form' != get_post_type() ) {
			return $categories;
		}

		return array_merge(
			array(
				array(
					'slug'  => 'mailster-form-fields',
					'title' => __( 'Newsletter Form Fields', 'mailster' ),
				),
			),
			$categories
		);
	}

	public function register_block_patterns() {

		register_block_pattern_category( 'mailster-forms', array( 'label' => __( 'Mailster Forms', 'mailster' ) ) );

		include MAILSTER_FORM_BLOCK_DIR . 'patterns/form-pattern.php';

		foreach ( $patterns as $key => $pattern ) {

			$args = wp_parse_args(
				$pattern,
				array(
					'inserter'      => false,
					'postTypes'     => array( 'mailster-form' ),
					'keywords'      => array( 'mailster-form' ),
					'viewportWidth' => 600,
				)
			);

			$args['categories'] = array( 'featured', 'mailster-forms' );

			register_block_pattern( 'mailster/pattern_' . $key, $args );
		}

	}

	public function render_form( $form, $options = array(), $check_validity = true ) {

		if ( $check_validity && ! $this->check_validity( $options ) ) {
			return '';
		}

		$form = get_post( $form );

		if ( get_post_type( $form ) != 'mailster-form' ) {
			return '';
		}

		$options['id'] = $form->ID;
		if ( 'the_content' == current_filter() && isset( $options['triggers'] ) ) {
			unset( $options['triggers'] );
		}

		if ( isset( $this->preview_data ) ) {

			$html = '<div class="wp-block-mailster-form-outside-wrapper-' . $options['id'] . ' wp-block-mailster-form-outside-wrapper-placeholder is-empty">' . esc_html__( 'Loading your form...', 'mailster' ) . '</div>';

			if ( $form->post_status != 'auto-draft' ) {
				$options['classes'][] = 'wp-block-mailster-form-outside-wrapper-placeholder';

				$block = parse_blocks( '<!-- wp:mailster/form ' . json_encode( $options ) . ' /-->' );

				$html = render_block( $block[0] );
			}
		} else {

			$block = parse_blocks( '<!-- wp:mailster/form ' . json_encode( $options ) . ' /-->' );

			$html = render_block( $block[0] );

		}

		return $html;

	}


	public function kses( $content ) {

		// allow form elements in KSES
		add_filter( 'wp_kses_allowed_html', array( $this, 'wp_kses_allowed_html' ) );
		$content = wp_kses_post( $content );
		// only here
		remove_filter( 'wp_kses_allowed_html', array( $this, 'wp_kses_allowed_html' ) );

		return $content;
	}


	public function wp_kses_allowed_html( $tags ) {

		$tags['a']['tabindex']     = true;
		$tags['a']['aria-role']    = true;
		$tags['div']['tabindex']   = true;
		$tags['div']['aria-modal'] = true;
		$tags['div']['hidden']     = true;
		$tags['dialog']            = array(
			'id'            => true,
			'class'         => true,
			'name'          => true,
			'type'          => true,
			'value'         => true,
			'spellcheck'    => true,
			'autocomplete'  => true,
			'aria-required' => true,
			'aria-label'    => true,
			'required'      => true,
			'placeholder'   => true,
			'checked'       => true,
		);
		$tags['input']             = array(
			'id'            => true,
			'class'         => true,
			'name'          => true,
			'type'          => true,
			'value'         => true,
			'spellcheck'    => true,
			'autocomplete'  => true,
			'aria-required' => true,
			'aria-label'    => true,
			'required'      => true,
			'placeholder'   => true,
			'checked'       => true,
		);
		$tags['select']            = $tags['input'];
		$tags['form']              = array(
			'action'     => true,
			'method'     => true,
			'novalidate' => true,
			'class'      => true,
			'style'      => true,
			'data-*'     => true,
			'aria-*'     => true,
		);
		$tags['style']             = array(
			'class' => true,
		);
		$tags['script']            = array(
			'class' => true,
			'type'  => true,
		);
		$tags['option']            = array(
			'value' => true,
		);
		$tags['svg']               = array(
			'viewbox' => true,
		);
		$tags['path']              = array(
			'd' => true,
		);

		return $tags;
	}


	public function get_identifier( $form ) {

		$form = get_post( $form );

		$uniqid = get_post_meta( $form->ID, 'uniqid', true );
		if ( ! $uniqid ) {
			$uniqid = uniqid();
			update_post_meta( $form->ID, 'uniqid', $uniqid );
		}

		$identifier_args = array(
			'id'     => $form->ID,
			'uniqid' => $uniqid,
		);

		// create identifier based on arguments
		return hash( 'crc32', md5( serialize( $identifier_args ) ) );
	}


	public function render_homepage_context_callback( $args, $content, WP_Block $block ) {

		$type = isset( $block->parsed_block['attrs']['type'] ) ? $block->parsed_block['attrs']['type'] : 'submission';

		$mailster_page = get_query_var( '_mailster_page', 'submission' );

		// do not render unsubscribe or profile on the wrong page
		if ( $mailster_page && $mailster_page !== $type ) {
			return;
		}

		return $content;
	}


	public function render_form_callback( $args, $content, WP_Block $block ) {

		// maybe we are in a context (homepage)
		$block_context = 'submission';
		if ( ! isset( $args['id'] ) ) {
			$block_context = isset( $block->context['mailster-homepage-context/type'] ) ? $block->context['mailster-homepage-context/type'] : null;
			if ( ! $block_context ) {
				return;
			}
			$args['id'] = isset( $block->context[ 'mailster-homepage-context/' . $block_context ] ) ? $block->context[ 'mailster-homepage-context/' . $block_context ] : null;

			if ( ! $args['id'] ) {
				return;
			}
		}

		if ( ! ( $form = get_post( $args['id'] ) ) ) {
			return;
		}

		// further checks for revisions
		if ( get_post_type( $form ) === 'revision' ) {
			$form = get_post( $form->post_parent );
			if ( get_post_type( $form ) != 'mailster-form' ) {
				return;
			}
		}

		// create identifier based on arguments
		$identifier = $this->get_identifier( $form );
		// is on a page in the backend and loaded via the REST API
		$is_backend = defined( 'REST_REQUEST' ) && REST_REQUEST;

		// get context of the form
		$type = isset( $args['type'] ) ? $args['type'] : $block_context;

		$mailster_page = get_query_var( '_mailster_page', 'submission' );

		// do not render unsubscribe or profile on the wrong page
		if ( ! $is_backend && $mailster_page && $mailster_page !== $type ) {
			return;
		}
		// handle submit button
		$submit_button = null;

		// get submit button text by type if not defined explicitly
		switch ( $type ) {
			case 'profile':
				$submit_button = mailster_text( 'profilebutton' );
				break;
			case 'unsubscribe':
				$submit_button = mailster_text( 'unsubscribebutton' );
				break;
			case 'submission':
				// $submit_button = mailster_text( 'submitbutton' );
				break;

		}

		// is on a page in the backend and loaded via the REST API
		$is_backend = defined( 'REST_REQUEST' ) && REST_REQUEST;
		$is_preview = false;
		$is_popup   = current_filter() !== 'the_content';

		wp_enqueue_script( 'mailster-form-view-script' );

		$args = wp_parse_args(
			$args,
			array(
				'identifier' => $identifier,
				'classes'    => array( 'mailster-block-form-type-content' ), // gets overwritten by other types
				'cooldown'   => 0,
				'isPreview'  => false,
				'type'       => $block_context,
			)
		);

		$blockattributes = $block->attributes;
		// $uniqid          = substr( uniqid(), 8, 5 );
		$uniqid = $identifier;

		// in preview mode check for content here
		$request_body = file_get_contents( 'php://input' );
		if ( ! empty( $request_body ) ) {
			$data = json_decode( $request_body, true );

			if ( isset( $data['block_form_content'] ) ) {
				$content = $data['block_form_content'];

				// merge sent attributes with block attributes
				$args = wp_parse_args( $data['args'], $args );
			} else {
				$content = $form->post_content;
			}
			$is_preview = true;

			// on a page in the backend
		} elseif ( $is_backend ) {

			$content = $form->post_content;

			// on the frontend
		} else {

			$content = $form->post_content;

		}
		$content    = $this->prepare_for_type( $content, $type );
		$content    = $this->rename_submit_button( $content, $submit_button );
		$form_block = $this->get_form_block_from_content( $content );

		$use_cache = ! $is_backend && ! $is_preview;

		// cache the form with a transient
		$cache_key = '_cache_' . $type;

		if ( ! $use_cache || ! ( $output = get_post_meta( $form->ID, $cache_key, true ) ) ) {

			$output = render_block( $form_block );

			$args['classes'][] = 'wp-block-mailster-form-outside-wrapper';
			$args['classes'][] = 'wp-block-mailster-form-outside-wrapper-' . $uniqid;
			$args['classes'][] = 'wp-block-mailster-form-outside-wrapper-' . $form->ID;

			if ( isset( $blockattributes['align'] ) ) {
				$args['classes'][] = 'align' . $blockattributes['align'];
			}

			$embeded_style = '';
			foreach ( $form_block['innerBlocks'] as $block ) {

				if ( $block['blockName'] === 'mailster/messages' ) {
					if ( ! empty( $block['attrs'] ) ) {
						$embeded_style .= '.wp-block-mailster-form-outside-wrapper-' . $uniqid . '{';
						foreach ( $block['attrs'] as $key => $value ) {
							if ( ! is_array( $value ) ) {
								   $embeded_style .= '--mailster--color--' . strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $key ) ) . ': ' . $value . ';';
							}
						}
						$embeded_style .= '}';
					}
				} elseif ( $block['blockName'] === 'core/embed' ) {
					$content = wp_oembed_get( $block['attrs']['url'], $block['attrs'] );
					$output  = str_replace( $block['innerHTML'], $content, $output );
				}
			}

			if ( isset( $form_block['attrs']['className'] ) ) {
				$args['classes'][] = $form_block['attrs']['className'];
			}

			$custom_styles = array();

			if ( isset( $form_block['attrs']['padding'] ) ) {
				$custom_styles[''][] = 'padding:' . $form_block['attrs']['padding'] . 'px';
			}
			if ( isset( $form_block['attrs']['color'] ) ) {
				$custom_styles[''][] = 'color:' . $form_block['attrs']['color'];
			}
			if ( isset( $args['width'] ) ) {
				$custom_styles['.mailster-block-form'][] = 'flex-basis:' . $args['width'] . '%';
			}
			if ( isset( $args['padding'] ) ) {
				foreach ( $args['padding'] as $key => $value ) {
					$custom_styles['.mailster-block-form'][] = 'padding-' . $key . ':' . $value;
				}
			}
			if ( isset( $args['animation'] ) ) {
				$args['classes'][] = 'has-animation animation-' . $args['animation'];
			}

			if ( isset( $form_block['attrs']['background']['image'] ) ) {

				$background = $form_block['attrs']['background'];

				$custom_styles['::before'] = array(
					'content:"";top:0;left:0;bottom:0;right:0;',
					'background-image:url(' . $background['image'] . ')',
					'opacity:' . $background['opacity'] . '%',
				);
				if ( $background['fixed'] ) {
					$custom_styles['::before'][] = 'background-attachment:fixed';
				}
				if ( isset( $background['fullscreen'] ) && $background['fullscreen'] ) {
					$args['classes'][]           = 'mailster-form-is-fullscreen';
					$custom_styles['::before'][] = 'position:fixed';
					$custom_styles['::before'][] = 'background-size:cover';
				} else {
					$custom_styles['::before'][] = 'position:absolute';
					$custom_styles['::before'][] = 'background-size:' . ( ! is_numeric( $background['size'] ) ? $background['size'] : $background['size'] . '%' );
					$custom_styles['::before'][] = 'background-position:' . ( $background['position']['x'] * 200 - 50 ) . '% ' . ( $background['position']['y'] * 100 ) . '%';
				}
				if ( $background['repeat'] ) {
					$custom_styles['::before'][] = 'background-repeat:repeat';
				} else {
					$custom_styles['::before'][] = 'background-repeat:no-repeat';
				}
			}
			if ( isset( $form_block['attrs']['borderRadius'] ) ) {
				$custom_styles[''][]         = 'border-radius:' . $form_block['attrs']['borderRadius'];
				$custom_styles['::before'][] = 'border-radius:' . $form_block['attrs']['borderRadius'];
			}

			if ( isset( $form_block['attrs']['style'] ) ) {
				$custom_styles[' .mailster-label'] = array();
				$custom_styles[' .input']          = array();

				foreach ( $form_block['attrs']['style'] as $key => $value ) {
					if ( $value ) {
						switch ( $key ) {
							case 'labelColor':
								$custom_styles[' .mailster-label'][] = 'color:' . $value;
								break;
							case 'inputColor':
								$key = 'color';
							case 'borderWidth':
							case 'backgroundColor':
							case 'borderColor':
							case 'borderRadius':
								$custom_styles[' .input'][] = strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $key ) ) . ':' . $value;
								break;
						}
					}
				}
			}

			if ( ! empty( $custom_styles ) ) {
				foreach ( $custom_styles as $selector => $property ) {
					$embeded_style .= '.wp-block-mailster-form-outside-wrapper-' . $uniqid . ' .wp-block-mailster-form-wrapper' . $selector . '{';
					$embeded_style .= implode( ';', $property );
					$embeded_style .= '}';
				}
			}

			// add theme specific styles
			if ( $is_popup ) {
				$embeded_style .= $this->get_theme_styles( '.wp-block-mailster-form-outside-wrapper-' . $uniqid . ':not(.mailster-block-form-type-content) .wp-block-mailster-form-wrapper.mailster-block-form' );
			}

			// add inline styles from block for visual accuracy (only backend)
			if ( ! $is_preview && $is_backend && $input_styles = get_option( 'mailster_inline_styles' ) ) {
				$embeded_style .= $input_styles;
			}

			$events = '';
			if ( isset( $form_block['attrs']['events'] ) ) {
				foreach ( $form_block['attrs']['events'] as $eventname => $rawjs ) {
					if ( empty( $rawjs ) ) {
						continue;
					}

					$events .= 'window.mailsterBlockEvents[' . $form->ID . ']["' . $eventname . '"] = function(){' . $rawjs . '};';
				}
			}

			if ( ! empty( $events ) ) {
				$output = '<script class="mailster-form-script-' . $uniqid . '">window.mailsterBlockEvents = window.mailsterBlockEvents || {};window.mailsterBlockEvents[' . $form->ID . '] = window.mailsterBlockEvents[' . $form->ID . '] || {};' . $events . '</script>' . $output;
			}

			if ( isset( $form_block['attrs']['css'] ) ) {

				$htmldoc = new \InlineStyle\InlineStyle();

				foreach ( $form_block['attrs']['css'] as $name => $rawcss ) {
					if ( empty( $rawcss ) ) {
						continue;
					}

					// just css
					$rawcss = wp_strip_all_tags( $rawcss );

					$parsed    = $htmldoc->parseStylesheet( $rawcss );
					$css       = '';
					$css_rules = array();
					foreach ( $parsed as $rule ) {
						$selector = array_shift( $rule );
						if ( ! empty( $rule ) ) {
							// wrapper needs no extra space
							if ( '.wp-block-mailster-form-outside-wrapper' != $selector ) {
								$selector = ' ' . $selector;
							}

							// prefix for more specificity
							$selector = 'div.wp-block-mailster-form-outside-wrapper.wp-block-mailster-form-outside-wrapper-' . $uniqid . '.wp-block-mailster-form-outside-wrapper-' . $form->ID . $selector;

							$rule = implode( ';', $rule );

							// check if we have same values for different selectors and merge them
							if ( false !== ( $key = array_search( $rule, $css_rules ) ) ) {
								$css_rules[ $key . ',' . $selector ] = $rule;
								unset( $css_rules[ $key ] );
							} else {
								$css_rules[ $selector ] = $rule;
							}
						}
					}

					foreach ( $css_rules as $selectors => $value ) {
						$css .= $selectors . '{' . $value . '}';
					}

					switch ( $name ) {
						case 'tablet':
							$embeded_style .= '@media only screen and (max-width: 800px) {' . $css . '}';
							break;
						case 'mobile':
							$embeded_style .= '@media only screen and (max-width: 400px) {' . $css . '}';
							break;
						default:
							$embeded_style .= $css;
							break;
					}
				}

				$embeded_style = str_replace( array( "\r", "\n", "\t" ), '', $embeded_style );
			}

			if ( ! empty( $embeded_style ) ) {
				$output = '<style class="mailster-form-style-' . $uniqid . '">' . $embeded_style . '</style>' . $output;
			}

			if ( $is_popup ) {
				$output = '<div class="' . implode( ' ', $args['classes'] ) . '" aria-modal="true" aria-label="' . esc_attr__( 'Newsletter Signup Form', 'mailster' ) . '" role="div" aria-hidden="true" tabindex="-1" hidden>' . $output . '</div>';
			} else {
				$output = '<div class="' . implode( ' ', $args['classes'] ) . '">' . $output . '</div>';
			}

			if ( $is_backend ) {
				$output = do_shortcode( $output );
			}

			// save to cache
			if ( $use_cache ) {
				// update_post_meta( $form->ID, $cache_key, $output );
			}
		}

		$form_args = array(
			'id'         => $args['id'],
			'identifier' => $args['identifier'],
			'cooldown'   => $args['cooldown'],
			'isPreview'  => $args['isPreview'],
			'type'       => $args['type'],
		);

		if ( isset( $args['triggers'] ) ) {
			$form_args['triggers'] = $args['triggers'];
			foreach ( $args['triggers'] as $trigger ) {
				if ( isset( $args[ 'trigger_' . $trigger ] ) ) {
					$form_args[ 'trigger_' . $trigger ] = $args[ 'trigger_' . $trigger ];
				}
			}
		}

		$inject  = '';
		$inject .= '<script class="mailster-block-form-data" type="application/json">' . json_encode( $form_args ) . '</script>';
		$inject .= '<input name="_timestamp" type="hidden" value="' . esc_attr( time() ) . '" />' . "\n";
		if ( $type !== 'submission' ) {
			$inject .= '<input name="_hash" type="hidden" value="" />' . "\n";
		}
		$campaign_id = get_query_var( '_mailster_extra' );
		if ( $campaign_id ) {
			$inject .= '<input name="_campaign_id" type="hidden" value="' . esc_attr( $campaign_id ) . '" />' . "\n";
		}

		$inject .= '<button class="mailster-block-form-close"  aria-label="' . esc_attr__( 'close', 'mailster' ) . '" tabindex="0"><svg viewbox="0 0 100 100"><path d="M100 10.71 89.29 0 50 39.29 10.71 0 0 10.71 39.29 50 0 89.29 10.71 100 50 60.71 89.29 100 100 89.29 60.71 50z"/></svg></button>';

		// add honeypot field
		if ( ! $is_backend && apply_filters( 'mailster_honeypot', mailster_option( 'check_honeypot' ), $form->ID ) ) {
			$inject .= '<div style="position:absolute;top:-99999px;' . ( is_rtl() ? 'right' : 'left' ) . ':-99999px;z-index:-99;"><input name="n_' . $form->ID . '_mail" type="text" tabindex="-1" autocomplete="noton" autofill="off" aria-hidden="true"></div>';
		}
		$output = str_replace( '</form>', $inject . '</form>', $output );

		return apply_filters( 'mailster_block_form', $output, $form->ID, $form_args );

	}

	public function get_required_fields( $form ) {

		if ( ! ( $form = get_post( $form ) ) ) {
			return;
		}

		// get all input, select or textareas fields which have an required attribute
		if ( preg_match_all( '/<(input|select|textarea)(.*?)name="(.*?)"(.*?)(aria-required="true")(.*?)>/', $form->post_content, $matches, PREG_SET_ORDER, 0 ) ) {

			$fields = array_values( array_unique( wp_list_pluck( $matches, 3 ) ) );

			return $fields;

		}

		return array();

	}

	/**
	 * Prepare the content for Unsubscribe and Profile pages
	 *
	 * @param string $content
	 * @param array  $type
	 *
	 * @return string
	 */
	private function prepare_for_type( $content, $type ) {

		// on profile and unsubscribe remove certain fields
		if ( $type === 'unsubscribe' ) {

			// remove custom fields
			$fields   = mailster()->get_custom_fields( true );
			$fields[] = 'firstname';
			$fields[] = 'lastname';
			$fields   = implode( '|', $fields );
			// remove all custom fields
			$content = preg_replace( '/<!-- wp:(mailster\/field\-(' . $fields . '))(.*?)-->(.*?)<!-- \/wp:(\1) -->/s', '', $content );

			// remove gdpr and lists
			$content = preg_replace( '/<!-- wp:(mailster\/(gdpr|lists))(.*?)-->(.*?)<!-- \/wp:(\1) -->/s', '', $content );

		} elseif ( $type === 'profile' ) {

			// remove gdpr
			$content = preg_replace( '/<!-- wp:(mailster\/(gdpr))(.*?)-->(.*?)<!-- \/wp:(\1) -->/s', '', $content );

			$dropdown = '<div class="wp-block-mailster-field-status mailster-wrapper mailster-wrapper-type-status"><label for="mailster-input-status" class="mailster-label">Status</label><select name="_status" id="mailster-input-status" class="input" aria-required="false" aria-label="Dropdown"><option value="1">' . esc_html__( 'Subscribed', 'mailster' ) . '</option><option value="2">' . esc_html__( 'Unsubscribed', 'mailster' ) . '</option></select></div>';

			$dropdown = '';

			$content = preg_replace( '/(<!-- wp:(mailster\/(field\-email))(.*?)-->(.*?)<!-- \/wp:(\2) -->)/s', $dropdown . ' $1', $content );

		}

		return $content;
	}

	private function rename_submit_button( $content, $submit_button ) {

		if ( $submit_button ) {
			$content = preg_replace( '/<!-- wp:(mailster\/field\-submit)(.*?)-->(.*?)(value=")(.*?)(")(.*?)<!-- \/wp:(\1) -->/s', '<!-- wp:mailster/field-submit$2-->$3$4' . $submit_button . '$6$7<!-- /wp:mailster/field-submit-->', $content );
		}

		return $content;
	}

	private function get_form_block( $form ) {

		$form = get_post( $form );
		if ( ! $form ) {
			return null;
		}
		return $this->get_form_block_from_content( $form->post_content );
	}


	private function get_form_block_from_content( $post_content ) {

		$parsed = parse_blocks( $post_content );
		foreach ( $parsed as $block ) {
			if ( $block['blockName'] == 'mailster/form-wrapper' ) {
				return $block;
			}
		}

		return null;
	}

	public function maybe_set_homepage( $post_id, $post, $update ) {

		$homepage = mailster_option( 'homepage' );

		if ( preg_match( '/<!-- wp:(mailster\/(homepage))(.*?)-->(.*?)<!-- \/wp:(\1) -->/s', $post->post_content, $matches ) ) {

			if ( ! $homepage ) {
				mailster_update_option( 'homepage', $post_id );
			}
		}

		if ( ! $homepage ) {

		}

	}

	public function clear_cache( $post_id ) {

		delete_post_meta( $post_id, '_cached' );
		set_transient( 'mailster_forms', '' );

	}

	public function clear_inline_style() {

		update_option( 'mailster_inline_styles', '', 'no' );
	}


	public function impression( $form_id, $subscriber_id = null, $post_id = null ) {

		return $this->action( 'impression', $form_id, $subscriber_id, $post_id );

	}

	public function signup( $form_id, $subscriber_id = null, $post_id = null ) {

		return $this->action( 'signup', $form_id, $subscriber_id, $post_id );

	}

	public function conversion( $form_id, $subscriber_id = null, $post_id = null ) {

		return $this->action( 'conversion', $form_id, $subscriber_id, $post_id );

	}


	private function action( $type, $form_id, $subscriber_id, $post_id ) {

		global $wpdb;

		$actions = array(
			'impression' => 1,
			'signup'     => 2,
			'conversion' => 3,
		);

		if ( ! isset( $actions[ $type ] ) ) {
			return new WP_Error( 'invalid_action', 'There is no such action' );
		}

		// TODO maybe not useful.
		$current_user = get_current_user_id();
		if ( $current_user && $current_user == get_post( $form_id )->post_author ) {
			// return new WP_Error( 'no_action', 'no action for author of the form', array( 'status' => 406 ) );
		}

		$action_type = $actions[ $type ];

		$data = array(
			'timestamp' => time(),
			'type'      => $action_type,
		);

		// always create a new entry on impression
		if ( $action_type == 1 ) {
			$entry = false;
		} else {
			$entry = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}mailster_form_actions WHERE form_id = %d AND subscriber_id = %d AND subscriber_id != 0", $form_id, $subscriber_id ) );
		}

		// entry exists
		if ( $entry ) {

			if ( false !== $wpdb->update( "{$wpdb->prefix}mailster_form_actions", $data, array( 'ID' => $entry->ID ) ) ) {
				do_action( 'mailster_form_' . $type, $form_id, $subscriber_id, $entry->post_id );
			}

			return true;
		}

		$data = wp_parse_args(
			$data,
			array(
				'form_id'       => $form_id,
				'post_id'       => $post_id,
				'subscriber_id' => $subscriber_id,
			)
		);

		if ( false !== $wpdb->insert( "{$wpdb->prefix}mailster_form_actions", $data ) ) {
			do_action( 'mailster_form_' . $type, $form_id, $subscriber_id, $post_id );
		}

		return true;

	}

	public function get_impressions( $form_id = '' ) {

		global $wpdb;

		$cache_key = 'form_get_impressions_' . $form_id;

		if ( false === ( $val = mailster_cache_get( $cache_key ) ) ) {

			$sql = "SELECT COUNT(*) FROM {$wpdb->prefix}mailster_form_actions WHERE type = 1";
			if ( $form_id ) {
				$sql .= $wpdb->prepare( ' AND form_id = %d', $form_id );
			}
			$val = $wpdb->get_var( $sql );

			mailster_cache_add( $cache_key, $val );
		}

		return (int) $val;

	}

	public function get_conversions( $form_id = '' ) {

		global $wpdb;
		$cache_key = 'form_get_conversions_' . $form_id;

		if ( false === ( $val = mailster_cache_get( $cache_key ) ) ) {

			$sql = "SELECT COUNT(*) FROM {$wpdb->prefix}mailster_subscriber_meta AS meta LEFT JOIN {$wpdb->prefix}mailster_subscribers AS subscribers ON subscribers.ID = meta.subscriber_id WHERE subscribers.status != 0";
			if ( $form_id ) {
				$sql .= $wpdb->prepare( " AND meta.meta_key = 'form' AND  meta.meta_value = %d", $form_id );
			}
			$val = $wpdb->get_var( $sql );

			$sql = "SELECT COUNT(*) FROM {$wpdb->prefix}mailster_form_actions WHERE type = 3";
			if ( $form_id ) {
				$sql .= $wpdb->prepare( ' AND form_id = %d', $form_id );
			}
			$val = $wpdb->get_var( $sql );

			mailster_cache_add( $cache_key, $val );
		}

		return (int) $val;

	}

	public function get_conversion_rate( $form_id = '' ) {

		$impressions = $this->get_impressions( $form_id );
		$conversions = $this->get_conversions( $form_id );

		$rate = $impressions ? $conversions / $impressions : 0;

		return max( min( 1, $rate ), 0 );

	}


	public function on_install( $new = false ) {

		if ( $new ) {

			$content = file_get_contents( MAILSTER_FORM_BLOCK_DIR . 'patterns/default-form.php' );

			wp_insert_post(
				array(
					'post_title'   => esc_html__( 'Default Form', 'mailster' ),
					'post_content' => wp_slash( $content ),
					'post_status'  => 'publish',
					'post_type'    => 'mailster-form',
				)
			);

			update_option( 'mailster_inline_styles', '', 'no' );

		}

	}
}
