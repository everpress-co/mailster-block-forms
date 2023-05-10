<?php


use Elementor\Controls_Manager;
use Elementor\Widget_Base;
use Elementor\Repeater;

class Elementor_Mailster_Form extends Widget_Base {

	public function get_name() {
		return 'mailster-block-form';
	}

	public function get_title() {
		return __( 'Mailster Form', 'mailster' );
	}

	public function get_icon() {
		return 'eicon-form-horizontal';
	}

	public function get_categories() {
		return array( 'general' );
	}
	public function get_keywords() {
		return array( 'mailster', 'form', 'newsletter', 'signup' );
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'form_section',
			array(
				'label' => __( 'Form', 'mailster' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$forms = mailster( 'block-forms' )->get_all();

		$options = array( '0' => __( 'Select form', 'mailster' ) );
		foreach ( $forms as $form ) {
			$options[ $form->ID ] = $form->post_title;
		}

		$this->add_control(
			'form',
			array(
				'type'    => Controls_Manager::SELECT,
				'label'   => esc_html__( 'Form', 'mailster' ),
				'options' => $options,
				'default' => '0',
			)
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$form     = isset( $settings['form'] ) ? $settings['form'] : null;
		if ( ! $form ) {
			return;
		}
		echo mailster( 'block-forms' )->render_form( $form, array(), false );

	}
}
