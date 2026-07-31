<?php
/**
 * Plugin Name: GDHE Site
 * Description: Code-owned content model and minimal read-only REST schema for GDHE.
 * Version: 0.6.0
 * Requires at least: 7.0
 * Requires PHP: 8.2
 * Author: GDHE
 * License: GPL-2.0-or-later
 * Text Domain: gdhe-site
 */

declare(strict_types=1);

defined('ABSPATH') || exit;

define('GDHE_SITE_VERSION', '0.6.0');
define('GDHE_SCHEMA_VERSION', '3.0.0');
define('GDHE_MODULE_SCHEMA_VERSION', '1.0.0');
define('GDHE_SITE_PATH', plugin_dir_path(__FILE__));

require_once GDHE_SITE_PATH . 'includes/config.php';
require_once GDHE_SITE_PATH . 'includes/content-model.php';
require_once GDHE_SITE_PATH . 'includes/capabilities.php';
require_once GDHE_SITE_PATH . 'includes/fields.php';
require_once GDHE_SITE_PATH . 'includes/modules.php';
require_once GDHE_SITE_PATH . 'includes/migrations.php';
require_once GDHE_SITE_PATH . 'includes/migration-a3.php';
require_once GDHE_SITE_PATH . 'includes/public-details.php';
require_once GDHE_SITE_PATH . 'includes/product-cards.php';
require_once GDHE_SITE_PATH . 'includes/product-configurations.php';
require_once GDHE_SITE_PATH . 'includes/public-api.php';
require_once GDHE_SITE_PATH . 'includes/fixtures.php';
require_once GDHE_SITE_PATH . 'includes/fixtures-a3.php';
require_once GDHE_SITE_PATH . 'includes/fixtures-task014.php';
require_once GDHE_SITE_PATH . 'includes/fixtures-task019.php';
require_once GDHE_SITE_PATH . 'includes/rest.php';

register_activation_hook(__FILE__, 'gdhe_site_activate');
register_deactivation_hook(__FILE__, 'gdhe_site_deactivate');

add_action('init', 'gdhe_register_content_model');
add_action('wp_after_insert_post', 'gdhe_assign_public_identifier', 10, 3);
add_action('acf/include_fields', 'gdhe_register_field_groups');
add_action('rest_api_init', 'gdhe_register_rest_api');
