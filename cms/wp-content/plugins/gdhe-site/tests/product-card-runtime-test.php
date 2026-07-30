<?php

defined('ABSPATH') || exit;

function gdhe_product_card_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_product_card_test_request(array $params = array()): array
{
    $request = new WP_REST_Request('GET', '/gdhe/v1/product-cards');
    foreach ($params as $key => $value) {
        $request->set_param((string) $key, $value);
    }
    $response = rest_do_request($request);
    return array(
        'status' => (int) $response->get_status(),
        'data' => $response->get_data(),
        'headers' => $response->get_headers(),
    );
}

function gdhe_run_product_card_route_test(): array
{
    gdhe_product_card_test_assert(!is_user_logged_in(), 'ProductCard runtime test must be anonymous.');
    $routes = rest_get_server()->get_routes();
    gdhe_product_card_test_assert(
        isset($routes['/gdhe/v1/product-cards']),
        'Expected ProductCard route is not registered.'
    );

    $result = gdhe_product_card_test_request();
    gdhe_product_card_test_assert($result['status'] === 200, 'ProductCard empty collection did not return 200.');
    gdhe_product_card_test_assert(is_array($result['data']), 'ProductCard response was not an object.');
    gdhe_product_card_test_assert(($result['data']['schemaVersion'] ?? '') === '1.0.0', 'ProductCard Schema version drifted.');
    gdhe_product_card_test_assert(($result['data']['items'] ?? null) === array(), 'Pre-Fixture ProductCard collection was not empty.');
    gdhe_product_card_test_assert(($result['data']['total'] ?? -1) === 0, 'Pre-Fixture ProductCard total was not zero.');

    return array(
        'routeRegistered' => true,
        'emptyCollection' => true,
    );
}

WP_CLI::line(wp_json_encode(gdhe_run_product_card_route_test(), JSON_PRETTY_PRINT));
