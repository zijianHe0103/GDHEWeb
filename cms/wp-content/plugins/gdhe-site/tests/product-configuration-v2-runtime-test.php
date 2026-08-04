<?php

defined('ABSPATH') || exit;

$request = new WP_REST_Request('GET', '/gdhe/v1/product-configurations');
$request->set_param('schema', '2.0.0');
$request->set_param('path', '/products/fgd-x15-pvc/');
$response = rest_do_request($request);
$data = $response->get_data();
if ((int) $response->get_status() !== 404
    || ($data['code'] ?? '') !== 'gdhe_not_found'
    || ($response->get_headers()['Cache-Control'] ?? '') !== 'no-store') {
    throw new RuntimeException('Product Configuration v2 route behavior is missing.');
}

WP_CLI::line(wp_json_encode(array(
    'schemaVersion' => '2.0.0',
    'emptyRouteStatus' => 404,
), JSON_PRETTY_PRINT));
