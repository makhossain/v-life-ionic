<?php
class JSON_API_User_Controller
{
	private $uid;
	public static $affiliate_id;
	public $source_type = 'woo';
	public static $special_payment_type = '';	
    public static $checkout_referrals_select_settings = array();
    public static $coupon_code = '';	
	public static $campaign;
	public static $visit_id = 0;  
	public static $currency;
	private $base_url;
	
	public

	function __construct()
	{
		global $json_api;
			    $this->base_url = "https://helioz365.com/payments/public";
		if (empty($_SERVER['HTTPS']) || (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'off')) {
			if (empty($_REQUEST['insecure']) || $_REQUEST['insecure'] != 'cool') {
				$json_api->error("SSL is not enabled. Either use _https_ or provide 'insecure' var as insecure=cool to confirm you want to use http protocol.");
			}
		}
		
		self::$campaign = '';
		self::$currency = get_option('cas_currency');
		if (!self::$currency){
			self::$currency = 'USD';
		}		
	}

	public

	function cs_jua_email_exists()
	{
		global $json_api;
		if ($user = get_user_by('email', $json_api->query->email)) {
			$json_api->error("Username already exists");
		}
		else {
			return array(
				"user_id" => $user,
			);
		}
	}

	public

	function info()
	{
		global $json_api;
		return array(
			"version" => CS_JUA_VERSION
		);
	}

	public

	function register()
	{
		global $json_api;
		if (!get_option('users_can_register')) {
			$json_api->error("User registration is disabled. Please enable it in Settings > Gereral.");
		}

		if (!$json_api->query->username) {
			$json_api->error("You must include 'username' var in your request. ");
		}
		else {
			$username = sanitize_user($json_api->query->username);
		}

		if (!$json_api->query->email) {
			$json_api->error("You must include 'email' var in your request. ");
		}
		else {
			$email = sanitize_email($json_api->query->email);
		}

		if (!$json_api->query->nonce) {
			$json_api->error("You must include 'nonce' var in your request. Use the 'get_nonce' Core API method. ");
		}
		else {
			$nonce = sanitize_text_field($json_api->query->nonce);
		}

		if (!$json_api->query->display_name) {
			$json_api->error("You must include 'display_name' var in your request. ");
		}
		else {
			$display_name = sanitize_text_field($json_api->query->display_name);
		}

		$user_pass = sanitize_text_field($_REQUEST['user_pass']);
		if ($json_api->query->seconds) {
			$seconds = (int)$json_api->query->seconds;
		}
		else {
			$seconds = 1209600;
		}

		// 14 days
		// Add usernames we don't want used

		$invalid_usernames = array(
			'admin'
		);

		// Do username validation

		$nonce_id = $json_api->get_nonce_id('user', 'register');
		if (!wp_verify_nonce($json_api->query->nonce, $nonce_id)) {
			$json_api->error("Invalid access, unverifiable 'nonce' value. Use the 'get_nonce' Core API method. ");
		}
		else {
			if (!validate_username($username) || in_array($username, $invalid_usernames)) {
				$json_api->error("Username is invalid.");
			}
			elseif (username_exists($username)) {
				$json_api->error("Username already exists.");
			}
			else {
				if (!is_email($email)) {
					$json_api->error("E-mail address is invalid.");
				}
				elseif (email_exists($email)) {
					$json_api->error("E-mail address is already in use.");
				}
				else {

					// Everything has been validated, proceed with creating the user
					// Create the user

					if (!isset($_REQUEST['user_pass'])) {
						$user_pass = wp_generate_password();
						$_REQUEST['user_pass'] = $user_pass;
					}

					$_REQUEST['user_login'] = $username;
					$_REQUEST['user_email'] = $email;
					$allowed_params = array(
						'user_login',
						'user_email',
						'user_pass',
						'display_name',
						'user_nicename',
						'user_url',
						'nickname',
						'first_name',
						'last_name',
						'description',
						'rich_editing',
						'user_registered',
						'role',
						'jabber',
						'aim',
						'yim',
						'comment_shortcuts',
						'admin_color',
						'use_ssl',
						'show_admin_bar_front',
					);
					foreach($_REQUEST as $field => $value) {
						if (in_array($field, $allowed_params)) {
							$user[$field] = trim(sanitize_text_field($value));
						}
					}

					$user['role'] = get_option('default_role');
					$user_id = wp_insert_user($user);

					// adding meta value

					/*Send e-mail to admin and new user -
					You could create your own e-mail instead of using this function*/
					if (isset($_REQUEST['user_pass']) && $_REQUEST['notify'] == 'no') {
						$notify = '';
					}
					elseif ($_REQUEST['notify'] != 'no') {
						$notify = $_REQUEST['notify'];
					}

					if ($user_id) {
						wp_new_user_notification($user_id, '', $notify);
					}
				}
			}
		}

		$expiration = time() + apply_filters('auth_cookie_expiration', $seconds, $user_id, true);
		$cookie = wp_generate_auth_cookie($user_id, $expiration, 'logged_in');
		return array(
			"cookie" => $cookie,
			"user_id" => $user_id,
		);
	}

	public function upload_profile_photo() {
		
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` Auth API method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid authentication cookie. Use the `generate_auth_cookie` method.");
		}

		$avatar = $json_api->query->jas_avatar;

        if ( is_string($avatar)){
			$upload_dir       = wp_upload_dir();
		
			// @new
			$upload_path      = str_replace( '/', DIRECTORY_SEPARATOR, $upload_dir['path'] ) . DIRECTORY_SEPARATOR;
			$img = str_replace('data:image/png;base64,', '', $img);
			$img = str_replace(' ', '+', $img);
			$decoded          = base64_decode($img) ;
			$filename         = 'profile.png';
			$hashed_filename  = md5( $filename . microtime() ) . '_' . $filename;
			// @new
			$image_upload     = file_put_contents( $upload_path . $hashed_filename, $decoded );
            // @new
    		$file             = array();
    		$file['error']    = '';
    		$file['tmp_name'] = $upload_path . $hashed_filename;
    		$file['name']     = $hashed_filename;
    		$file['type']     = 'image/png';
    		$file['size']     = filesize( $upload_path . $hashed_filename );
    
    		// upload file to server
    		// @new use $file instead of $image_upload
    		$file_return      = wp_handle_sideload( $file, array( 'test_form' => false ) );
    
    		$filename = $file_return['file'];
    		$attachment = array(
    		 'post_mime_type' => $file_return['type'],
    		 'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
    		 'post_content' => '',
    		 'post_status' => 'inherit',
    		 'guid' => $wp_upload_dir['url'] . '/' . basename($filename)
    		 );
    		$attach_id = wp_insert_attachment( $attachment, $filename, 289 );
    		require_once(ABSPATH . 'wp-admin/includes/image.php');
    		$attach_data = wp_generate_attachment_metadata( $attach_id, $filename );
    		wp_update_attachment_metadata( $attach_id, $attach_data );
            		
        } else {
                
            require_once( ABSPATH . 'wp-admin/includes/file.php' );
            $upload_overrides           = array( 'test_form' => false );
            $movefile                   = wp_handle_upload( $files,  $upload_overrides);

            $upload_dir                 = wp_upload_dir();
            $image_data                 = file_get_contents($movefile['url']);
            $filename                   = basename($movefile['url']);
            if(wp_mkdir_p($upload_dir['path'])){
                $file                   = $upload_dir['path'] . '/' . $filename;
            } else {
                $file                   = $upload_dir['basedir'] . '/' . $filename;
            }                                   
            file_put_contents($file, $image_data);
    
            $wp_filetype = wp_check_filetype($filename, null );
            $attachment = array(
                'post_mime_type' => $wp_filetype['type'],
                'post_title' => sanitize_file_name($filename),
                'post_content' => '',
                'post_status' => 'inherit'
            );
            $attach_id = wp_insert_attachment( $attachment, $file, 1 );
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            $attach_data = wp_generate_attachment_metadata( $attach_id, $file );
            wp_update_attachment_metadata( $attach_id, $attach_data ); 
        }
		
		return $attach_id;		

	}

	public function get_menu()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` Auth API method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid authentication cookie. Use the `generate_auth_cookie` method.");
		}

		$lang = get_user_meta($user_id, 'lang', true);
		if ($lang == "en") {
			$menuid = 134;
		}
		else
		if ($lang == "ch") {
			$menuid = 135;
		}
		else {
			$menuid = 134;
		}

		$menuLocations = get_nav_menu_locations();
		$items = wp_get_nav_menu_items($menuid);
		$tmp = [];
		$s = 0;
		foreach($items as $key => $item) {
			$tmp[$s] = ['serial' => $s, 'id' => $item->ID, 'menu_item_parent' => $item->menu_item_parent, 'name' => strip_tags($item->title) , 'iconClass' => get_post_meta($item->ID, 'menu-item-app-icon', true) , 'type' => ($item->type_label == 'Page') ? 'page' : get_post_meta($item->ID, 'menu-item-app-type', true) , 'url' => ($item->type_label == 'Page') ? $item->object_id : get_post_meta($item->ID, 'menu-item-app-url', true) ];
			$s++;
		}

		$menus = $items ? $this->buildTree($tmp, 0) : null;
		return array(
			"menu" => $menus
		);
	}

	public

	function buildTree(array & $elements, $parentId = 0)
	{
		$branch = array();
		foreach($elements as & $element) {
			if ($element['menu_item_parent'] == $parentId) {
				$children = $this->buildTree($elements, $element['id']);
				if ($children) {
					$element['items'] = $children;
				}
				else {
					$element['items'] = "";
				}

				$branch[$element['serial']] = $element;
				unset($element);
			}
		}

		return $branch;
	}

	public

	function get_avatar()
	{
		global $json_api;
		if (function_exists('bp_is_active')) {
			if (!$json_api->query->user_id) {
				$json_api->error("You must include 'user_id' var in your request. ");
			}

			if (!$json_api->query->type) {
				$json_api->error("You must include 'type' var in your request. possible values 'full' or 'thumb' ");
			}

			$avatar = bp_core_fetch_avatar(array(
				'item_id' => $json_api->query->user_id,
				'type' => $json_api->query->type,
				'html' => false
			));
			return array(
				'avatar' => $avatar
			);
		}
		else {
			$json_api->error("You must install and activate BuddyPress plugin to use this method.");
		}
	}

	public

	function get_userinfo()
	{
		global $json_api;
		if (!$json_api->query->user_id) {
			$json_api->error("You must include 'user_id' var in your request. ");
		}

		$user = get_userdata($json_api->query->user_id);
		preg_match('|src="(.+?)"|', get_avatar($user->ID, 32) , $avatar);
		return array(
			"id" => $user->ID,
			"nicename" => $user->user_nicename,
			"url" => $user->user_url,
			"displayname" => $user->display_name,
			"firstname" => $user->user_firstname,
			"lastname" => $user->last_name,
			"nickname" => $user->nickname,
			"avatar" => $avatar[1],
		);
	}

	public

	function retrieve_password()
	{
		global $wpdb, $json_api, $wp_hasher;
		if (!$json_api->query->user_login) {
			$json_api->error("You must include 'user_login' var in your request. ");
		}

		$user_login = $json_api->query->user_login;
		if (strpos($user_login, '@')) {
			$user_data = get_user_by('email', trim($user_login));
			if (empty($user_data)) {
				$json_api->error("Your email address not found! ");
			}
		}
		else {
			$login = trim($user_login);
			$user_data = get_user_by('login', $login);
		}

		// redefining user_login ensures we return the right case in the email

		$user_login = $user_data->user_login;
		$user_email = $user_data->user_email;
		do_action('retrieve_password', $user_login);
		$allow = apply_filters('allow_password_reset', true, $user_data->ID);
		if (!$allow) {
			$json_api->error("password reset not allowed! ");
		}
		elseif (is_wp_error($allow)) {
			$json_api->error("An error occured! ");
		}

		$key = wp_generate_password(20, false);
		do_action('retrieve_password_key', $user_login, $key);
		if (empty($wp_hasher)) {
			require_once ABSPATH . 'wp-includes/class-phpass.php';

			$wp_hasher = new PasswordHash(8, true);
		}

		$hashed = time() . ':' . $wp_hasher->HashPassword($key);
		$wpdb->update($wpdb->users, array(
			'user_activation_key' => $hashed
		) , array(
			'user_login' => $user_login
		));
		$message = __('Someone requested that the password be reset for the following account:') . "\r\n\r\n";
		$message.= network_home_url('/') . "\r\n\r\n";
		$message.= sprintf(__('Username: %s') , $user_login) . "\r\n\r\n";
		$message.= __('If this was a mistake, just ignore this email and nothing will happen.') . "\r\n\r\n";
		$message.= __('To reset your password, visit the following address:') . "\r\n\r\n";
		$message.= '<' . network_site_url("wp-login.php?action=rp&key=$key&login=" . rawurlencode($user_login) , 'login') . ">\r\n";
		if (is_multisite()) {
			$blogname = $GLOBALS['current_site']->site_name;
		}
		else {
			$blogname = wp_specialchars_decode(get_option('blogname') , ENT_QUOTES);
		}

		$title = sprintf(__('[%s] Password Reset') , $blogname);
		$title = apply_filters('retrieve_password_title', $title);
		$message = apply_filters('retrieve_password_message', $message, $key);
		if ($message && !wp_mail($user_email, $title, $message)) {
			$json_api->error("The e-mail could not be sent. Possible reason: your host may have disabled the mail() function...");
		}
		else {
			return array(
				"msg" => 'Link for password reset has been emailed to you. Please check your email.',
			);
		}
	}

	public

	function validate_auth_cookie()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' authentication cookie. Use the `create_auth_cookie` method.");
		}

		$valid = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in') ? true : false;
		return array(
			"valid" => $valid,
		);
	}

	public

	function generate_auth_cookie()
	{
		global $json_api;
		foreach($_POST as $k => $val) {
			if (isset($_POST[$k])) {
				$json_api->query->$k = $val;
			}
		}

		if (!$json_api->query->username && !$json_api->query->email) {
			$json_api->error("You must include 'username' or 'email' var in your request to generate cookie.");
		}

		if (!$json_api->query->password) {
			$json_api->error("You must include a 'password' var in your request.");
		}

		if ($json_api->query->seconds) {
			$seconds = (int)$json_api->query->seconds;
		}
		else {
			$seconds = 1209600;
		}

		// 14 days

		if ($json_api->query->email) {
			if (is_email($json_api->query->email)) {
				if (!email_exists($json_api->query->email)) {
					$json_api->error("email does not exist.");
				}
			}
			else {
				$json_api->error("Invalid email address.");
			}

			$user_obj = get_user_by('email', $json_api->query->email);
			$user = wp_authenticate($user_obj->data->user_login, $json_api->query->password);
		}
		else {
			if (is_email($json_api->query->username)) {
				if (!email_exists($json_api->query->username)) {
					$json_api->error("email does not exist.");
				}
			}
			else {
				$json_api->error("Invalid email address.");
			}

			$userdata = get_user_by('email', $json_api->query->username);
			$result = wp_check_password($json_api->query->password, $userdata->user_pass, $userdata->ID);
			if ($result) {
				$user = wp_authenticate($json_api->query->username, $json_api->query->password);
			}
			else {
				$json_api->error("Invalid email address.");
			}
		}

		if (is_wp_error($user)) {
			$json_api->error("Invalid username/email and/or password.", 'error', '401');
			remove_action('wp_login_failed', $json_api->query->username);
		}

		$expiration = time() + apply_filters('auth_cookie_expiration', $seconds, $user->ID, true);
		$cookie = wp_generate_auth_cookie($user->ID, $expiration, 'logged_in');
		preg_match('|src="(.+?)"|', get_avatar($user->ID, 512) , $avatar);

		// Get all user meta data for $user_id

		$meta = get_user_meta($user->ID);

		// Filter out empty meta data

		$data = array_filter(array_map(
		function ($a)
		{
			return $a[0];
		}

		, $meta));
		$warehouse_country = trim(get_user_meta($user->ID, "_warehouse_country", true));
		if (!empty($warehouse_country) || is_super_admin($user->ID)) {
			$broadcast = true;
		}
		else {
			$broadcast = false;
		}

		$lang = trim(get_user_meta($user->ID, "lang", true));
		if ($lang) {
			$userlan = $lang;
		}
		else {
			$userlan = "en";
		}

		// get meta

		return array(
			"cookie" => $cookie,
			"lang" => $userlan,
			"meta" => $data,
			"cookie_name" => LOGGED_IN_COOKIE,
			"user" => array(
				"id" => $user->ID,
				"username" => $user->user_login,
				"nicename" => $user->user_nicename,
				"email" => $user->user_email,
				"url" => $user->user_url,
				"registered" => $user->user_registered,
				"displayname" => $user->display_name,
				"firstname" => $user->user_firstname,
				"lastname" => $user->last_name,
				"nickname" => $user->nickname,
				"description" => $user->user_description,
				"capabilities" => $user->wp_capabilities,
				"avatar" => $avatar[1],
				"broadcast" => $broadcast,
				"password" => $json_api->query->password,
			) ,
		);
	}

	public

	function test()
	{
		global $json_api;
		$user_id = $json_api->query->id;
		$user = get_user_meta($user_id);
		$warehouse_country = get_user_meta($user_id, "_warehouse_country", true);
		if (!empty($warehouse_country) || is_super_admin($user_id)) {
			$broadcast = true;
		}
		else {
			$broadcast = false;
		}
	}

	public

	function get_currentuserinfo()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` Auth API method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid authentication cookie. Use the `generate_auth_cookie` method.");
		}

		$user = get_userdata($user_id);
		preg_match('|src="(.+?)"|', get_avatar($user->ID, 32) , $avatar);
		return array(
			"user" => array(
				"id" => $user->ID,
				"username" => $user->user_login,
				"nicename" => $user->user_nicename,
				"email" => $user->user_email,
				"url" => $user->user_url,
				"registered" => $user->user_registered,
				"displayname" => $user->display_name,
				"firstname" => $user->user_firstname,
				"lastname" => $user->last_name,
				"nickname" => $user->nickname,
				"description" => $user->user_description,
				"capabilities" => $user->wp_capabilities,
				"avatar" => $avatar[1],
			) ,
		);
	}

	public

	function get_user_meta()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$meta_key = sanitize_text_field($json_api->query->meta_key);
		if ($meta_key) {
			$data[$meta_key] = get_user_meta($user_id, $meta_key);
		}
		else {

			// Get all user meta data for $user_id

			$meta = get_user_meta($user_id);

			// Filter out empty meta data

			$data = array_filter(array_map(
			function ($a)
			{
				return $a[0];
			}

			, $meta));
		}

		return $data;
	}

	public

	function update_user_meta()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		if (!$json_api->query->meta_key) {
			$json_api->error("You must include a 'meta_key' var in your request.");
		}
		else {
			$meta_key = $json_api->query->meta_key;
		}

		if (!$json_api->query->meta_value) {
			$json_api->error("You must include a 'meta_value' var in your request. You may provide multiple values separated by comma for 'meta_value' var.");
		}
		else {
			$meta_value = sanitize_text_field($json_api->query->meta_value);
		}

		if (strpos($meta_value, ',') !== false) {
			$meta_values = explode(",", $meta_value);
			$meta_values = array_map('trim', $meta_values);
			$data['updated'] = update_user_meta($user_id, $meta_key, $meta_values);
		}
		else {
			$data['updated'] = update_user_meta($user_id, $meta_key, $meta_value);
		}

		return $data;
	}

	public

	function delete_user_meta()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		if (!$json_api->query->meta_key) {
			$json_api->error("You must include a 'meta_key' var in your request.");
		}
		else {
			$meta_key = $json_api->query->meta_key;
		}

		if (!$json_api->query->meta_value) {
			$json_api->error("You must include a 'meta_value' var in your request.");
		}
		else {
			$meta_value = sanitize_text_field($json_api->query->meta_value);
		}

		$data['deleted'] = delete_user_meta($user_id, $meta_key, $meta_value);
		return $data;
	}

	public

	function update_user_meta_vars()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		if (sizeof($_REQUEST) <= 1) {
			$json_api->error("You must include one or more vars in your request to add or update as user_meta. e.g. 'name', 'website', 'skills'. You must provide multiple meta_key vars in this format: &name=Ali&website=parorrey.com&skills=php,css,js,web design. If any field has the possibility to hold more than one value for any multi-select fields or check boxes, you must provide ending comma even when it has only one value so that it could be added in correct array format to distinguish it from simple string var. e.g. &skills=php,");
		}

		foreach($_REQUEST as $field => $value) {
			if ($field == 'cookie') {
				continue;
			}

			$field_label = str_replace('_', ' ', $field);
			if (strpos($value, ',') !== false) {
				$values = explode(",", $value);
				$values = array_map('trim', $values);
			}
			else {
				$values = trim($value);
			}

			$result[$field_label]['updated'] = update_user_meta($user_id, $field, $values);
		}

		return $result;
	}

	public

	function xprofile()
	{
		global $json_api;
		if (function_exists('bp_is_active')) {
			if (!$json_api->query->user_id) {
				$json_api->error("You must include a 'user_id' var in your request.");
			}
			else {
				$user_id = $json_api->query->user_id;
			}

			if (!$json_api->query->field) {
				$json_api->error("You must include a 'field' var in your request. Use 'field=default' for all default fields.");
			}
			elseif ($json_api->query->field == 'default') {
				$field_label = 'First Name, Last Name, Bio'; /*you should add your own field labels here for quick viewing*/
			}
			else {
				$field_label = sanitize_text_field($json_api->query->field);
			}

			$fields = explode(",", $field_label);
			if (is_array($fields)) {
				foreach($fields as $k) {
					$fields_data[$k] = xprofile_get_field_data($k, $user_id);
				}

				return $fields_data;
			}
		}
		else {
			$json_api->error("You must install and activate BuddyPress plugin to use this method.");
		}
	}

	public

	function xprofile_update()
	{
		global $json_api;
		if (function_exists('bp_is_active')) {
			if (!$json_api->query->cookie) {
				$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
			}

			$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
			if (!$user_id) {
				$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
			}

			foreach($_REQUEST as $field => $value) {
				if ($field == 'cookie') {
					continue;
				}

				$field_label = str_replace('_', ' ', $field);
				if (strpos($value, ',') !== false) {
					$values = explode(",", $value);
					$values = array_map('trim', $values);
				}
				else {
					$values = trim($value);
				}

				$result[$field_label]['updated'] = xprofile_set_field_data($field_label, $user_id, $values, $is_required = true);
			}

			return $result;
		}
		else {
			$json_api->error("You must install and activate BuddyPress plugin to use this method.");
		}
	}

	public

	function fb_connect()
	{
		global $json_api;
		if ($json_api->query->fields) {
			$fields = $json_api->query->fields;
		}
		else {
			$fields = 'id,name,first_name,last_name,email';
		}

		if ($json_api->query->ssl) {
			$enable_ssl = $json_api->query->ssl;
		}
		else {
			$enable_ssl = true;
		}

		if (!$json_api->query->access_token) {
			$json_api->error("You must include a 'access_token' variable. Get the valid access_token for this app from Facebook API.");
		}
		else {
			$url = 'https://graph.facebook.com/me/?fields=' . $fields . '&access_token=' . $json_api->query->access_token;

			//  Initiate curl

			$ch = curl_init();

			// Enable SSL verification

			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $enable_ssl);

			// Will return the response, if false it print the response

			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

			// Set the url

			curl_setopt($ch, CURLOPT_URL, $url);

			// Execute

			$result = curl_exec($ch);

			// Closing

			curl_close($ch);
			$result = json_decode($result, true);
			if (isset($result["email"])) {
				$user_email = $result["email"];
				$email_exists = email_exists($user_email);
				if ($email_exists) {
					$user = get_user_by('email', $user_email);
					$user_id = $user->ID;
					$user_name = $user->user_login;
				}

				if (!$user_id && $email_exists == false) {
					$user_name = strtolower($result['first_name'] . '.' . $result['last_name']);
					while (username_exists($user_name)) {
						$i++;
						$user_name = strtolower($result['first_name'] . '.' . $result['last_name']) . '.' . $i;
					}

					$random_password = wp_generate_password($length = 12, $include_standard_special_chars = false);
					$userdata = array(
						'user_login' => $user_name,
						'user_email' => $user_email,
						'user_pass' => $random_password,
						'display_name' => $result["name"],
						'first_name' => $result['first_name'],
						'last_name' => $result['last_name'],
					);
					$user_id = wp_insert_user($userdata);
					if ($user_id) {
						$user_account = 'user registered.';
					}
				}
				else {
					if ($user_id) {
						$user_account = 'user logged in.';
					}
				}

				$expiration = time() + apply_filters('auth_cookie_expiration', 1209600, $user_id, true);
				$cookie = wp_generate_auth_cookie($user_id, $expiration, 'logged_in');
				$response['msg'] = $user_account;
				$response['wp_user_id'] = $user_id;
				$response['cookie'] = $cookie;
				$response['user_login'] = $user_name;
			}
			else {
				$response['msg'] = "Your 'access_token' did not return email of the user. Without 'email' user can't be logged in or registered. Get user email extended permission while joining the Facebook app.";
			}
		}

		return $response;
	}

	public

	function post_comment()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		if (!$json_api->query->post_id) {
			$json_api->error("No post specified. Include 'post_id' var in your request.");
		}
		elseif (!$json_api->query->content) {
			$json_api->error("Please include 'content' var in your request.");
		}

		if (!$json_api->query->comment_status) {
			$json_api->error("Please include 'comment_status' var in your request. Possible values are '1' (approved) or '0' (not-approved)");
		}
		else {
			$comment_approved = $json_api->query->comment_status;
		}

		$user_info = get_userdata($user_id);
		$time = current_time('mysql');
		$agent = $_SERVER['HTTP_USER_AGENT'];
		$ip = $_SERVER['REMOTE_ADDR'];
		$data = array(
			'comment_post_ID' => $json_api->query->post_id,
			'comment_author' => $user_info->user_login,
			'comment_author_email' => $user_info->user_email,
			'comment_author_url' => $user_info->user_url,
			'comment_content' => $json_api->query->content,
			'comment_type' => '',
			'comment_parent' => 0,
			'user_id' => $user_info->ID,
			'comment_author_IP' => $ip,
			'comment_agent' => $agent,
			'comment_date' => $time,
			'comment_approved' => $comment_approved,
		);

		// print_r($data);

		$comment_id = wp_insert_comment($data);
		return array(
			"comment_id" => $comment_id,
		);
	}

	public

	function test_one()
	{
		$args = array(
			'post_type' => 'wp_cs_channel',
			'tax_query' => array(
				array(
					'taxonomy' => 'wp_cs_channel_categories',
					'field' => 'term_id',
					'terms' => 195
				)
			)
		);
		$query = new WP_Query($args);
		$posts = $query->posts;
		foreach($posts as $post) {
			var_dump($post);
		}
	}

	public

	function post_follow()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		if (!$json_api->query->channelID) {
			$json_api->error("No post specified. Include '' var in your request.");
		}

		$user_info = get_userdata($user_id);
		$time = current_time('mysql');
		$userID = $user_info->ID;
		$channelID = $json_api->query->channelID;
		global $wpdb;
		$table_name = $wpdb->prefix . "cs_channel_following";
		$datum = $wpdb->get_results("SELECT * FROM `".$table_name."`  WHERE user_ID= '" . $userID . "' AND channel_ID= '" . $channelID . "' ");
		if ($wpdb->num_rows < 1) {
			$this->post_channel_activity();
			$notification = $this->add_notification("follow", $channelID);
			$wpdb->insert($table_name, array(
				'user_ID' => $userID,
				'channel_ID' => $channelID,
				'channel_following_Datetime' => $time
			));
			$wpdb->get_results("SELECT COUNT(*) FROM `".$table_name."` WHERE channel_ID= '" . $channelID . "'");
			$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE channel_ID= " . $channelID);
			return array(
				"comment_id" => $wpdb->insert_id,
				"btntext" => "Following",
				"subscriber" => $total
			);
		}
		else {
			$wpdb->delete($table_name, array(
				'user_ID' => $userID,
				'channel_ID' => $channelID
			));
			$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE channel_ID= " . $channelID);
			return array(
				"comment_id" => "",
				"btntext" => "Follow",
				"subscriber" => $total
			);
		}
	}

	public

	function demo()
	{
		$warehouse_country = trim(get_user_meta(141, "_warehouse_country", true));
		var_dump($warehouse_country);
		if (!empty($warehouse_country) || is_super_admin(141)) {
			$broadcast = true;
		}
		else {
			$broadcast = false;
		}
	}

	public

	function get_refferal()
	{
		global $json_api;
		global $wpdb;
		$page = $json_api->query->page;
		$perpage = $json_api->query->per_page;
		$min = ($page - 1) * $perpage;
		$limit = 'Limit ' . $min . ',' . $perpage;
		$table_name = $wpdb->prefix . "cas_affiliates";
		$status = 1;
		$datum = $wpdb->get_results("SELECT * FROM " . $table_name . " WHERE  status= $status. $limit");
		foreach($datum as $key => $value) {
			$user_info = get_userdata($value->uid);
			$authorname = $user_info->display_name;
			$user[$min]['id'] = $min;
			$user[$min]['user_id'] = $value->uid;
			$user[$min]['affid'] = $value->id;
			$user[$min]['name'] = $authorname;
			$country = get_user_meta($value->uid, "country", true);
			$user[$min]["country"] = $country;
			$min++;
		}

		return array(
			"userlist" => $user
		);
	}

	public

	function get_list()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$user = get_user_meta($user_id);
		$warehouse_country = get_user_meta($user_id, "_warehouse_country", true);
		if (is_super_admin()) {
			$warehouse_country = $json_api->query->country;
		}
		else {
			$warehouse_country = get_user_meta($user_id, "_warehouse_country", true);
		}

		$array = ["CN" => "China", "SG" => "Singapore", "HK" => "Hong Kong", "MY" => "Malaysia", "TH" => "Thailand", "BD" => "Bangladesh", ];
		$country = $array[$warehouse_country];
		if (!empty($warehouse_country) || is_super_admin($user_id)) {
			$wp_user_query = new WP_User_Query(array(
				'meta_key' => 'country',
				'meta_value' => $country
			));
			$authors = $wp_user_query->get_results();
			if (!empty($authors)) {
				$receiver = array();
				$receiver[] = 100;
				foreach($authors as $author) {
					if ($user_id == $author->ID) {
						continue;
					}

					$receiver[] = $author->ID;
				}
			}

			return array(
				"receiver" => array_unique($receiver)
			);
		}
		else {
			return false;
		}
	}

	public

	function get_score()
	{
		global $json_api;
		global $wpdb;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$table_name = $wpdb->prefix . "cs_games";
		$userbest = $wpdb->get_results("SELECT game_id,Max(score) as score FROM " . $table_name . " WHERE  user_id= $user_id GROUP by game_id");
		$alltimebest = $wpdb->get_results("SELECT game_id,Max(score) as score FROM " . $table_name . "  GROUP by game_id");
		foreach($userbest as $key => $value) {
			$cuserbest[$value->game_id] = $value->score;
		}

		$userbest = json_decode(json_encode($cuserbest) , True);
		foreach($alltimebest as $key => $value) {
			$alluserbest[$value->game_id] = $value->score;
		}

		$alluserbest = json_decode(json_encode($alluserbest) , True);
		$per_page = 999;
		$page = get_query_var('page') ? get_query_var('page') : 1;
		$postnumber = ($per_page * $page) - 2;
		$wp_query = new WP_Query(array(
			'post_type' => 'wp_cs_games',
			'posts_per_page' => $per_page,
			'paged' => $page,
			'orderby' => 'post_date',
			'order' => 'DESC'
		));
		$totalpage = ceil($wp_query->found_posts / $per_page);
		if ($wp_query->have_posts()):
			while ($wp_query->have_posts()):
				$wp_query->the_post();
				$id = get_the_ID();
				$time = meks_time_ago();
				$activity[$postnumber]['postid'] = $id;
				$activity[$postnumber]['title'] = get_the_title();
				$activity[$postnumber]['content'] = get_the_content();
				$image = wp_get_attachment_url(get_post_thumbnail_id($id));
				$activity[$postnumber]["id"] = $postnumber;
				$activity[$postnumber]["img"] = $image;
				$activity[$postnumber]["date"] = $pfx_date;
				$activity[$postnumber]["time"] = $time;
				$activity[$postnumber]["game_url"] = get_field("game_url", $id);
				$gamecode = get_field("game_code", $id);
				$activity[$postnumber]["gamecode"] = $gamecode;
				$activity[$postnumber]["alluserbest"] = $alluserbest[$gamecode];
				$activity[$postnumber]["cuserbest"] = $userbest[$gamecode];
				$postnumber++;
			endwhile;
			wp_reset_postdata();
		endif;
		return array(
			"activity" => $activity
		);
	}

	public

	function affiliatenetwork()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$affid = affwp_get_affiliate_id($user_id);
		$statistics = new AffiliateWP_MLA_Statistics($affid);
		$levels = $statistics->get_best_display_rates();
		$unpaidreferrals = affwp_count_referrals($affid, 'unpaid');
		$paidreferrals = affwp_count_referrals($affid, 'paid');
		$unpaidearning = affwp_get_affiliate_unpaid_earnings($affid, true);
		$paidearning = affwp_get_affiliate_earnings($affid, true);
		$network_stats = $statistics->get_network_level_stats();

		// $chart = $statistics->get_entire_network();

		return array(
			"levels" => $levels,
			"unpaidreferrals" => $unpaidreferrals,
			"paidreferrals" => $paidreferrals,
			"unpaidearning" => $unpaidearning,
			"paidearning" => $paidearning,
			"network_stats" => $network_stats
		);
	}

	public

	function url()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$affid = affwp_get_affiliate_id($user_id);
		$url = esc_url(affwp_get_affiliate_referral_url($affid));
		$username = affwp_get_affiliate_username($affid);
		$slug = new AffiliateWP_Custom_Affiliates_Slugs_Base();
		$display_slug = affiliate_wp()->settings->get('custom_affiliate_slugs_affiliate_show_slug');
		$custom_slug = $slug->get_slug($affid);
		return array(
			"aff_id" => $affid,
			"url" => $url,
			"name" => $username,
			"slug" => $custom_slug
		);
	}

	public

	function payout()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		self::$affiliate_id = affwp_get_affiliate_id($user_id);
		$per_page = 30;
		$page = get_query_var('paged') ? get_query_var('paged') : 1;
		$count = affiliate_wp()->affiliates->payouts->count(array(
			'affiliate_id' => self::$affiliate_id
		));
		$pages = absint(ceil($count / $per_page));
		$payouts = affiliate_wp()->affiliates->payouts->get_payouts(array(
			'number' => $per_page,
			'offset' => $per_page * ($page - 1) ,
			'affiliate_id' => self::$affiliate_id,
		));
		return $payouts;
	}

	public

	function creative()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$per_page = 30;
		$page = get_query_var('paged') ? get_query_var('paged') : 1;
		$pages = absint(ceil(affiliate_wp()->creatives->count(array(
			'status' => 'active'
		)) / $per_page));
		$args = array(
			'number' => $per_page,
			'offset' => $per_page * ($page - 1)
		);
		$creatives = affiliate_wp()->creative->affiliate_creatives($args);
		return array(
			"data" => $creatives
		);
	}

	public

	function settings()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		self::$affiliate_id = affwp_get_affiliate_id($user_id);
		$user_email = affwp_get_affiliate_email(self::$affiliate_id);
		$payment_email = affwp_get_affiliate_payment_email(self::$affiliate_id, $user_email); // Fallback to user_email
		$slug = new AffiliateWP_Custom_Affiliates_Slugs_Base();
		$display_slug = affiliate_wp()->settings->get('custom_affiliate_slugs_affiliate_show_slug');
		$custom_slug = $slug->get_slug(self::$affiliate_id);
		return array(
			"aff_id" => self::$affiliate_id,
			"user_email" => $user_email,
			"payment_email" => $payment_email,
			"custom_slug" => $custom_slug
		);
	}

	public

	function affiliate()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->output();
		return $output;
	}

	public

	function edit_account()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_edit_account();
		return $output;
	}

	public

	function payments_settings()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);

		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
	    $output = $obj->run_payment_settings();
	    return $output;
	}

	public

	function affiliate_withdraw()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_withdraw();
		return $output;
	}

	public

	function add_withdraw()
	{
		global $json_api;
        global $indeed_db;
        global $wpdb; 
        if (!$json_api->query->cookie) {
            $json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
        }

        $user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
        if (!$user_id) {
            $json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
        }

        require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';
        self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
        $aff_id = self::$affiliate_id;  
        $obj = new Affiliate_Account_Page_Api($user_id,self::$affiliate_id);
        
        // Withdraw Amount
		$currency 			= 'USD';
		$tbl 				= $wpdb->prefix. 'cas_withdraw';
		$ptbl 				= $wpdb->prefix. 'cas_payments';
		$withdraw_amount  	= $_REQUEST['withdraw_amount'];
		if($withdraw_amount){

    		$rqest_date 	  	= date('Y-m-d H:i:s', time());
    		$create_date 	  	= date('Y-m-d H:i:s', time());
    		$q = "INSERT INTO $tbl (refferal_wp_uid, affiliate_id, 
    								request_date, accept_date, 
    								withdraw_amount, withdraw_status) 
    						VALUES ( $user_id, $aff_id, 
    								'$rqest_date', '', 
    								$withdraw_amount, 'Pending')";
    		$check_withdraw = $wpdb->query($q);
    		$this_insert_id = $wpdb->insert_id;
    
    		$sql = "INSERT INTO $ptbl (payment_type, transaction_id, 
    								affiliate_id, amount, 
    								currency, payment_details, 
    								create_date, update_date,
    								status) 
    						VALUES ( 'withdraw', $this_insert_id,
    								 $aff_id, $withdraw_amount,
    								'$currency', 'Withdraw by user', 
    								'$create_date', '$create_date','1')";
    		$check_payment = $wpdb->query($sql);  
			
		}
        
        $output = $obj->run_withdraw();
        return $output;
	}

	public

	function affiliate_wallet()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->print_wallet();
		return $output;
	}

	public

	function addwallet()
	{
		$amount = $_REQUEST['amount'];
		$data = array();
		$data['amount'] = $amount;
		return $data;
	}

	public

	function affiliate_link()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_affiliate_link();
		return $output;
	}

	public

	function affiliate_link_save()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);

		$arr = array();
		if (!empty(self::$affiliate_id) && !empty($_REQUEST['url'])) {
			$param = 'ref';
			$value = self::$affiliate_id;
			$campaign_variable = '';
			$campaign_value = '';
			global $indeed_db;
			$settings = $indeed_db->return_settings_from_wp_option('general-settings');
			if (!empty($settings['cas_referral_variable'])) {
				$param = $settings['cas_referral_variable'];
			}

			$uid = $indeed_db->get_uid_by_affiliate_id(self::$affiliate_id);
			if (!empty($_REQUEST['slug'])) {
				$slug = $indeed_db->get_custom_slug_for_uid($uid);
				if ($slug) {
					$value = $slug;
				}
			}
			else
			if ($uid && $settings['cas_default_ref_format'] == 'username') {
				$user_info = get_userdata($uid);
				if (!empty($user_info->user_login)) {

					// /$value = $user_info->user_login;

					$value = urlencode($user_info->user_login);
				}
			}

			$url = $_REQUEST['url'];
			if (!empty($_REQUEST['campaign'])) {
				$campaign_variable = get_option('cas_campaign_variable');
				$campaign_value = $_REQUEST['campaign'];
			}

			$arr['url'] = cas_create_affiliate_link($url, $param, $value, $campaign_variable, $campaign_value, $_REQUEST['friendly_links']);
			$arr['social'] = '';
			$arr['qr'] = '';

			// / SOCIAL

			if (cas_is_social_share_intalled_and_active() && get_option('cas_social_share_enable')) {
				$shortcode = get_option('cas_social_share_shortcode');
				if ($shortcode) {
					$shortcode = stripslashes($shortcode);
					$shortcode = str_replace(']', '', $shortcode);
					$shortcode.= " is_affiliates=1"; ///just for safe
					$shortcode.= " custom_description='" . get_option('cas_social_share_message') . "'";
					$shortcode.= " cas_no_fb_js=1 ";
					$shortcode.= " custom_url='" . $arr['url'] . "']";
					$arr['social'] = do_shortcode($shortcode);
				}
			}

			// QR CODE

			if ($indeed_db->is_magic_feat_enable('qr_code')) {
				$img = cas_generate_qr_code($arr['url'], self::$affiliate_id . '_custom_url');
				$arr['qr_code'] = '<div class="cas-qr-code-wrapper">
								<img src="' . $img . '" />
								<a href="' . $img . '" download="' . basename($img) . '" class="cas-qr-code-download">' . __('Download', 'cas') . '</a>
				</div>';
			}

		}

		return json_encode($arr);
	}

	public

	function campaigns()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_campaigns();
		return $output;
	}

	public

	function banners()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_banners();
		return $output;
	}

	public

	function payments()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_payments();
		return $output;
	}

	public

	function referrals()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_referrals();
		return $output;

	}

	public

	function reports()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_reports();
		return $output;
	}

	public

	function visits()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_visits();
		return $output;
	}

	public

	function campaign_reports()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_campaign_reports();
		return $output;
	}

	public

	function referrals_history()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->run_referrals_history();
		return $output;
	}

	public

	function mlm()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->print_mlm_page();
		return $output;
	}

	public

	function generatelink()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		// require UAP_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);

		// return  $affiliate_id;

		if (!empty($affiliate_id) && !empty($_REQUEST['url'])) {
			$param = 'ref';
			$value = self::$affiliate_id;
			$campaign_variable = '';
			$campaign_value = '';
			$settings = $indeed_db->return_settings_from_wp_option('general-settings');
			if (!empty($settings['uap_referral_variable'])) {
				$param = $settings['uap_referral_variable'];
			}

			$uid = $indeed_db->get_uid_by_affiliate_id(self::$affiliate_id);
			if (!empty($_REQUEST['slug'])) {
				$slug = $indeed_db->get_custom_slug_for_uid($uid);
				if ($slug) {
					$value = $slug;
				}
			}
			else
			if ($uid && $settings['uap_default_ref_format'] == 'username') {
				$user_info = get_userdata($uid);
				if (!empty($user_info->user_login)) {

					// /$value = $user_info->user_login;

					$value = urlencode($user_info->user_login);
				}
			}

			$url = $_REQUEST['url'];
			if (!empty($_REQUEST['campaign'])) {
				$campaign_variable = get_option('uap_campaign_variable');
				$campaign_value = $_REQUEST['campaign'];
			}

			$arr['url'] = uap_create_affiliate_link($url, $param, $value, $campaign_variable, $campaign_value, $_REQUEST['friendly_links']);
			$arr['social'] = '';
			$arr['qr'] = '';

			// / SOCIAL

			if (uap_is_social_share_intalled_and_active() && get_option('uap_social_share_enable')) {
				$shortcode = get_option('uap_social_share_shortcode');
				if ($shortcode) {
					$shortcode = stripslashes($shortcode);
					$shortcode = str_replace(']', '', $shortcode);
					$shortcode.= " is_affiliates=1"; ///just for safe
					$shortcode.= " custom_description='" . get_option('uap_social_share_message') . "'";
					$shortcode.= " custom_url='" . $arr['url'] . "']";
					$arr['social'] = do_shortcode($shortcode);
				}
			}

			// / QR CODE

			if ($indeed_db->is_magic_feat_enable('qr_code')) {
				$img = uap_generate_qr_code($arr['url'], self::$affiliate_id . '_custom_url');
				$arr['qr_code'] = '<div class="uap-qr-code-wrapper">
                                <img src="' . $img . '" />
                                <a href="' . $img . '" download="' . basename($img) . '" class="uap-qr-code-download">' . __('Download', 'uap') . '</a>
                </div>';
			}

			return $arr;
		}
	}

	public

	function custom_affiliate_slug()
	{
		global $json_api;
		global $indeed_db;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		require CAS_PATH . 'public/Affiliate_Account_Page.class.api.php';

		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		$obj = new Affiliate_Account_Page_Api($user_id, self::$affiliate_id);
		$output = $obj->print_custom_affiliate_slug();
		return $output;
	}

	// place order in woocommerce

	public

	function get_subscription()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

        $subscriptions = get_posts( array(
                'numberposts' => -1,
                'post_type'   => 'shop_subscription', // Subscription post type
                //'post_status' => 'wc-active', // Active subscription
                'order' => 'DESC',
                'meta_key'    => '_customer_user',
                'meta_value'  => $user_id,
            ) );

            

 		//$subscriptions = wcs_get_users_subscriptions($user_id);
       // $subscriptions = WC_Subscriptions_Manager::get_users_subscriptions($user_id);

		foreach($subscriptions as $subscription_id => $subscription) {
			$subcription[$subscription_id]['id'] = $subscription_id;
			$subcription[$subscription_id]['status'] = wcs_get_subscription_status_name($subscription->get_status());
			$subcription[$subscription_id]['total'] = wp_kses_post($subscription->get_formatted_order_total());
			$subcription[$subscription_id]['next'] = $subscription->get_date_to_display('next_payment');
		}

		$sub = array(
			array(
				'id'=> 5,
				'status' => 'Yes',
				'total' => 50,
				'next' => 'gold'
			),
			array(
				'id'=> 1,
				'status' => 'No',
				'total' => 12,
				'next' => 'Silver'
			)
		);

		return array(
			"data" => $sub
		);

	}

	public

	function get_order()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$customer_orders = get_posts(array(
			'numberposts' => -1,
			'meta_key' => '_customer_user',
			'meta_value' => $user_id,
			'post_type' => wc_get_order_types() ,
			'post_status' => array_keys( wc_get_order_statuses() ) ,
		));
		foreach($customer_orders as $customer_order) {
			$order = wc_get_order($customer_order);
			$item_count = $order->get_item_count();
			$id = $order->get_order_number();
			$cusorder[$id]['id'] = $id;
			$cusorder[$id]['date'] = date_i18n(get_option('date_format') , strtotime($order->order_date));
			$cusorder[$id]['status'] = wc_get_order_status_name($order->get_status());
			$cusorder[$id]['total'] = sprintf(_n('%s for %s item', '%s for %s items', $item_count, 'woocommerce') , $order->get_formatted_order_total() , $item_count);
		}

		return array(
			"data" => $cusorder
		);
	}

	public

	function get_profile()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$customer_id = $user_id;
		$name = "billing";
		$billing = array(
			'first_name' => get_user_meta($customer_id, $name . '_first_name', true) ,
			'last_name' => get_user_meta($customer_id, $name . '_last_name', true) ,
			'company' => get_user_meta($customer_id, $name . '_company', true) ,
			'address_1' => get_user_meta($customer_id, $name . '_address_1', true) ,
			'address_2' => get_user_meta($customer_id, $name . '_address_2', true) ,
			'city' => get_user_meta($customer_id, $name . '_city', true) ,
			'state' => get_user_meta($customer_id, $name . '_state', true) ,
			'postcode' => get_user_meta($customer_id, $name . '_postcode', true) ,
			'country' => get_user_meta($customer_id, $name . '_country', true) ,
		);
		$name = "shipping";
		$shipping = array(
			'first_name' => get_user_meta($customer_id, $name . '_first_name', true) ,
			'last_name' => get_user_meta($customer_id, $name . '_last_name', true) ,
			'company' => get_user_meta($customer_id, $name . '_company', true) ,
			'address_1' => get_user_meta($customer_id, $name . '_address_1', true) ,
			'address_2' => get_user_meta($customer_id, $name . '_address_2', true) ,
			'city' => get_user_meta($customer_id, $name . '_city', true) ,
			'state' => get_user_meta($customer_id, $name . '_state', true) ,
			'postcode' => get_user_meta($customer_id, $name . '_postcode', true) ,
			'country' => get_user_meta($customer_id, $name . '_country', true) ,
		);
		return array(
			"shipping" => $shipping,
			"billing" => $billing
		);
	}

	public

	function get_adrs()
	{
		global $json_api;
		global $woocommerce;		
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$customer_id = $user_id;
		$name = "billing";
		$billing = array(
			'first_name' => get_user_meta($customer_id, $name . '_first_name', true) ,
			'last_name' => get_user_meta($customer_id, $name . '_last_name', true) ,
			'company' => get_user_meta($customer_id, $name . '_company', true) ,
			'address_1' => get_user_meta($customer_id, $name . '_address_1', true) ,
			'address_2' => get_user_meta($customer_id, $name . '_address_2', true) ,
			'city' => get_user_meta($customer_id, $name . '_city', true) ,
			'state' => get_user_meta($customer_id, $name . '_state', true) ,
			'postcode' => get_user_meta($customer_id, $name . '_postcode', true) ,
			'country' => get_user_meta($customer_id, $name . '_country', true) ,
			'paypal' => 'paypal@gmail.com' ,
		);
		$name = "shipping";
		$shipping = array(
			'first_name' => get_user_meta($customer_id, $name . '_first_name', true) ,
			'last_name' => get_user_meta($customer_id, $name . '_last_name', true) ,
			'company' => get_user_meta($customer_id, $name . '_company', true) ,
			'address_1' => get_user_meta($customer_id, $name . '_address_1', true) ,
			'address_2' => get_user_meta($customer_id, $name . '_address_2', true) ,
			'city' => get_user_meta($customer_id, $name . '_city', true) ,
			'state' => get_user_meta($customer_id, $name . '_state', true) ,
			'postcode' => get_user_meta($customer_id, $name . '_postcode', true) ,
			'country' => get_user_meta($customer_id, $name . '_country', true) ,
		);
		
		$current_balance = woo_wallet()->wallet->get_wallet_balance($user_id);
        $gateways = WC()->payment_gateways->payment_gateways();
        
        //print_r($gateways);
        
        $enabled_gateways = [];
        if( $gateways ) {
	        foreach( $gateways as $gateway ) {
	         	//if( $gateway->id == 'paypal' || $gateway->id == 'stripe' || $gateway->id == 'wallet'){
	         	    // if($gateway->id == 'wallet'){
	         	    //     $title = $gateway->get_title(). ' | Current Balance: $'.$current_balance;
	         	    // } else {
	         	    //     $title = $gateway->get_title();
	         	    // }
	            	$enabled_gateways[$gateway->id] = $title;
	         	//}
	        }
        }

        $countries_obj         = new WC_Countries();   
        $countries             = $countries_obj->__get('countries');
        $country_arr           = array();
        foreach( $countries as $key => $value ){
        	array_push($country_arr, $value);
        }

		return array(
			"shipping"           => $shipping,
			"billing"            => $billing,
			'methods'            => $enabled_gateways,
			'wallet_balance'     => $current_balance,
			'country_arr'        => $country_arr,
			'country_key_value'  => $countries,
		);
	}
	
	
	public function get_states(){
	    
        global $json_api;
		$data = json_decode(stripslashes($json_api->query->data));
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}
		
		
        global $woocommerce;
        $states = array();
        $countries_obj   = new WC_Countries();
        $countries   = $countries_obj->__get('countries');
        $default_county_states = $countries_obj->get_states( $data->country_id );
        $data = array(
            'data' => json_encode($default_county_states),
            'status' => 0
        );
		return json_encode($data);
	}
	
	
    public function shippingmethod(){
        
        global $json_api;
		$data = json_decode(stripslashes($json_api->query->data));
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}
		
		global $woocommerce; 
    	$package= array();
    	$package['destination']['country'] = $data->country_id;
    	$package['destination']['state'] = $data->state;
    	$package['destination']['postcode'] = $data->zipcode;
        $WC_Shipping = new WC_Shipping();
        $var = $WC_Shipping->calculate_shipping_for_package( $package );

	   $arr = array();
	   foreach( $var['rates'] as $rates ){
	        $sum = '';
	        
	        $option_label = "woocommerce_".$rates->method_id."_".$rates->instance_id."_settings";
	        $fetch_option =  get_option($option_label);
	        
	        
	        if( !empty($fetch_option) ){
	           $sum = str_replace("[qty]","1", $fetch_option['cost']);
        	   $sum = preg_replace( '/\s+/', '', $sum );
        	   $sum = rtrim( ltrim( $sum, "\t\n\r\0\x0B+*/" ), "\t\n\r\0\x0B+-*/" );
		       $sum = $sum ? WC_Eval_Math::evaluate( $sum ) : 0;	           
	        }
	        
	        if($sum == ''){
	            $sum = 0;
	        }
	        
	        $label_cost = $rates->label ." $".$sum;
	        $subarr = array(
	                 'id'            => $rates->id,
	                'instance_id'    => $rates->instance_id,
	                'method_id'      => $rates->method_id,
	                'label'          => $rates->label,
	                'flabel'         => $label_cost,
	                'cost'           => $sum
	            );
	        array_push($arr,  $subarr);
	        
	   }
	    
	   return  $arr;
    }
    
    
    public 
    
    function easyshipping(){
        
		global $json_api;
		$data = json_decode(stripslashes($json_api->query->data));
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		} 
		
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.easyship.com/rate/v1/rates");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));        
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
          "Content-Type: application/json",
          "Authorization: Bearer prod_qcQ9J9VlM1zCYsh26EHrKwdiqA++Jq8QO7cWr5hn6eo="
        ));

        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
		
    }
    
	public function set_affiliate_id($user_id){
		/*
		 * @param none
		 * @return none
		 */
		global $indeed_db;
		$lifetime = get_option('cas_lifetime_commissions_enable');
		if ($lifetime){
		 	/// LIFETIME
			self::$affiliate_id = $indeed_db->search_affiliate_id_for_current_user($user_id);
			if (self::$affiliate_id){
				self::$special_payment_type = 'lifetime';
			}				
		} else if (self::$special_payment_type=='reccuring'){
			/// RECCURING
			self::$affiliate_id = $indeed_db->search_affiliate_id_for_current_user($user_id);
		}
		
		if (self::$affiliate_id){
			$old_affiliate = $indeed_db->search_affiliate_id_for_current_user($user_id);
			if ($old_affiliate){
				$rewrite_referrals = get_option('cas_rewrite_referrals_enable');
				if ($rewrite_referrals){
					/// update user - affiliate relation, use new affiliate
					$indeed_db->update_affiliate_referral_user_relation_by_ids($old_affiliate, self::$affiliate_id, $user_id);
				} else {
					/// use old affiliate
					self::$affiliate_id = $old_affiliate;
				}
			} else {
				/// insert user - affiliate relation
				$indeed_db->insert_affiliate_referral_user_new_relation(self::$affiliate_id, $user_id);
			}
		}		
	}

	public function check_coupon($order_object){
		/*
		 * check if coupon has a affiliate on it
		 * @param object
		 * @return none
		 */
		 if ($order_object){
		 	 $coupons_arr = $order_object->get_used_coupons();
			 if (!empty($coupons_arr)){
			 	global $indeed_db;
			 	foreach ($coupons_arr as $coupon){
			 		$affiliate = $indeed_db->get_affiliate_for_coupon_code($coupon);
					if ($affiliate){
						self::$affiliate_id = $affiliate;
						self::$special_payment_type = 'coupon';
						self::$coupon_code = $coupon;
					}
			 	}
			 }
		 }
	}	

	//////////////// CHECKOUT REFERRAL SELECT

	public function check_for_selected_affiliate(){
		/*
		 * @param none
		 * @return none
		 */
		 global $indeed_db;
		 if (empty(self::$checkout_referrals_select_settings)){
		 	self::$checkout_referrals_select_settings = $indeed_db->return_settings_from_wp_option('checkout_select_referral');
		 }
		 if (self::$checkout_referrals_select_settings['cas_checkout_select_referral_enable']){
		 	if (!empty($_POST['cas_affiliate_username'])){
		 		self::$affiliate_id = $_POST['cas_affiliate_username'];
		 	} else if (!empty($_POST['cas_affiliate_username_text'])){
		 		$temp = $indeed_db->get_affiliate_id_by_username($_POST['cas_affiliate_username_text']);
				if ($temp){
					self::$affiliate_id = $temp;
				}
		 	}
		 }
	}

	public function valid_referral($user_id){
		/*
		 * @param none
		 * @return boolean
		 */
		global $indeed_db;
		/// CHECK FOR OWN REFERRENCE
	    self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		if (self::$affiliate_id && $user_id && $indeed_db->affiliate_get_id_by_uid($user_id) == self::$affiliate_id){
			if (!get_option('cas_allow_own_referrence_enable')){				
				return FALSE;//own referrence not allowed
			}
		}		
		if (self::$affiliate_id && $indeed_db->is_affiliate_active(self::$affiliate_id)){		
			return TRUE;
		}
		return FALSE;		
	}


	public function mlm_do_save_referral_unverified($child_affiliate_id=0, $child_referral_id=0, $count=1, $limit=0, $amount=0, $first_child_username='', $first_child_referrence=''){
		/*
		 * @param int, int, int, int, int, string, string
		 * @return none
		 */
		/// CHECK LIMIT DEPTH
		if ($limit<$count){
			return;
		}
		if ($child_affiliate_id && $child_referral_id){
			global $indeed_db;
			$parent_id = $indeed_db->mlm_get_parent($child_affiliate_id);
			$description = 'From MLM';
			if (!empty($first_child_username)){
				$description = 'From ' . $first_child_username;
			}
			$reference = '-';
			if (!empty($first_child_referrence)){
				$reference = 'mlm_' . $first_child_referrence;
			}
			
			if ($parent_id){
				$args = array(
						'refferal_wp_uid' => '-',
						'campaign' => '-',
						'affiliate_id' => $parent_id,
						'visit_id' => '-',
						'description' => $description,
						'source' => 'mlm',
						'reference' => $reference,
						'reference_details' => '-',
						'parent_referral_id' => '',//will be updated if it;s case
						'child_referral_id' => $child_referral_id,
				);
				$args['date'] = date('Y-m-d H:i:s', time());
				$args['status'] = 1;//unverified
				$args['payment'] = 0;//unpaid
				
				/// SET AMOUNT
				$args['amount'] = $indeed_db->mlm_get_amount($parent_id, $amount, $count);
				$args['currency'] = self::$currency;				
				
				/// save referral
				$inserted_referral_id = $indeed_db->save_referral($args);	
				
				//update the child referral
				$indeed_db->referral_update_child($child_referral_id, $inserted_referral_id);
				
				/// search for parent
				$count++;
				$this->mlm_do_save_referral_unverified($parent_id, $inserted_referral_id, $count, $limit, $amount, $first_child_username, $first_child_referrence);			
			}
		}
	}	


	public function save_referral_unverified($args=array()){
		/*
		 * UNVERIFIED STATUS
		 * @param array
		 * @return boolean
		 */
		global $indeed_db;
		$keys = array(	
						'refferal_wp_uid', 
						'campaign', 
						'affiliate_id', 
						'visit_id', 
						'description', 
						'source', 
						'reference', 
						'reference_details', 
						'amount', 
						'currency',
		);				

		foreach ($keys as $key){
			if (!isset($args[$key])){
				return FALSE;
			}
		}

		/// NEGATIVE REFERRALS?
		if ($args['amount']<0){
			$args['amount'] = 0;
		}

		/// EMPTY REFERRALS
		$general_settings_data = $indeed_db->return_settings_from_wp_option('general-settings');
		if (empty($general_settings_data['cas_empty_referrals_enable'])){
			///don't insert referrals with 0$
			$min = 0.01;
			if ($args['amount']<$min){
				return;
			}			
		}
		/// EMPTY REFERRALS		
		
		$args['date'] = date('Y-m-d H:i:s', time());
		$args['status'] = 1;//unverified 
		$args['payment'] = 0;//unpaid
		$args['parent_referral_id'] = '';// empty for moment, will be updated if it's case
		$args['child_referral_id'] = '';//always will be empty
		$referral_id = $indeed_db->save_referral($args);
		if ($referral_id){
			$indeed_db->update_visit_referral_id($args['visit_id'], $referral_id);	
			if (get_option('cas_mlm_enable')){
				$limit = get_option('cas_mlm_matrix_depth');
				$first_child_username = $indeed_db->get_wp_username_by_affiliate_id($args['affiliate_id']);
				
				$theAmount = $args['amount'];
				$cas_mlm_use_amount_from = get_option('cas_mlm_use_amount_from');
				if ($cas_mlm_use_amount_from && $cas_mlm_use_amount_from=='product_price' && isset($args['product_price'])){ 
					$theAmount = $args['product_price'];
				}
				
				$this->mlm_do_save_referral_unverified($args['affiliate_id'], $referral_id, 1, $limit, $theAmount, $first_child_username, $referral_id);
			}		
		}
		return TRUE;
	}


	public function create_referral($order_id=0, $user_id){
		/*
		 * @param int (order id)
		 * @return none
		 */
		global $indeed_db;
		if (empty($order_id)){
			return; // out
		}
		$order = new WC_Order($order_id);
		self::$affiliate_id = $indeed_db->affiliate_get_id_by_uid($user_id);
		if (empty(self::$affiliate_id)){
			$this->check_coupon($order);
		}
		$this->set_affiliate_id($user_id);
		$this->check_for_selected_affiliate();
		 if ($this->valid_referral($user_id)){

			$temp_data = $indeed_db->return_settings_from_wp_option('general-settings');
			$exclude_shipping = (empty($temp_data['cas_exclude_shipping'])) ? FALSE : TRUE;
			$exclude_tax = (empty($temp_data['cas_exclude_tax'])) ? FALSE : TRUE;

			/// calculate the amount object
			require_once CAS_PATH . 'public/Affiliate_Referral_Amount.class.php';
			$do_math = new Affiliate_Referral_Amount(self::$affiliate_id, $this->source_type, self::$special_payment_type, self::$coupon_code);

			if (!empty(self::$coupon_code)){
				$temp_coupon_data = $indeed_db->get_coupon_data(self::$coupon_code);
				if ($temp_coupon_data['amount_type']=='flat'){
					$run_foreach_line_once = TRUE;
				}
			}
            
			$items      = $order->get_items();
			$shipping   = $order->get_total_shipping();
			if ($shipping){
				@$shipping_per_item = $shipping / count($items);
			} else {
				$shipping_per_item = 0;
			}
			$sum = 0;
			$product_price_sum = 0;

			foreach ($items as $item){ /// foreach in lines
				$products_arr[] = $item['product_id'];

				///base price
				$product_price = round($item['line_total'], 3);

				///add shipping if it's case
				if (!empty($shipping_per_item) && !$exclude_shipping){
					$product_price += round($shipping_per_item, 3);
				}

				/// add taxes if it's case
				if (!empty($item['line_tax']) && !$exclude_tax){
					$product_price += round($item['line_tax'], 3);
				}

				$product_price_sum += $product_price;

				/// get amount
				$temp_amount = $do_math->get_result($product_price, $item['product_id']);// input price, product id
				$sum += $temp_amount;

				if (!empty($run_foreach_line_once)){
					/// user for coupon flat amount!
					break;
				}
			}
			
			if (!empty($products_arr)){
				$product_list = implode(',', $products_arr);
			} else {
				$product_list = '';
			}

			$args = array(
					'refferal_wp_uid' => $user_id,
					'campaign' => self::$campaign,
					'affiliate_id' => self::$affiliate_id,
					'visit_id' => self::$visit_id,
					'description' => '',
					'source' => $this->source_type,
					'reference' => $order_id,
					'reference_details' => $product_list,
					'amount' => $sum,
					'currency' => self::$currency,
					'product_price' => $product_price_sum,
			);
			return $this->save_referral_unverified($args);
		}
	}    
	

	public 
	function place_order()
	{
		global $json_api;
		$data = json_decode(stripslashes($json_api->query->data));
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$user_info = get_userdata($user_id);
		$time = current_time('mysql');
		$userID = $user_info->ID;
 		$email = $user_info->user_email;
		$address = array(
			'first_name' => $data->billing_address->first_name,
			'last_name' => $data->billing_address->last_name,
			'company' => '',
			'email' => $email,
			'phone' => $data->billing_address->phone,
			'address_1' => $data->billing_address->address_1,
			'address_2' => $data->billing_address->address_2,
			'city' => $data->billing_address->city,
			'state' => $data->billing_address->state,
			'postcode' => $data->billing_address->postcode,
			'country' => $data->billing_address->country,
		);

		$order = wc_create_order(array(
			'customer_id' => $user_info->ID
		));
		
    
		if( !empty($data->line_items) ){
		  $i=0;      
		  foreach( $data->line_items as $prod ){
		        $product = new WC_Product($prod->product_id);
		        $order->add_product($product, $prod->quantity);
		        if( $i == 0 ){
                $shipping = new WC_Shipping_Rate( $data->shipping_method->shipping_id, $data->shipping_method->shipping_label, $data->shipping_charge, array(), $data->shipping_method->method_id);		        
		        $order->add_shipping( $shipping );
		        }
		        $order->calculate_totals();
		        $i++;
		  }  
		}
		
		$order->set_address($address, 'billing');
		$order->set_address($address, 'shipping');
        $order->set_payment_method($data->payment_details->method_id);
		$order->update_status("processing", 'Order placed from V-Life app', TRUE);
		$order_id = $order->id;
		$this->create_referral($order_id, $user_id);

		if( $data->payment_details->method_id == 'wallet' ){
		    
     		$order = wc_get_order($order_id);
            $wallet_response = woo_wallet()->wallet->debit($user_info->ID, $order->get_total(''), __('For order payment #', 'cas') . $order->get_order_number());
            wc_reduce_stock_levels($order_id);
            if($wallet_response){
                $order->payment_complete($wallet_response);
                do_action('woo_wallet_payment_processed', $order_id, $wallet_response);
            }    		
    		return array( "status" => "ok", 'payment'=> 'wallet' );
		} else {
		    return array( "status" => "ok", 'content'=> $args );
		}
	}

	public 
	function stripepayment(){
	    
		global $json_api;
		$data = json_decode(stripslashes($json_api->query->data));
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}
		
		$card_no    = $data->stripe->card_no;
		$month      = $data->stripe->month;
		$year       = $data->stripe->year;
		$cvc        = $data->stripe->cvc;
		$amount     = $data->stripe->amount;
		$url        = $this->base_url."/api/payWithStripe";
		
        $response = wp_remote_post(
                $url,
                array(
                    'body' => array(
                        'ccExpiryMonth'          => $month,
                        'ccExpiryYear'           => $year,
                        'card_no'                => $card_no,
                        'cvcNumber'              => $cvc,
                        'amount'                 => $amount,
                    )
                )
            );
            
		return $response;
		
	}

	public

	function set_adrs()
	{
		global $json_api;
		$data = json_decode(stripslashes($json_api->query->data));
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$user_info = get_userdata($user_id);
		$time = current_time('mysql');
		$userID = $user_info->ID;
		$email = $user_info->user_email;
		$address = array(
			'first_name' => $data->billing_address->first_name,
			'last_name' => $data->billing_address->last_name,
			'company' => '',
			'email' => $email,
			'phone' => $data->billing_address->phone,
			'address_1' => $data->billing_address->address_1,
			'address_2' => $data->billing_address->address_2,
			'city' => $data->billing_address->city,
			'state' => $data->billing_address->state,
			'postcode' => $data->billing_address->postcode,
			'country' => $data->billing_address->country,
		);
		foreach($address as $key => $value) {
			$metakey = 'billing_' . $key;
			if (!add_user_meta($user_id, $metakey, $value, true)) {
				update_user_meta($user_id, $metakey, $value);
			}
		}

		$shipping = array(
			'first_name' => $data->shipping_address->first_name,
			'last_name' => $data->shipping_address->last_name,
			'company' => '',
			'address_1' => $data->shipping_address->address_1,
			'address_2' => $data->shipping_address->address_2,
			'city' => $data->shipping_address->city,
			'state' => $data->shipping_address->state,
			'postcode' => $data->shipping_address->postcode,
			'country' => $data->shipping_address->country,
		);
		foreach($shipping as $key => $value) {
			$metakey = 'shipping_' . $key;
			if (!add_user_meta($user_id, $metakey, $value, true)) {
				update_user_meta($user_id, $metakey, $value);
			}
		}

		return array(
			"comment_id"    => "ok",
			"btntext"       => "ok"
		);
	}

	public

	function get_home()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$custom_terms = get_terms('wp_cs_nutrition_categories');
		foreach($custom_terms as $custom_term) {
			wp_reset_query();
			$args = array(
				'post_type' => 'wp_cs_nutrition',
				'tax_query' => array(
					array(
						'taxonomy' => 'wp_cs_nutrition_categories',
						'field' => 'slug',
						'terms' => $custom_term->slug,
					) ,
				) ,
			);
			$loop = new WP_Query($args);
			if ($loop->have_posts()) {
				$category[$custom_term->term_id]["name"] = $custom_term->name;
				while ($loop->have_posts()):
					$loop->the_post();
					$id = get_the_ID();
					$category[$custom_term->term_id]["post"][$id]['title'] = get_the_title();
					$category[$custom_term->term_id]["post"][$id]['id'] = $id;
					if (has_post_thumbnail()) {
						$feat_image_url = wp_get_attachment_url(get_post_thumbnail_id());
						$category[$custom_term->term_id]["post"][$id]['img'] = $feat_image_url;
					}

				endwhile;
			}
		}

		$activity = $this->get_activity();
		$user = $this->get_user(10);
		return array(
			"cat"      => $category,
			"activity" => $activity,
			"user"     => $user
		);
	}

	public

	function get_product()
	{
		global $json_api;
		global $woocommerce;
		global $product;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$productId = $json_api->query->product_id;
		$productobj = wc_get_product($productId);
		$product['id'] = $productobj->get_description();
		$post_thumbnail_id = $productobj->get_image_id();
		$product['img'] = wp_get_attachment_url($post_thumbnail_id);
		$product['title'] = $productobj->get_name();
		$product['review'] = $productobj->get_description();
		$product['price'] = $productobj->get_price();
		$product['regular'] = $productobj->get_price();
		$product['price_html'] = $productobj->get_price_html();
		$product['description'] = $productobj->get_short_description();
		$product['des'] = $productobj->get_description();
		$product['average_rating'] = $productobj->get_average_rating();
		$product['attributes'] = $productobj->get_attribute();
		return array(
			"data" => $product
		);
	}

	public

	function get_user($limit = 30)
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		global $wpdb;
		$table_name = $wpdb->prefix . "cs_app_activities";
		$wpdb->show_errors(true);

		$myrows = $wpdb->get_results("SELECT `user_ID`,count(`user_ID`) as count FROM " . $table_name . "  group by `user_ID` order by count DESC LIMIT 0 , " . $limit);
		foreach($myrows as $key => $value) {
			$user_info = get_userdata($value->user_ID);
			if ($user_info === false) {
				continue;
			}

			$authorname = $user_info->display_name;
			$user[$key]['id'] = $key;
			$user[$key]['user_id'] = $value->user_ID;
			$user[$key]['name'] = $authorname;
			$country = get_user_meta($value->user_ID, "country", true);
			$user[$key]["country"] = $country;
		}

		return array(
			"user" => $user
		);
	}

	public

	function get_likers()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		global $wpdb;
		$post_id = $json_api->query->post_id;
		$table_name = $wpdb->prefix . "cs_app_activities_likes";
		$wpdb->show_errors(true);
		$sql = "SELECT `user_id` FROM " . $table_name . " WHERE `post_id` =" . $post_id;

		$myrows = $wpdb->get_results($sql);
		foreach($myrows as $key => $value) {
			$user_info = get_userdata($value->user_id);
			if ($user_info === false) {
				continue;
			}

			$authorname = $user_info->display_name;
			$user[$key]['id'] = $key;
			$user[$key]['user_id'] = $value->user_id;
			$user[$key]['name'] = $authorname;
			$country = get_user_meta($value->user_id, "country", true);
			$user[$key]["country"] = $country;
		}

		return array(
			"user" => $user
		);
	}

	public

	function get_activity()
	{
		global $json_api;
		global $wpdb;
		$table_name = $wpdb->prefix . 'cs_app_activities';
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$per_page = 6;
		$page = get_query_var('page') ? get_query_var('page') : 1;
		$postnumber = ($per_page * $page) - 2;
		$wp_query = new WP_Query(array(
			'post_type' => 'wp_cs_app_activities',
			'posts_per_page' => $per_page,
			'paged' => $page,
			'orderby' => 'post_date',
			'order' => 'DESC'
		));
		$totalpage = ceil($wp_query->found_posts / $per_page);
		if ($wp_query->have_posts()):

			while ($wp_query->have_posts()):
				$wp_query->the_post();
				$id = get_the_ID();
				$icon = get_post_meta($id, 'icon', true);
				$image = get_post_meta($id, 'bgimg', true);
				$author = get_post_meta($id, 'user_id', true);
				$comment = wp_count_comments($id);
				$pfx_date = get_the_date('', $id);
				$user_info = get_userdata($author);
				$authorname = $user_info->display_name;
				$time = meks_time_ago();
				$activity[$postnumber]['postid'] = $id;
				$activity[$postnumber]['title'] = get_the_title();
				$activity[$postnumber]["id"] = $postnumber;
				$activity[$postnumber]["bgpic"] = $image;
				$activity[$postnumber]["date"] = $pfx_date;
				$activity[$postnumber]["author"] = $author;
				$activity[$postnumber]["authorname"] = $authorname;
				$country = get_user_meta($user_id, "country", true);
				$activity[$postnumber]["country"] = $country;
				$activity[$postnumber]["comment"] = $comment;
				$activity[$postnumber]["icon"] = $icon;
				$activity[$postnumber]["time"] = $time;
				$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE post_id= " . $id ."");
				$activity[$postnumber]["like"] = $total;

				$postnumber++;
			endwhile;
			wp_reset_postdata();
		endif;
		return array(
			"activity" => $activity,
			"totalpage" => $totalpage
		);
	}

	public

	function get_single_user_activity()
	{
		global $json_api, $wpdb, $indeed_db;
		$table_name =  $wpdb->prefix . 'cs_app_activities';
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}


		$postid = $json_api->query->post_id;
		$wp_option = $wpdb->get_results($wpdb->prepare("SELECT `activities_type`,count(`activities_type`) as count ,`activities_icon` FROM `".$table_name."` WHERE `user_ID`=%d group by `activities_type`", $postid));
		$array = json_decode(json_encode($wp_option) , true);
		$custom_terms = get_terms('wp_cs_nutrition_categories');
		foreach($custom_terms as $custom_term) {
			wp_reset_query();
			$args = array(
				'post_type' => 'wp_cs_nutrition',
				'tax_query' => array(
					array(
						'taxonomy' => 'wp_cs_nutrition_categories',
						'field' => 'slug',
						'terms' => $custom_term->slug,
					) ,
				) ,
			);
			$loop = new WP_Query($args);
			if ($loop->have_posts()) {
				$category[$custom_term->term_id]["name"] = $custom_term->name;
				while ($loop->have_posts()):
					$loop->the_post();
					$id = get_the_ID();
					$arrayKey = searchArrayKeyVal("activities_type", $id, $array);
					if ($arrayKey !== false) {
						$category[$custom_term->term_id]["post"][$id]['count'] = $array[$arrayKey]['count'];
						$category[$custom_term->term_id]["post"][$id]['icon'] = $array[$arrayKey]['activities_icon'];
					}
					else {
						if (has_post_thumbnail()) {
							$feat_image_url = wp_get_attachment_url(get_post_thumbnail_id());
							$category[$custom_term->term_id]["post"][$id]['icon'] = $feat_image_url;
						}

						$icon = get_post_meta($id, 'icon', true);
						$category[$custom_term->term_id]["post"][$id]['count'] = "";
					}

				endwhile;
			}
		}

		$per_page = 3;
		$page = get_query_var('page') ? get_query_var('page') : 1;
		$postnumber = ($per_page * $page) - 2;
		$wp_query = new WP_Query(array(
			'post_type' => 'wp_cs_app_activities',
			'posts_per_page' => $per_page,
			'meta_query' => array(
				array(
					'key' => 'user_id',
					'value' => $postid,
					'compare' => '=',
				)
			) ,
			'paged' => $page,
			'orderby' => 'post_date',
			'order' => 'DESC'
		));

		$user_info = get_userdata($postid);
		$authorname = $user_info->display_name;
		$user_registered = cas_convert_date_to_us_format($user_info->data->user_registered);

		$d = strtotime($user_info->data->user_registered);
		$user_registered = date("Y", $d);
		if ($wp_query->have_posts()):
			$totalpage = ceil($wp_query->found_posts / $per_page);
			while ($wp_query->have_posts()):
				$wp_query->the_post();
				$id = get_the_ID();
				$icon = get_post_meta($id, 'icon', true);
				$image = get_post_meta($id, 'bgimg', true);
				$author = get_post_meta($id, 'user_id', true);
				$comment = wp_count_comments($id);
				$pfx_date = get_the_date('', $id);
				$time = meks_time_ago();
				$activity[$postnumber]['postid'] = $id;
				$activity[$postnumber]['title'] = get_the_title();
				$activity[$postnumber]["id"] = $postnumber;
				$activity[$postnumber]["bgpic"] = $image;
				$activity[$postnumber]["date"] = $pfx_date;
				$activity[$postnumber]["author"] = $author;
				$activity[$postnumber]["authorname"] = $authorname;
				$activity[$postnumber]["comment"] = $comment;
				$activity[$postnumber]["icon"] = $icon;
				$activity[$postnumber]["time"] = $time;
				$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE post_id= " . $id);
				$activity[$postnumber]["like"] = $total;

				// echo $id ."</br>";

				$postnumber++;
			endwhile;
			wp_reset_postdata();
		else:
			$totalpage = 0;
		endif;
		$country = get_user_meta($postid, "country", true);
		$rankval = $indeed_db->get_affiliate_rank(0, $postid);
		if ($rankval) {
			$rank['name'] = $indeed_db->get_rank($rankval);
			$rank['label'] = (empty($rankval['label'])) ? '' : $rankval['label'];
		}

		return array(
			"activity" => $activity,
			"totalpage" => $totalpage,
			"option" => $category,
			"authorname" => $authorname,
			"country" => $country,
			"rank" => $rank,
			"user_registered" => $user_registered
		);
	}

	public

	function get_single_activity()
	{
		global $json_api;
		global $wpdb;
		$table_name = $wpdb->prefix .'cs_app_activities_likes';
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$post_id = $json_api->query->post_id;
		$queried_post = get_post($post_id);
		$author = get_post_meta($post_id, 'user_id', true);
		$bgpic = get_post_meta($post_id, 'bgimg', true);
		$icon = get_post_meta($post_id, 'icon', true);
		$time = human_time_diff(get_the_time('U', $post_id) , current_time('timestamp')) . ' ' . __('ago');
		$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE post_id= " . $post_id);
		$country = get_user_meta($author, "country", true);
		$comment = $this->get_activity_comment($post_id);
		return array(
			"post" => $queried_post,
			"comment" => $comment,
			"author" => $author,
			"bgpic" => $bgpic,
			"icon" => $icon,
			"like" => $total,
			"time" => $time,
			"country" => $country
		);
	}

	public

	function get_activity_comment($post_id)
	{
		global $json_api;
		global $wpdb;
		$wp_comments = $wpdb->get_results($wpdb->prepare("
      SELECT *
      FROM $wpdb->comments
      WHERE comment_post_ID = %d
        AND comment_approved = 1
        AND comment_type = ''
      ORDER BY comment_date
    ", $post_id));
		$comments = array();
		foreach($wp_comments as $wp_comment) {
			$wp_comment->{"timeago"} = human_time_diff(get_comment_date('U', $wp_comment->comment_ID) , current_time('timestamp')) . ' ' . __('ago');
			$comments[] = $wp_comment;
		}

		return $comments;
	}

	public

	function post_activity_like()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$user_info = get_userdata($user_id);
		$time = current_time('mysql');
		$userID = $user_info->ID;
		$channelID = $json_api->query->channelID;
		global $wpdb;

		$table_name = $wpdb->prefix . "cs_app_activities_likes";
		$datum = $wpdb->get_results("SELECT * FROM " . $table_name . " WHERE user_ID= '" . $userID . "' AND post_id= '" . $channelID . "' ");
		if ($wpdb->num_rows < 1) {
			$wpdb->insert( $table_name, array(
				'user_ID' => $userID,
				'post_id' => $channelID
			));
			$wpdb->get_results("SELECT COUNT(*) FROM `".$table_name."` WHERE post_id= '" . $channelID . "'");
			$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE post_id= " . $channelID);
			return array(
				"comment_id" => $wpdb->insert_id,
				"btntext" => "Following",
				"like" => $total
			);
		}
		else {
			$wpdb->delete($table_name, array(
				'user_ID' => $userID,
				'post_id' => $channelID
			));
			$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE post_id= " . $channelID);
			return array(
				"comment_id" => "",
				"btntext" => "Follow",
				"like" => $total
			);
		}
	}

	public

	function post_activity_comment()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		return array(
			"test" => "test"
		);
	}

	public

	function post_activity()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$json = $json_api->query->post_id;
		$arr = explode('\\",\\"', substr($json, 3, strlen($json) - 6));
		foreach($arr as $key => $value) {
			$title = get_the_title($value);
			$notification_title = explode(" ", $title);
			$post_id = wp_insert_post(array(
				'post_type' => 'wp_cs_app_activities',
				'post_title' => $title,
				'post_content' => 'test content',
				'post_status' => 'publish',
				'comment_status' => 'open',
			));
			$image = get_field('nutritionopt_bgpic', $value);

			// $icon = wp_get_attachment_url( get_post_thumbnail_id($value));

			$icon = get_field('nutritions_icon', $value);
			$bigicon = wp_get_attachment_url(get_post_thumbnail_id($value));
			if ($post_id) {
				add_post_meta($post_id, 'user_id', $user_id);
				add_post_meta($post_id, 'bgimg', $image);
				add_post_meta($post_id, 'icon', $icon);
				$post[] = $post_id;
				global $wpdb;
				$tablename = $wpdb->prefix . "cs_app_activities";
				$user_ID = $user_id; //string value use: %s
				$post_ID = $post_id; //string value use: %s
				$activities_type = $value; //numeric value use: %d
				$activities_desc = ""; //string value use: %s
				$activities_icon = $bigicon; //string value use: %s
				$activities_bgpic = $image; //string value use: %s
				$now = new DateTime(); //string value use: %s
				$activities_time = $now->format('Y-m-d H:i:s'); //string value use: %s
				$status = 1;
				$sql = $wpdb->prepare("INSERT INTO `$tablename` (`user_ID`, `post_ID`, `activities_type`, `activities_desc`, `activities_icon`, `activities_bgpic`, `activities_time`,`status`) values (%s, %s, %d, %s, %s, %s, %s,%s)", $user_ID, $post_ID, $activities_type, $activities_desc, $activities_icon, $activities_bgpic, $activities_time, $status);
				$wpdb->query($sql);
				$notification = $this->add_notification("coginisance_activities", $notification_title[0]);
			}
		}

		return array(
			"post" => $post
		);
	}

	public

	function add_notification($type, $content)
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$post_id = wp_insert_post(array(
			'post_type' => 'wp_cs_app_notify',
			'post_title' => $content . $user_id,
			'post_content' => $content,
			'post_status' => 'publish',
			'comment_status' => 'open',
		));
		if ($post_id) {
			add_post_meta($post_id, 'user_id', $user_id);
			add_post_meta($post_id, 'type', $type);
		}

		return array(
			"post" => $post_id
		);
	}

	public

	function post_channel_activity()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$channelID = $json_api->query->channelID;
		$term = get_term($channelID, 'wp_cs_channel_categories');
		$title = "Followed the " . $term->name . " Channel";
		$post_id = wp_insert_post(array(
			'post_type' => 'wp_cs_app_activities',
			'post_title' => $title,
			'post_content' => 'test content',
			'post_status' => 'publish',
			'comment_status' => 'open',
		));
		$image = get_field('cat_featured_image', 'wp_cs_channel_categories_' . $channelID);

		// $icon = wp_get_attachment_url( get_post_thumbnail_id($value));

		$icon = "";
		if ($post_id) {
			add_post_meta($post_id, 'user_id', $user_id);
			add_post_meta($post_id, 'bgimg', $image);
			add_post_meta($post_id, 'icon', $icon);
			$post[] = $post_id;
			global $wpdb;
			$tablename = $wpdb->prefix . "cs_app_activities";
			$user_ID = $user_id; //string value use: %s
			$post_ID = $post_id; //string value use: %s
			$activities_type = "3456734567"; //numeric value use: %d
			$activities_desc = ""; //string value use: %s
			$activities_icon = $icon; //string value use: %s
			$activities_bgpic = $image; //string value use: %s
			$now = new DateTime(); //string value use: %s
			$activities_time = $now->format('Y-m-d H:i:s'); //string value use: %s
			$status = 1;
			$sql = $wpdb->prepare("INSERT INTO `$tablename` (`user_ID`, `post_ID`, `activities_type`, `activities_desc`, `activities_icon`, `activities_bgpic`, `activities_time`,`status`) values (%s, %s, %d, %s, %s, %s, %s,%s)", $user_ID, $post_ID, $activities_type, $activities_desc, $activities_icon, $activities_bgpic, $activities_time, $status);
			$wpdb->query($sql);
		}

		return array(
			"post" => $post
		);
	}

	// chnael ,module api

	public

	function getChannels()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		global $wpdb;
		$table_name = $wpdb->prefix . 'cs_posts_seen';
		$seencatcourse = $wpdb->get_results($wpdb->prepare("SELECT cat_id, COUNT(*) as `counter` FROM `".$table_name."` WHERE user_id = '$user_id' AND type = '2'  GROUP BY cat_id ORDER BY count(*) DESC"));
		foreach($seencatcourse as $mkey => $result) {
			$seencat[$result->cat_id] = $result->counter;
		}

		$custom_terms = get_terms('wp_cs_channel_categories', array(
			'orderby' => 'count',
			'hide_empty' => 0,
		));

		foreach($custom_terms as $key => $custom_term) {
			$seen = false;
			if (isset($seencat[$custom_term->term_id])) {
				if ($seencat[$custom_term->term_id] == $custom_term->count) {
					$seen = true;
				}
			}

			$category[$key]["id"] = $custom_term->term_id;
			$category[$key]["name"] = $custom_term->name;
			$category[$key]["img"] = get_field('cat_featured_image', 'wp_cs_channel_categories_' . $custom_term->term_id);
			$category[$key]["seen"] = $seen;
		}
		$tbl_channel_following = $wpdb->prefix . 'cs_channel_following';
		$datum = $wpdb->get_results("SELECT channel_ID FROM `".$tbl_channel_following."`  WHERE user_ID=". $user_id."");


		foreach($datum as $row) {
			$follow[] = $row->channel_ID;
		}

		if (!empty($follow)) {
			$followcategories = array();
			$custom_terms = get_terms('wp_cs_channel_categories', array(
				'orderby' => 'count',
				'hide_empty' => 0,
				'include' => $follow,
			));
			foreach($custom_terms as $key => $custom_term) {
				$seen = false;
				if (isset($seencat[$custom_term->term_id])) {
					if ($seencat[$custom_term->term_id] == $custom_term->count) {
						$seen = true;
					}
				}

				$followcategories[$key]["id"] = $custom_term->term_id;
				$followcategories[$key]["name"] = $custom_term->name;
				$followcategories[$key]["img"] = get_field('cat_featured_image', 'wp_cs_channel_categories_' . $custom_term->term_id);
				$followcategories[$key]["seen"] = $seen;
			}
		}
		else {
			$followcategories = array();
		}

		return array(
			"category" => $category,
			"follow" => $followcategories
		);
	}

	public

	function getsingleChannel()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$parent = $json_api->query->post_id;
		$term = get_term($parent, "wp_cs_channel_categories");
		$category['id'] = $term->term_id;
		$category['name'] = $term->name;
		$category['img'] = get_field('cat_featured_image', 'wp_cs_channel_categories_' . $term->term_id);
		global $wpdb;
		$table_name = $wpdb->prefix . 'cs_channel_following';
		$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE channel_ID= " . $parent);
		$btntext = "Follow";
		$channelID = $parent;
		$userID = $user_id;
		$datum = $wpdb->get_results("SELECT * FROM `".$table_name."`  WHERE user_ID= '" . $userID . "' AND channel_ID= '" . $channelID . "' ");
		if ($wpdb->num_rows < 1) {
			$btntext = "Follow";
		}
		else {
			$btntext = "Following";
		}

		$post = $this->get_channelpostbyid($channelID);
		return array(
			"category" => $category,
			'total' => $total,
			'btn' => $btntext,
			'posts' => $post
		);
	}

	public

	function get_channelpostbyid($id)
	{
		global $json_api;
		global $wpdb;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$per_page = 10;
		$page = get_query_var('page') ? get_query_var('page') : 1;
		$postnumber = ($per_page * $page) - 2;
		$args = array(
			'post_type' => 'wp_cs_channel',
			'paged' => $page,
			'orderby' => 'post_date',
			'order' => 'DESC',
			'tax_query' => array(
				array(
					'taxonomy' => 'wp_cs_channel_categories',
					'field' => 'term_id',
					'terms' => $id
				)
			)
		);
		$wp_query = new WP_Query($args);
		$totalpage = ceil($wp_query->found_posts / $per_page);
		if ($wp_query->have_posts()):

			// $start=1;

			while ($wp_query->have_posts()):
				$wp_query->the_post();
				$id = get_the_ID();
				$pfx_date = get_the_date('', $id);
				$time = meks_time_ago();
				$activity[$postnumber]['postid'] = $id;
				$activity[$postnumber]['title'] = get_the_title();
				$image = wp_get_attachment_url(get_post_thumbnail_id($id));
				$activity[$postnumber]["id"] = $postnumber;
				$activity[$postnumber]["img"] = $image;
				$activity[$postnumber]["date"] = $pfx_date;
				$activity[$postnumber]["time"] = $time;
				$table_name = $wpdb->prefix . "cs_posts_seen";
				$datum = $wpdb->get_results("SELECT user_id,post_id FROM " . $table_name . " WHERE user_id= '" . $user_id . "' AND post_id= '" . $id . "' ");
				if ($wpdb->num_rows < 1) {
					$seen = false;
				}
				else {
					$seen = true;
				}

				$activity[$postnumber]["seen"] = $seen;
				$postnumber++;
			endwhile;
			wp_reset_postdata();
		endif;
		return array(
			"activity" => $activity,
			"totalpage" => $totalpage
		);
	}

	public

	function get_channelpost()
	{
		global $json_api;
		global $wpdb;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$per_page = 3;
		$page = get_query_var('page') ? get_query_var('page') : 1;
		$postnumber = ($per_page * $page) - 2;
		$wp_query = new WP_Query(array(
			'post_type' => 'wp_cs_channel',
			'posts_per_page' => $per_page,
			'paged' => $page,
			'orderby' => 'post_date',
			'order' => 'DESC'
		));
		$totalpage = ceil($wp_query->found_posts / $per_page);
		if ($wp_query->have_posts()):

			// $start=1;

			while ($wp_query->have_posts()):
				$wp_query->the_post();
				$id = get_the_ID();
				$pfx_date = get_the_date('', $id);
				$time = meks_time_ago();
				$activity[$postnumber]['postid'] = $id;
				$activity[$postnumber]['title'] = get_the_title();
				$image = wp_get_attachment_url(get_post_thumbnail_id($id));
				$activity[$postnumber]["id"] = $postnumber;
				$activity[$postnumber]["img"] = $image;
				$activity[$postnumber]["date"] = $pfx_date;
				$activity[$postnumber]["time"] = $time;
				$table_name = $wpdb->prefix . "cs_posts_seen";
				$datum = $wpdb->get_results("SELECT user_id,post_id FROM " . $table_name . " WHERE user_id= '" . $user_id . "' AND post_id= '" . $id . "' ");
				if ($wpdb->num_rows < 1) {
					$seen = false;
				}
				else {
					$seen = true;
				}

				$activity[$postnumber]["seen"] = $seen;
				$postnumber++;
			endwhile;
			wp_reset_postdata();
		endif;
		return array(
			"activity" => $activity,
			"totalpage" => $totalpage
		);
	}

	public

	function getProducts()
	{
		global $json_api;
		global $wpdb;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$per_page = 3;
		$page = get_query_var('page') ? get_query_var('page') : 1;
		$params = array(
			'posts_per_page' => - 1,
			'post_type' => array(
				'product'
			) ,
		);
		$postnumber = ($per_page * $page) - 2;
		$wp_query = new WP_Query($params);
		$totalpage = ceil($wp_query->found_posts / $per_page);
		if ($wp_query->have_posts()):

			// $start=1;

			while ($wp_query->have_posts()):
				$wp_query->the_post();
				$id = get_the_ID();
				$pfx_date = get_the_date('', $id);
				$time = meks_time_ago();
				$activity[$postnumber]['postid'] = $id;
				$activity[$postnumber]['title'] = get_the_title();
				$image = wp_get_attachment_url(get_post_thumbnail_id($id));
				$activity[$postnumber]["id"] = $postnumber;
				$activity[$postnumber]["img"] = $image;
				$activity[$postnumber]["date"] = $pfx_date;
				$activity[$postnumber]["time"] = $time;
				$price = get_post_meta($id, '_regular_price', true);
				$sale = get_post_meta($id, '_sale_price', true);
				$activity[$postnumber]["length"]   = get_post_meta($id, '_length', true);
				$activity[$postnumber]["height"]   = get_post_meta($id, '_height', true);
				$activity[$postnumber]["width"]    = get_post_meta($id, '_width', true);
				$activity[$postnumber]["weight"]   = get_post_meta($id, '_weight', true);
				$activity[$postnumber]["regular"] = $price;
				$activity[$postnumber]["sale"] = $sale;
				$activity[$postnumber]["currency"] = get_woocommerce_currency();
                $prod_cat = wp_get_post_terms( $id, 'product_cat' );
                $activity[$postnumber]["prod_cat"] = strtolower($prod_cat[0]->name);
				$postnumber++;
			endwhile;
			wp_reset_postdata();
		endif;
		return array(
			"product" => $activity,
			"totalpage" => $totalpage
		);
	}

	public

	function getseenpost($postid, $userid)
	{
		global $wpdb;
		$table_name = $wpdb->prefix . "cs_posts_seen";
		$datum = $wpdb->get_results("SELECT user_id,post_id FROM " . $table_name . " WHERE user_id= '" . $user_id . "' AND post_id= '" . $id . "' ");
		if ($wpdb->num_rows < 1) {
			$seen = false;
		}
		else {
			$seen = true;
		}

		return $seen;
	}

	public

	function getchannelpost()
	{
		global $wpdb;
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must1390513905 include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		// $title = $post_7->post_title;

		$postid = $json_api->query->post_id;
		$cat = $json_api->query->cat_id;
		$term = get_term($cat, "wp_cs_channel_categories");
		$category['id'] = $term->term_id;
		$category['name'] = $term->name;
		$category['img'] = get_field('cat_featured_image', 'wp_cs_channel_categories_' . $term->term_id);
		$posts = get_post($postid);

		// var_dump($posts);
		$table_name = $wpdb->prefix . 'cs_app_activities_likes';
		$total = $wpdb->get_var("SELECT COUNT(*) AS total FROM `".$table_name."` WHERE post_id= " . $postid);
		WPBMap::addAllMappedShortcodes();
		$post['id'] = $postid;
		$post['name'] = $posts->post_title;
		$post['content'] = apply_filters('the_content', $posts->post_content);
		$feat_image_url = wp_get_attachment_url(get_post_thumbnail_id($postid));
		$post['img'] = $feat_image_url;
		$post['time'] = human_time_diff(get_the_time('U', $postid) , current_time('timestamp')) . ' ago';
		$post['like'] = $total;
		$post['url'] = $posts->guid;
		return array(
			"category" => $category,
			"post" => $post
		);
	}

	// learn module api

	public

	function learncategories()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		global $wpdb;
		$table_name = $wpdb->prefix . 'cs_posts_seen';
		$seencat = array();
		$seensubcat = array();

		// $completedcategory=array();

		$seencatcourse = $wpdb->get_results($wpdb->prepare("SELECT cat_id, COUNT(*) as `counter` FROM `".$table_name."` WHERE user_id = '$user_id' AND type = '1'  GROUP BY cat_id ORDER BY count(*) DESC"));
		foreach($seencatcourse as $mkey => $result) {
			$seencat[$result->cat_id] = $result->counter;
		}

		// var_dump($seencatcourse);

		$seensubcatcourse = $wpdb->get_results($wpdb->prepare("SELECT sub_cat_id, COUNT(*) as `counter` FROM `".$table_name."` WHERE user_id = '$user_id' AND type = '1'  GROUP BY sub_cat_id ORDER BY count(*) DESC"));
		foreach($seensubcatcourse as $mkey => $result) {
			$seensubcat[$result->sub_cat_id] = $result->counter;
		}

		// var_dump($seensubcatcours);

		$custom_terms = get_terms('wp_cs_learn_categories', array(
			'orderby' => 'count',
			'hide_empty' => 0,
		));

		// var_dump($custom_terms);

		$i = 0;
		foreach($custom_terms as $key => $custom_term) {

			// var_dump($key);

			if ($custom_term->parent == 0) { // avoid parent categories
				$seen = true;
				if ($seencat[$custom_term->term_id] == $custom_term->count) {
					$seen = false;
				}

				$category[$key]["id"] = $custom_term->term_id;
				$category[$key]["name"] = $custom_term->name;
				$category[$key]["img"] = get_field('cat_featured_image', 'wp_cs_learn_categories_' . $custom_term->term_id);
				$category[$key]["seen"] = $seen;
			}
			else {
				if (isset($seensubcat[$custom_term->term_id])) {
					if ($seensubcat[$custom_term->term_id] == $custom_term->count) {
						$completedcategory[$i]["id"] = $custom_term->term_id;
						$completedcategory[$i]["parent"] = $custom_term->parent;
						$completedcategory[$i]["name"] = $custom_term->name;
						$completedcategory[$i]["img"] = get_field('cat_featured_image', 'wp_cs_learn_categories_' . $custom_term->term_id);
						$completedcategory[$i]["seen"] = true;
						$i++;
					}
				}
			}
		}

		// var_dump($category);
		// echo "-------------------------";
		// var_dump($completedcategory);

		return array(
			"category" => $category,
			"completedcategory" => $completedcategory
		);
	}

	public

	function learnsubcategories()
	{
		global $json_api;
		global $wpdb;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$parent = $json_api->query->post_id;
		$term = get_term($parent, "wp_cs_learn_categories");
		$category['id'] = $term->term_id;
		$category['name'] = $term->name;
		$category['img'] = get_field('cat_featured_image', 'wp_cs_learn_categories_' . $term->term_id);
		$custom_terms = get_terms('wp_cs_learn_categories', array(
			'orderby' => 'count',
			'hide_empty' => 0,
			'parent' => $parent
		));
		$table_name = $wpdb->prefix . 'cs_posts_seen';
		$seensubcatcourse = $wpdb->get_results($wpdb->prepare("SELECT sub_cat_id, COUNT(*) as `counter` FROM `".$table_name."` WHERE user_id = '$user_id' AND type = '1'  AND cat_id='$parent' GROUP BY sub_cat_id ORDER BY count(*) DESC"));

		foreach($seensubcatcourse as $mkey => $result) {
			$seensubcat[$result->sub_cat_id] = $result->counter;
		}

		foreach($custom_terms as $custom_term) {
			$seen = false;
			if ($seensubcat[$custom_term->term_id] == $custom_term->count) {
				$seen = true;
			}

			$subcategory[$custom_term->term_id]["id"] = $custom_term->term_id;
			$subcategory[$custom_term->term_id]["name"] = $custom_term->name;
			$subcategory[$custom_term->term_id]["img"] = get_field('cat_featured_image', 'wp_cs_learn_categories_' . $custom_term->term_id);
			$subcategory[$custom_term->term_id]["seen"] = $seen;
			$subcategory[$custom_term->term_id]["lesson"] = $custom_term->count;
		}

		return array(
			"subcategory" => $subcategory,
			"category" => $category
		);
	}

	public

	function learnalllesson()
	{
		global $json_api;
		global $wpdb;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$parent = $json_api->query->post_id;
		$custom_term = get_term($parent, "wp_cs_learn_categories");
		$category['id'] = $custom_term->term_id;
		$category['name'] = $custom_term->name;
		$category['lesson'] = $custom_term->count;
		$category['slug'] = $custom_term->slug;
		$category['img'] = get_field('cat_featured_image', 'wp_cs_learn_categories_' . $custom_term->term_id);
		$args = array(
			'post_type' => 'wp_cs_learns',
			'posts_per_page' => - 1,
			'tax_query' => array(
				array(
					'taxonomy' => 'wp_cs_learn_categories',
					'field' => 'slug',
					'terms' => $custom_term->slug,
				) ,
			) ,
		);
		$loop = new WP_Query($args);
		if ($loop->have_posts()) {
			while ($loop->have_posts()):
				$loop->the_post();
				$id = get_the_ID();
				$lesson["post"][$id]['title'] = get_the_title();
				$lesson["post"][$id]['id'] = $id;
				if (has_post_thumbnail()) {
					$feat_image_url = wp_get_attachment_url(get_post_thumbnail_id());
					$lesson["post"][$id]['img'] = $feat_image_url;
				}

				$table_name = $wpdb->prefix . "cs_posts_seen";
				$datum = $wpdb->get_results("SELECT user_id,post_id FROM " . $table_name . " WHERE user_id= '" . $user_id . "' AND post_id= '" . $id . "' ");
				if ($wpdb->num_rows < 1) {
					$seen = false;
				}
				else {
					$seen = true;
				}

				$lesson["post"][$id]['seen'] = $seen;
			endwhile;
		}

		return array(
			"category" => $category,
			"lesson" => $lesson
		);
	}

	public

	function learnsinglelesson()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$parent = $json_api->query->post_id;
		$terms = wp_get_object_terms($parent, 'wp_cs_learn_categories', array(
			'fields' => 'ids'
		));
		$term_id = $terms[0];
		$args = array(
			'post_type' => 'wp_cs_learns',
			'tax_query' => array(
				array(
					'taxonomy' => 'wp_cs_learn_categories',
					'field' => 'slug',
					'terms' => $custom_term->slug,
				) ,
			) ,
		);
		$posts = get_post($parent);
		WPBMap::addAllMappedShortcodes();

		$post['name'] = $posts->post_title;
		$post['content'] = apply_filters('the_content', $posts->post_content);

		$post['img'] = get_field('cat_featured_image', 'wp_cs_learn_categories_' . $term_id);
		$sproutvideo = get_post_meta($parent, '_sproutvideo_embed_src', true);
		$post['spvideo'] = $sproutvideo;
		$type = get_field("learn_lesson_type", $parent);
		if ($type == 'Video') {
			$post['video'] = get_field("video_url", $parent);
		}
		else
		if ($type = 'Audio') {
			$post['audio'] = get_field("audio_url", $parent);
		}
		else {
			$post['text'] = "it's text type";
		}

		return array(
			"category" => $category,
			"post" => $post
		);
	}

	// chnage username

	public

	function changename()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		// $title = $post_7->post_title;

		$nick = $json_api->query->nick;
		$user_fields = array(
			'ID' => $user_id,
			'display_name' => $nick,
		);
		wp_update_user($user_fields);
		$user_info = get_userdata($user_id);
		return array(
			"status" => $user_info
		);
	}

	public

	function changefname()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		// $title = $post_7->post_title;

		$nick = $json_api->query->name;
		$user_fields = array(
			'ID' => $user_id,
			'first_name' => $nick,
		);
		wp_update_user($user_fields);
		$user_info = get_userdata($user_id);
		return array(
			"status" => $user_info
		);
	}

	public

	function changelname()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		// $title = $post_7->post_title;

		$nick = $json_api->query->name;
		$user_fields = array(
			'ID' => $user_id,
			'last_name' => $nick,
		);
		wp_update_user($user_fields);
		$user_info = get_userdata($user_id);
		return array(
			"status" => $user_info
		);
	}

	// update country

	public

	function changecountry()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$country = $json_api->query->country;
		$updated = update_user_meta($user_id, 'country', $country);
		return array(
			"lang" => $updated
		);
	}

	public

	function changelang()
	{
		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$lang = $json_api->query->lang;
		$updated = update_user_meta($user_id, 'lang', $lang);
		return array(
			"lang" => $lang
		);
	}

	public

	function getlang($uid)
	{
		$lang = trim(get_user_meta($user_id, "lang", true));
		if ($lang) {
			return $lang;
		}
		else {
			return "en";
		}
	}

	// mark post as seen

	public

	function markasseen()
	{

		global $json_api;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$user_info = get_userdata($user_id);
		$time = current_time('mysql');
		$userID = $user_info->ID;
		$catid = $json_api->query->catid;
		$subcatid = $json_api->query->subcatid;
		$postid = $json_api->query->postid;
		$type = $json_api->query->type;
		global $wpdb;
		$table_name = $wpdb->prefix . "cs_posts_seen";
		$datum = $wpdb->get_results("SELECT * FROM " . $table_name . " WHERE user_id= '" . $userID . "' AND post_id= '" . $postid . "' ");
		if ($wpdb->num_rows < 1) {
			$wpdb->insert($table_name, array(
				'user_id' => $userID,
				'post_id' => $postid,
				'cat_id' => $catid,
				'sub_cat_id' => $subcatid,
				'type' => $type
			));

			return array(
				"statusid" => $wpdb->insert_id,
				"status" => "ok"
			);
		}
		else {
			return array(
				"status" => "ok"
			);
		}
	}

	// get notification icon

	public

	function trace_notification()
	{
		global $json_api;
		global $wpdb;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$per_page = 1;
		$page = 1;
		$postnumber = ($per_page * $page) - ($per_page - 1);
		$wp_query = new WP_Query(array(
			'post_type' => 'wp_cs_app_notify',
			'posts_per_page' => 1,
			'paged' => $page,
			'orderby' => 'post_date',
			'order' => 'DESC',
			'meta_query' => array(
				array(
					'key' => 'user_id',
					'value' => array(
						$user_id
					) ,
					'compare' => 'NOT IN'
				)
			)
		));
		if ($wp_query->have_posts()):
			while ($wp_query->have_posts()):
				$wp_query->the_post();
				$id = get_the_ID();
				$postnumber++;
			endwhile;
			wp_reset_postdata();
		else:
			return array(
				"notification" => false
			);
		endif;
		$table_name = $wpdb->prefix . "cs_app_notification_tracker"; //this table will contain all user id who have no notification
		$datum = $wpdb->get_results("SELECT post_id FROM " . $table_name . " WHERE user_id= '" . $user_id . "' Limit 0,1");

		if ($wpdb->num_rows < 1) {
			return array(
				"notification" => true
			); //no record found coz user have a notification
		}
		else {
			if ($id == $datum[0]->post_id) {
				return array(
					"notification" => false
				);
			}
			else {
				return array(
					"notification" => true
				);
			} //there is a record so no notification
		}
	}

	public

	function get_notification()
	{
		global $json_api;
		global $wpdb;
		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' var in your request. Use the `generate_auth_cookie` method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid cookie. Use the `generate_auth_cookie` method.");
		}

		$per_page = 30;
		$page = get_query_var('page') ? get_query_var('page') : 1;
		$postnumber = ($per_page * $page) - ($per_page - 1);
		$wp_query = new WP_Query(array(
			'post_type' => 'wp_cs_app_notify',
			'posts_per_page' => $per_page,
			'paged' => $page,
			'orderby' => 'post_date',
			'order' => 'DESC',
			'meta_query' => array(
				array(
					'key' => 'user_id',
					'value' => array(
						$user_id
					) ,
					'compare' => 'NOT IN'
				)
			)
		));
		$totalpage = ceil($wp_query->found_posts / $per_page);
		if ($wp_query->have_posts()):


			while ($wp_query->have_posts()):
				$wp_query->the_post();
				$id = get_the_ID();
				if ($postnumber == 1) {
					$lastid = $id;
				}

				$notification_type = get_post_meta($id, 'type', true);
				$pfx_date = get_the_date('', $id);
				$time = meks_time_ago();
				$content = get_the_content();
				$notification_owner = get_post_meta($id, 'user_id', true);
				$user_info = get_userdata($notification_owner);
				$authorname = $user_info->display_name;
				if ($notification_type == 'coginisance_activities') {
					$activity[$postnumber]["notification"] = $authorname . ' <span class="note note-ios">performed <span class="dark">' . $content . '</span> nutrition action</span>';
				}
				else
				if ($notification_type == 'follow') {
					$channelID = $content;
					$term = get_term($channelID, 'channels_category');
					$content = $term->name;
					$activity[$postnumber]["notification"] = $authorname . ' <span class="note note-ios">started following <span class="dark">' . $content . '</span> channel</span>';
				}
				else
				if ($notification_type == 'channelpost') {
					$follower = explode(",", get_post_meta($id, 'user_list', true));
					if (in_array($user_id, $follower)) {
						$term = get_term($content, 'channels_category');
						$content = $term->name;
						$activity[$postnumber]["notification"] = '<h2><span class="note note-ios">New article posted on <span class="dark">' . $content . '</span> channel</span></h2>';
						$parent = get_post_meta($id, 'post_id', true);
						$feat_image_url = wp_get_attachment_url(get_post_thumbnail_id($parent));
						$activity[$postnumber]["img"] = $feat_image_url;
					}
					else {
						continue;
					}
				}
				else
				if ($notification_type == 'learn') {
					$term = get_term($content, 'wp_cs_learn_categories');
					$content = $term->name;
					$activity[$postnumber]["notification"] = '<h2><span class="note note-ios">New lesson published on <span class="dark">' . $content . '</span> Course</span></h2>';
					$parent = get_post_meta($id, 'post_id', true);
					$feat_image_url = wp_get_attachment_url(get_post_thumbnail_id($parent));
					$activity[$postnumber]["img"] = $feat_image_url;
				}

				$activity[$postnumber]['postid'] = $id;
				$activity[$postnumber]['title'] = get_the_title();
				$activity[$postnumber]['content'] = $content;
				$activity[$postnumber]["id"] = $postnumber;
				$activity[$postnumber]["authorname"] = $authorname;
				$activity[$postnumber]["user_id"] = $notification_owner;
				$activity[$postnumber]["date"] = $pfx_date;
				$activity[$postnumber]["time"] = $time;
				$postnumber++;
			endwhile;
			wp_reset_postdata();
		endif;
		$table_name = $wpdb->prefix . "cs_app_notification_tracker"; //this table will contain all
		if (isset($lastid)) {

			// dlt all
			// insert this one

			$wpdb->delete($table_name, array(
				'user_id' => $user_id
			));
			$wpdb->insert($table_name, array(
				'user_id' => $user_id,
				'post_id' => $lastid
			));
		}

		return array(
			"activity" => $activity,
			"totalpage" => $totalpage
		);
	}
} //end class

if (!function_exists('cas_convert_date_to_us_format')) {
	function cas_convert_date_to_us_format($date = '')
	{
		/*
		* @param string
		* @return string
		*/
		if ($date && $date != '-' && is_string($date)) {
			@$date = strtotime($date);

			// $format = 'F j, Y';

			$format = get_option('date_format');
			$return_date = date_i18n($format, $date);
			$time_format = get_option('time_format');
			$time = date_i18n($time_format, $date);
			if ($time) {
				$time = ' ' . $time;
			}

			return $return_date . $time;
		}

		return $date;
	}
}
