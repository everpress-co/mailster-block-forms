<?php

$pattern_files = glob( MAILSTER_FORM_BLOCK_DIR . 'includes/pattern/*.php' );

$patterns = array();
foreach ( $pattern_files as $file ) {

	$name = pathinfo( $file, PATHINFO_FILENAME );
	$name = str_replace( array( '-', '_' ), array( ' ' ), $name );
	$name = ucwords( $name );

	$patterns[] = array(
		'viewportWidth' => 962,
		'title'         => $name,
		'content'       => file_get_contents( $file ),
	);
}


$patterns = apply_filters( 'mailster_form_patterns', $patterns );
