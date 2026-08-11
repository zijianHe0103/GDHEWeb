<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_task025_article_number_batch_bootstrap(): void
{
    if (!defined('GDHE_SITE_PATH')) {
        return;
    }
    require_once GDHE_SITE_PATH . 'includes/fixtures-task021.php';
    require_once GDHE_SITE_PATH . 'includes/quote-line-validations.php';
    require_once GDHE_SITE_PATH . 'includes/fixtures-task025.php';
    add_action('rest_api_init', 'gdhe_register_quote_line_validation_route');
    add_filter('rest_pre_dispatch', 'gdhe_quote_line_validation_pre_dispatch', 10, 3);
}

add_action('plugins_loaded', 'gdhe_task025_article_number_batch_bootstrap', 30);
