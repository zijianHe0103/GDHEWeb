<?php

defined('ABSPATH') || exit;

$routes = rest_get_server()->get_routes();
if (!isset($routes['/gdhe/v1/product-configurations'])) {
    throw new RuntimeException('Expected Product Configuration route is not registered.');
}

$request = new WP_REST_Request('GET', '/gdhe/v1/product-configurations');
$request->set_param('path', '/products/fgd-x15-pvc/');
$response = rest_do_request($request);
if ((int) $response->get_status() !== 404
    || ($response->get_data()['code'] ?? '') !== 'gdhe_not_found'
    || ($response->get_headers()['Cache-Control'] ?? '') !== 'no-store') {
    throw new RuntimeException('Empty Product Configuration route did not fail closed.');
}

WP_CLI::line(wp_json_encode(
    array('routeRegistered' => true, 'emptyRouteStatus' => 404),
    JSON_PRETTY_PRINT
));
