<?php

/**
 * Fetch an array of users mutual friends.
 *
 * @param $retval
 *
 * @return mixed
 */
function bp_mutual_friends_user_filter( $arg ) {

	if ( bp_is_mutual_friends_component() ) {
		$arg['exclude'] = bp_uncommon_friends();
		$arg['user_id'] = get_current_user_id();
		//$arg['per_page'] = apply_filters( 'bp_mutual_friends_per_page', 0 );
	} else if ( defined( 'DOING_AJAX' )
	            && isset( $_REQUEST['user_id'] )
	            && 'mutual_friends_dialog' === $_REQUEST['action']
	) {


		$arg['per_page'] = apply_filters( 'bp_mutual_friends_per_page', 0 );
		$arg['exclude']  = bp_uncommon_friends( intval( $_REQUEST['user_id'] ) );

		$arg['user_id'] = get_current_user_id();
	}


	return $arg;
}

add_filter( 'bp_after_core_get_users_parse_args', 'bp_mutual_friends_user_filter' );


/**
 * Get the unmutual friends of the current user
 * @since 1.0
 * @return mixed|void
 */
function bp_uncommon_friends( $friend_user_id = '' ) {

	$result = array();

	$current_user_friends = friends_get_friend_user_ids( get_current_user_id() );


	if ( empty( $friend_user_id ) ) {

		$friend_user_id = bp_displayed_user_id();
	}

	$displayed_user_friends = friends_get_friend_user_ids( $friend_user_id );

	$current_user_friends_requested   = friends_get_friend_user_ids( get_current_user_id(), true );
	$displayed_user_friends_requested = friends_get_friend_user_ids( $friend_user_id, true );

	$result = array_merge( array_diff( $current_user_friends, $displayed_user_friends ), array_diff( $displayed_user_friends, $current_user_friends ) );

	$result = array_merge( $current_user_friends_requested, $displayed_user_friends_requested, $result );

	return apply_filters( 'bp_uncommon_friends', $result );
}

/**
 * Get the mutual friend count of a current user.
 *
 * @params int
 *
 * @return mixed|void
 */
function bp_mutual_friend_total_count( $friend_user_id = 0 ) {

	$current_user_friends = friends_get_friend_user_ids( get_current_user_id() );

	if ( empty( $friend_user_id ) ) {
		$friend_user_id = bp_displayed_user_id();
	}

	$displayed_user_friends = friends_get_friend_user_ids( $friend_user_id );

	$result = count( array_intersect( $current_user_friends, $displayed_user_friends ) );

	return apply_filters( 'bp_mutual_friend_total_count', $result );
}

/**
 * Get the mutual friends count
 * @return int
 * @since 1.0
 */
function bp_directory_mutual_friends_count() {
	global $members_template;

	if ( ! is_user_logged_in() ) {
		return;
	}

	$mutual_friends_count = bp_mutual_friend_total_count( $members_template->member->ID );

	if ( get_current_user_id() == $members_template->member->ID ) {
		return;
	}

	?>
	<div class="item-meta">
		<a href="" data-user-id="<?php echo $members_template->member->ID; ?>" class="mutual-friends">
			<?php printf( _n( '%s mutual friend', '%s mutual friends', $mutual_friends_count, 'buddypress' ), $mutual_friends_count ); ?>
		</a>
	</div>
	<?php
}

add_action( 'bp_directory_members_item', 'bp_directory_mutual_friends_count' );
