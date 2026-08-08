<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_task023_related_products_bootstrap(): void
{
    if (!defined('GDHE_SITE_PATH')) {
        return;
    }
    require_once GDHE_SITE_PATH . 'includes/related-product-cards.php';
    require_once GDHE_SITE_PATH . 'includes/fixtures-task023.php';
    add_action('rest_api_init', 'gdhe_register_related_product_card_route');
}

add_action('plugins_loaded', 'gdhe_task023_related_products_bootstrap', 20);
