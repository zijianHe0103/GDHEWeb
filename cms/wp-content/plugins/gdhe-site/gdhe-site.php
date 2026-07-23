<?php
/**
 * Plugin Name: GDHE Site
 * Description: Code-owned content model and minimal read-only REST schema for GDHE.
 * Version: 0.1.1
 * Requires at least: 7.0
 * Requires PHP: 8.2
 * Author: GDHE
 * License: GPL-2.0-or-later
 * Text Domain: gdhe-site
 */

declare(strict_types=1);

defined('ABSPATH') || exit;

define('GDHE_SITE_VERSION', '0.1.1');
define('GDHE_SCHEMA_VERSION', '1.0.0');
define('GDHE_SITE_PATH', plugin_dir_path(__FILE__));

require_once GDHE_SITE_PATH . 'includes/config.php';
require_once GDHE_SITE_PATH . 'includes/content-model.php';
require_once GDHE_SITE_PATH . 'includes/capabilities.php';
require_once GDHE_SITE_PATH . 'includes/fields.php';
require_once GDHE_SITE_PATH . 'includes/rest.php';

register_activation_hook(__FILE__, 'gdhe_site_activate');
register_deactivation_hook(__FILE__, 'gdhe_site_deactivate');

add_action('init', 'gdhe_register_content_model');
add_action('acf/include_fields', 'gdhe_register_field_groups');
add_action('rest_api_init', 'gdhe_register_rest_api');
