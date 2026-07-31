<?php

defined('ABSPATH') || exit;

function gdhe_task019_request_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_task019_request_test(array $params): array
{
    $request = new WP_REST_Request('GET', '/gdhe/v1/product-configurations');
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

$cases = array(
    'unknown' => array(
        array('path' => '/products/fgd-x15-pvc/', 'meta_key' => 'private'),
        400,
        'gdhe_invalid_parameter',
    ),
    'locale' => array(
        array('path' => '/products/fgd-x15-pvc/', 'locale' => 'fr'),
        400,
        'gdhe_invalid_locale',
    ),
    'schema' => array(
        array('path' => '/products/fgd-x15-pvc/', 'schema' => '3.0.0'),
        400,
        'gdhe_invalid_schema',
    ),
    'path' => array(
        array('path' => '/products/FGD-X15-PVC/'),
        400,
        'gdhe_invalid_path',
    ),
    'missing-path' => array(
        array(),
        400,
        'gdhe_invalid_path',
    ),
);

foreach ($cases as $name => $case) {
    $result = gdhe_task019_request_test($case[0]);
    gdhe_task019_request_test_assert(
        $result['status'] === $case[1],
        'Product Configuration request closure is missing for ' . $name . '.'
    );
    gdhe_task019_request_test_assert(
        ($result['data']['code'] ?? '') === $case[2],
        'Product Configuration request error code drifted for ' . $name . '.'
    );
    gdhe_task019_request_test_assert(
        ($result['headers']['Cache-Control'] ?? '') === 'no-store',
        'Product Configuration request error is cacheable for ' . $name . '.'
    );
}

WP_CLI::line(wp_json_encode(array('requestNegativeCount' => count($cases)), JSON_PRETTY_PRINT));
