<?php

defined('ABSPATH') || exit;

function gdhe_task025_red_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

do_action('rest_api_init');
$routes = rest_get_server()->get_routes();

gdhe_task025_red_assert(
    function_exists('gdhe_validate_catalog_accessory_quote_source'),
    'TASK-025 private accessory source/index seam is missing.'
);
gdhe_task025_red_assert(
    isset($routes['/gdhe/v1/quote-line-validations']),
    'TASK-025 mixed quote-line validation POST route is missing.'
);

$related = new WP_REST_Request('GET', '/gdhe/v1/related-product-cards');
$related->set_param('locale', 'en');
$related->set_param('schema', '2.0.0');
$related->set_param('source_path', '/products/not-present/');
$related_response = rest_do_request($related);
gdhe_task025_red_assert(
    (int) $related_response->get_status() !== 400,
    'RelatedProductCard 2.0 is still rejected as an unsupported schema.'
);

WP_CLI::success('TASK-025 route/source seams are registered.');
