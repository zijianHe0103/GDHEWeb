<?php

defined('ABSPATH') || exit;

function gdhe_a3_test_request(string $route, array $params = array(), array $headers = array()): array
{
    $request = new WP_REST_Request('GET', $route);
    foreach (array_keys($params) as $key) {
        call_user_func(array($request, 'set_param'), $key, $params[$key]);
    }
    foreach (array_keys($headers) as $key) {
        call_user_func(array($request, 'set_header'), $key, $headers[$key]);
    }
    $response = rest_do_request($request);
    $result = array();
    $result['status'] = (int) call_user_func(array($response, 'get_status'));
    $result['data'] = call_user_func(array($response, 'get_data'));
    $result['headers'] = call_user_func(array($response, 'get_headers'));
    return $result;
}

function gdhe_a3_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_a3_test_write_json(string $path, $value): void
{
    $encoded = wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded) || file_put_contents($path, $encoded . PHP_EOL) === false) {
        throw new RuntimeException('Could not write A3 test JSON: ' . $path);
    }
}

function gdhe_a3_test_error(string $route, array $params, int $status, string $code): array
{
    $result = gdhe_a3_test_request($route, $params);
    gdhe_a3_test_assert($result['status'] === $status, 'Unexpected A3 error status for ' . $code);
    gdhe_a3_test_assert(is_array($result['data']), 'A3 error body was not an object.');
    gdhe_a3_test_assert(($result['data']['code'] ?? '') === $code, 'Unexpected A3 error code.');
    foreach (array('apiVersion', 'message', 'status', 'requestId') as $key) {
        gdhe_a3_test_assert(isset($result['data'][$key]), 'A3 error envelope is incomplete.');
    }
    return $result;
}

function gdhe_a3_test_case(string $route, string $path = ''): array
{
    $params = array();
    if ($path !== '') {
        $params['path'] = $path;
    }
    return array($route, $params);
}

function gdhe_a3_run_contract_test(): array
{
    $manifest = get_option(GDHE_A3_FIXTURE_OPTION, array());
    gdhe_a3_test_assert(is_array($manifest) && isset($manifest['posts']['home']), 'A3 fixture manifest is missing.');
    gdhe_a3_test_assert(!is_user_logged_in(), 'A3 contract test must run anonymously.');
    $artifact_dir = dirname(ABSPATH) . '/TASKS/ARTIFACTS/TASK-007';
    $golden_dir = $artifact_dir . '/golden-a3';
    if (!is_dir($golden_dir) && !mkdir($golden_dir, 0775, true) && !is_dir($golden_dir)) {
        throw new RuntimeException('Could not create the A3 Golden directory.');
    }
    $cases = array();
    $cases['resolve-home.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/');
    $cases['resolve-company.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/company/');
    $cases['resolve-news.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/news/task-007-a3-product-update/');
    $cases['resolve-product-alpha.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/products/task-007-a3-flow-control-alpha/');
    $cases['resolve-product-beta.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/products/task-007-a3-flow-control-beta/');
    $cases['resolve-product-gamma.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/products/task-007-a3-flow-control-gamma/');
    $cases['resolve-market.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/markets/task-007-a3-controlled-water-systems/');
    $cases['resolve-reference.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/references/task-007-a3-coastal-research-facility/');
    $cases['resolve-support.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/support/configuration/task-007-a3-configure-flow-control/');
    $cases['resolve-download.json'] = gdhe_a3_test_case('/gdhe/v1/resolve', '/downloads/task-007-a3-flow-control-data-sheet/');
    $collection = array();
    $collection['filter'] = 'product_category:flow-control';
    $collection['sort'] = 'title_asc';
    $collection['per_page'] = 2;
    $collection['page'] = 1;
    $cases['collection-product-page-1.json'] = array('/gdhe/v1/collection/product', $collection);
    $collection['page'] = 2;
    $cases['collection-product-page-2.json'] = array('/gdhe/v1/collection/product', $collection);
    $collection['page'] = 3;
    $cases['collection-product-page-3-empty.json'] = array('/gdhe/v1/collection/product', $collection);
    $cases['navigation.json'] = gdhe_a3_test_case('/gdhe/v1/navigation');
    $cases['route-manifest.json'] = gdhe_a3_test_case('/gdhe/v1/route-manifest');

    $results = array();
    $hashes = array();
    foreach (array_keys($cases) as $filename) {
        $definition = $cases[$filename];
        $result = gdhe_a3_test_request($definition[0], $definition[1]);
        gdhe_a3_test_assert($result['status'] === 200, 'A3 positive request failed: ' . $filename);
        $encoded = strtolower((string) wp_json_encode($result['data']));
        foreach (array('acf', 'postmeta', 'site_settings', 'user_email', 'user_pass') as $forbidden) {
            gdhe_a3_test_assert(!str_contains($encoded, $forbidden), 'A3 anonymous leakage: ' . $forbidden);
        }
        $path = $golden_dir . '/' . $filename;
        gdhe_a3_test_write_json($path, $result['data']);
        $hashes[$filename] = hash_file('sha256', $path);
        $results[$filename] = $result;
    }
    $page_one = $results['collection-product-page-1.json']['data'];
    $page_two = $results['collection-product-page-2.json']['data'];
    $page_three = $results['collection-product-page-3-empty.json']['data'];
    gdhe_a3_test_assert(
        array($page_one['total'], $page_two['total'], $page_three['total']) === array(3, 3, 3),
        'A3 collection total is not invariant across pages.'
    );
    gdhe_a3_test_assert(
        array(count($page_one['items']), count($page_two['items']), count($page_three['items'])) === array(2, 1, 0),
        'A3 collection pages do not contain 2, 1 and 0 eligible items.'
    );
    $product = $results['resolve-product-alpha.json']['data'];
    gdhe_a3_test_assert(($product['details']['productCode'] ?? '') === 'FC-ALPHA', 'A3 product code was not normalized.');
    gdhe_a3_test_assert(
        str_starts_with((string) ($product['details']['videoUrl'] ?? ''), 'https://'),
        'A3 Product HTTPS video positive is missing.'
    );
    gdhe_a3_test_assert(count($product['relations']['markets'] ?? array()) === 1, 'A3 product-to-market relation is missing.');
    gdhe_a3_test_assert(count($product['relations']['references'] ?? array()) === 1, 'A3 product-to-reference relation is missing.');
    $market = $results['resolve-market.json']['data'];
    gdhe_a3_test_assert(count($market['relations']['products'] ?? array()) === 3, 'A3 market-to-product relation is missing.');
    $download = $results['resolve-download.json']['data'];
    gdhe_a3_test_assert(isset($download['details']['file']['id']), 'A3 public file DTO is missing.');
    gdhe_a3_test_assert(!isset($download['details']['file']['postId']), 'A3 file DTO leaked a database ID.');
    $company = $results['resolve-company.json']['data'];
    gdhe_a3_test_assert($company['type'] === 'page' && $company['publicPath'] === '/company/', 'A3 non-root Page positive drifted.');
    $news = $results['resolve-news.json']['data'];
    gdhe_a3_test_assert($news['type'] === 'post' && $news['publicPath'] === '/news/task-007-a3-product-update/', 'A3 native Post positive drifted.');
    $route_json = (string) wp_json_encode($results['route-manifest.json']['data'], JSON_UNESCAPED_SLASHES);
    gdhe_a3_test_assert(str_contains($route_json, '/company/'), 'A3 route manifest omitted the non-root Page.');
    gdhe_a3_test_assert(str_contains($route_json, '/news/task-007-a3-product-update/'), 'A3 route manifest omitted the native Post.');
    $support = $results['resolve-support.json']['data'];
    gdhe_a3_test_assert(
        str_starts_with((string) ($support['details']['videoUrl'] ?? ''), 'https://'),
        'A3 Support HTTPS video positive is missing.'
    );
    $reference_json = strtolower((string) wp_json_encode($results['resolve-reference.json']['data']));
    gdhe_a3_test_assert(str_contains($reference_json, 'solutionsafehtml'), 'A3 safe HTML authority is missing.');
    foreach (array('<script', 'onclick=', 'javascript:') as $unsafe) {
        gdhe_a3_test_assert(!str_contains($reference_json, $unsafe), 'Unsafe A3 HTML survived normalization.');
    }
    foreach (array('invalid_template', 'mismatched_template', 'invalid_module', 'invalid_path') as $key) {
        $envelope = gdhe_build_content_envelope(get_post((int) $manifest['posts'][$key]));
        gdhe_a3_test_assert(is_wp_error($envelope), 'A3 collection negative unexpectedly passed: ' . $key);
    }
    $mismatched_path = '/products/task-007-a3-mismatched-template/';
    foreach (array($page_one, $page_two, $page_three) as $collection_page) {
        gdhe_a3_test_assert(
            !str_contains((string) wp_json_encode($collection_page), $mismatched_path),
            'Known template mismatch entered the Product collection.'
        );
    }
    gdhe_a3_test_assert(
        !str_contains((string) wp_json_encode($results['navigation.json']['data']), $mismatched_path),
        'Known template mismatch entered navigation.'
    );
    gdhe_a3_test_assert(
        !str_contains((string) wp_json_encode($results['route-manifest.json']['data']), $mismatched_path),
        'Known template mismatch entered the route manifest.'
    );
    $negative = array();
    $publication_paths = array();
    $publication_paths['draft'] = '/products/task-007-a3-draft-product/';
    $publication_paths['private'] = '/products/task-007-a3-private-product/';
    $publication_paths['pending'] = '/products/task-007-a3-pending-product/';
    $publication_paths['trash'] = '/products/task-007-a3-trashed-product/';
    foreach (array_keys($publication_paths) as $status) {
        $params = array();
        $params['path'] = $publication_paths[$status];
        $error = gdhe_a3_test_error('/gdhe/v1/resolve', $params, 404, 'gdhe_not_found');
        $negative['publication-' . $status] = $error['data']['code'];
    }
    $params = array();
    $params['path'] = $mismatched_path;
    $negative['known-template-mismatch'] = gdhe_a3_test_error(
        '/gdhe/v1/resolve',
        $params,
        500,
        'gdhe_contract_invariant'
    )['data']['code'];
    $params = array();
    $params['path'] = '/products/task-007-a3-does-not-exist/';
    $negative['nonexistent'] = gdhe_a3_test_error('/gdhe/v1/resolve', $params, 404, 'gdhe_not_found')['data']['code'];
    $params['locale'] = 'fr';
    $negative['locale'] = gdhe_a3_test_error('/gdhe/v1/resolve', $params, 400, 'gdhe_invalid_locale')['data']['code'];
    $params = array();
    $params['path'] = '//invalid/';
    $negative['path'] = gdhe_a3_test_error('/gdhe/v1/resolve', $params, 400, 'gdhe_invalid_path')['data']['code'];
    $params = array();
    $params['path'] = '/';
    $params['schema'] = '9.9.9';
    $negative['schema'] = gdhe_a3_test_error('/gdhe/v1/resolve', $params, 400, 'gdhe_invalid_schema')['data']['code'];
    $negative['type'] = gdhe_a3_test_error('/gdhe/v1/collection/page', array(), 400, 'gdhe_invalid_collection_type')['data']['code'];
    $params = array();
    $params['filter'] = 'support_topic:bad';
    $negative['filter'] = gdhe_a3_test_error('/gdhe/v1/collection/product', $params, 400, 'gdhe_invalid_filter')['data']['code'];
    $params = array();
    $params['sort'] = 'random';
    $negative['sort'] = gdhe_a3_test_error('/gdhe/v1/collection/product', $params, 400, 'gdhe_invalid_sort')['data']['code'];
    $params = array();
    $params['page'] = 0;
    $negative['page'] = gdhe_a3_test_error('/gdhe/v1/collection/product', $params, 400, 'gdhe_invalid_pagination')['data']['code'];
    $header_fixtures = array();
    foreach (array_keys($cases) as $filename) {
        if (!in_array($filename, array('resolve-home.json', 'collection-product-page-1.json', 'navigation.json', 'route-manifest.json'), true)) {
            continue;
        }
        $result = $results[$filename];
        $etag = (string) ($result['headers']['ETag'] ?? '');
        gdhe_a3_test_assert($etag !== '', 'A3 response did not emit ETag: ' . $filename);
        gdhe_a3_test_assert(($result['headers']['Cache-Control'] ?? '') === 'public, max-age=60', 'A3 cache header drifted.');
        gdhe_a3_test_assert(isset($result['headers']['X-GDHE-Request-ID']), 'A3 request ID header is missing.');
        $fixture = array();
        $fixture['status'] = $result['status'];
        $fixture['cacheControl'] = $result['headers']['Cache-Control'];
        $fixture['etagPresent'] = true;
        $fixture['requestIdPresent'] = true;
        $header_fixtures[$filename] = $fixture;
    }
    $conditional_headers = array();
    $conditional_headers['If-None-Match'] = $results['resolve-home.json']['headers']['ETag'];
    $conditional_params = array();
    $conditional_params['path'] = '/';
    $conditional = gdhe_a3_test_request('/gdhe/v1/resolve', $conditional_params, $conditional_headers);
    gdhe_a3_test_assert($conditional['status'] === 304, 'A3 conditional request did not return 304.');
    $conditional_fixture = array();
    $conditional_fixture['status'] = 304;
    $conditional_fixture['etagPresent'] = true;
    $header_fixtures['conditionalResolve'] = $conditional_fixture;

    $summary = array();
    $summary['fixtureVersion'] = GDHE_A3_FIXTURE_VERSION;
    $summary['schemaVersion'] = GDHE_SCHEMA_VERSION;
    $summary['goldenChecksums'] = $hashes;
    $summary['collectionTotals'] = array($page_one['total'], $page_two['total'], $page_three['total']);
    $summary['collectionItemCounts'] = array(count($page_one['items']), count($page_two['items']), count($page_three['items']));
    $summary['negativeMatrix'] = $negative;
    $summary['fileDto'] = $download['details']['file'];
    gdhe_a3_test_write_json($artifact_dir . '/A3_CONTRACT_RUNTIME_SUMMARY.json', $summary);
    gdhe_a3_test_write_json($artifact_dir . '/A3_HEADER_FIXTURES.json', $header_fixtures);
    return $summary;
}

$a3_result = gdhe_a3_run_contract_test();
WP_CLI::line(wp_json_encode($a3_result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
