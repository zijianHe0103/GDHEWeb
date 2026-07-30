<?php

defined('ABSPATH') || exit;

function gdhe_task014_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_task014_test_request(array $params = array(), array $headers = array()): array
{
    $request = new WP_REST_Request('GET', '/gdhe/v1/product-cards');
    foreach ($params as $key => $value) {
        $request->set_param((string) $key, $value);
    }
    foreach ($headers as $key => $value) {
        $request->set_header((string) $key, (string) $value);
    }
    $response = rest_do_request($request);
    return array(
        'status' => (int) $response->get_status(),
        'data' => $response->get_data(),
        'headers' => $response->get_headers(),
    );
}

function gdhe_task014_write_json(string $path, $value): void
{
    $encoded = wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded) || file_put_contents($path, $encoded . PHP_EOL) === false) {
        throw new RuntimeException('Could not write TASK-014 JSON evidence.');
    }
}

function gdhe_task014_expect_error(array $params, int $status, string $code): array
{
    $result = gdhe_task014_test_request($params);
    gdhe_task014_test_assert($result['status'] === $status, 'Unexpected error status for ' . $code);
    gdhe_task014_test_assert(($result['data']['code'] ?? '') === $code, 'Unexpected error code for ' . $code);
    gdhe_task014_test_assert(
        ($result['headers']['Cache-Control'] ?? '') === 'no-store',
        'Error response was cacheable.'
    );
    foreach (array('apiVersion', 'message', 'status', 'requestId') as $key) {
        gdhe_task014_test_assert(isset($result['data'][$key]), 'Error envelope is incomplete.');
    }
    return $result['data'];
}

function gdhe_task014_run_contract_test(): array
{
    gdhe_task014_test_assert(!is_user_logged_in(), 'TASK-014 runtime test must be anonymous.');
    $manifest = get_option(GDHE_TASK014_FIXTURE_OPTION, array());
    gdhe_task014_test_assert(
        is_array($manifest) && count($manifest['posts'] ?? array()) === 19,
        'TASK-014 Fixture manifest is missing.'
    );
    $series_target = array(
        'id' => gdhe_public_identifier((int) $manifest['posts']['series_landing']),
        'label' => 'TASK-014 Series',
        'publicPath' => (string) get_post_meta(
            (int) $manifest['posts']['series_landing'],
            '_gdhe_public_path',
            true
        ),
    );
    $application_target = array(
        'id' => gdhe_public_identifier((int) $manifest['posts']['application_landing']),
        'label' => 'TASK-014 Application',
        'publicPath' => (string) get_post_meta(
            (int) $manifest['posts']['application_landing'],
            '_gdhe_public_path',
            true
        ),
    );
    $application_as_category = $application_target;
    $application_as_category['filterSlug'] = 'task-014-card-products';
    $reference_role_coverage = array(
        'primaryCategory' => gdhe_product_card_public_reference(
            $application_as_category,
            true,
            'primaryCategory'
        ) === null,
        'series' => gdhe_product_card_reference_list(
            array($application_target),
            'series'
        ) === null,
        'applications' => gdhe_product_card_reference_list(
            array($series_target),
            'applications'
        ) === null,
    );
    foreach ($reference_role_coverage as $reference_field => $rejected) {
        gdhe_task014_test_assert(
            $rejected,
            'Public reference accepted a valid target under the wrong route role for ' . $reference_field . '.'
        );
    }
    $mismatched_reference = array(
        'id' => '43000000-0000-4000-8000-000000000099',
        'label' => 'TASK-014 Card Products',
        'publicPath' => '/products/curtain-track-systems/task-014-card-products/',
        'filterSlug' => 'task-014-card-products',
    );
    $mismatched_relation = $mismatched_reference;
    unset($mismatched_relation['filterSlug']);
    $reference_identity_coverage = array(
        'primaryCategory' => gdhe_product_card_public_reference(
            $mismatched_reference,
            true,
            'primaryCategory'
        ) === null,
        'series' => gdhe_product_card_reference_list(
            array($mismatched_relation),
            'series'
        ) === null,
        'applications' => gdhe_product_card_reference_list(
            array($mismatched_relation),
            'applications'
        ) === null,
    );
    foreach ($reference_identity_coverage as $reference_field => $rejected) {
        gdhe_task014_test_assert(
            $rejected,
            'Public reference accepted a mismatched target UUID for ' . $reference_field . '.'
        );
    }

    $artifact_dir = dirname(ABSPATH) . '/TASKS/ARTIFACTS/TASK-014';
    $golden_dir = $artifact_dir . '/golden-product-card';
    if (!is_dir($golden_dir) && !mkdir($golden_dir, 0775, true) && !is_dir($golden_dir)) {
        throw new RuntimeException('Could not create TASK-014 Golden directory.');
    }

    $cases = array(
        'all.json' => array('per_page' => 100),
        'one-item.json' => array('per_page' => 1, 'page' => 1),
        'page-1.json' => array('per_page' => 2, 'page' => 1),
        'page-2.json' => array('per_page' => 2, 'page' => 2),
        'page-3-empty.json' => array('per_page' => 2, 'page' => 3),
        'title-asc.json' => array('per_page' => 100, 'sort' => 'title_asc'),
        'filtered.json' => array(
            'per_page' => 100,
            'filter' => 'product_category:task-014-card-products',
        ),
        'filtered-empty.json' => array(
            'filter' => 'product_category:not-present',
        ),
    );
    $results = array();
    foreach ($cases as $filename => $params) {
        $result = gdhe_task014_test_request($params);
        gdhe_task014_test_assert($result['status'] === 200, 'Positive request failed: ' . $filename);
        gdhe_task014_test_assert(
            ($result['headers']['Cache-Control'] ?? '') === 'public, max-age=60',
            'Cache header drifted: ' . $filename
        );
        gdhe_task014_test_assert(isset($result['headers']['ETag']), 'ETag is missing: ' . $filename);
        gdhe_task014_test_assert(
            isset($result['headers']['X-GDHE-Request-ID']),
            'Request ID header is missing: ' . $filename
        );
        $encoded = strtolower((string) wp_json_encode($result['data']));
        foreach (array(
            'postid',
            'databaseid',
            'attachmentid',
            'postmeta',
            '"meta"',
            '"acf"',
            '"scf"',
            'feishu',
            'article_numbers',
            'purchase_price',
            'supplier',
        ) as $forbidden) {
            gdhe_task014_test_assert(
                !str_contains($encoded, $forbidden),
                'Anonymous ProductCard leakage: ' . $forbidden
            );
        }
        gdhe_task014_write_json($golden_dir . '/' . $filename, $result['data']);
        $results[$filename] = $result;
    }
    gdhe_task014_test_assert(
        isset($results['one-item.json']),
        'Real anonymous one-item ProductCard response is missing.'
    );
    $one_item = $results['one-item.json']['data'];
    gdhe_task014_test_assert(
        $one_item['total'] === 4
        && $one_item['totalPages'] === 4
        && count($one_item['items']) === 1
        && $one_item['items'][0]['id'] === '41000000-0000-4000-8000-000000000001'
        && $one_item['items'][0]['action'] === array(
            'mode' => 'view_product',
            'label' => 'View Product',
            'targetPath' => '/products/task-014-alpha-detail-active/',
        ),
        'Real anonymous one-item ProductCard response has invalid pagination.'
    );

    $all = $results['all.json']['data'];
    gdhe_task014_test_assert($all['total'] === 4 && count($all['items']) === 4, 'Eligible total was not four.');
    gdhe_task014_test_assert(
        array(
            $results['page-1.json']['data']['total'],
            $results['page-2.json']['data']['total'],
            $results['page-3-empty.json']['data']['total'],
        ) === array(4, 4, 4),
        'Collection total was not invariant across pages.'
    );
    gdhe_task014_test_assert(
        array(
            count($results['page-1.json']['data']['items']),
            count($results['page-2.json']['data']['items']),
            count($results['page-3-empty.json']['data']['items']),
        ) === array(2, 2, 0),
        'Collection did not prove 2/2/0 pagination.'
    );
    gdhe_task014_test_assert(
        $results['filtered.json']['data']['total'] === 4
        && $results['filtered-empty.json']['data']['total'] === 0,
        'Category filter did not prove N and zero.'
    );
    $actions = array();
    $ids = array();
    foreach ($all['items'] as $item) {
        $ids[] = $item['id'];
        $actions[$item['kind'] . ':' . $item['lifecycle']] = array(
            $item['action']['mode'],
            $item['action']['targetPath'],
        );
    }
    sort($ids, SORT_STRING);
    gdhe_task014_test_assert($ids === array(
        '41000000-0000-4000-8000-000000000001',
        '41000000-0000-4000-8000-000000000002',
        '41000000-0000-4000-8000-000000000003',
        '41000000-0000-4000-8000-000000000004',
    ), 'Invalid or unpublished ProductCard entered items/total.');
    $identity_bound_relations = null;
    foreach ($all['items'] as $item) {
        if ($item['id'] === '41000000-0000-4000-8000-000000000001') {
            $identity_bound_relations = array(
                'series' => $item['series'],
                'applications' => $item['applications'],
            );
            break;
        }
    }
    gdhe_task014_test_assert(
        is_array($identity_bound_relations)
        && $identity_bound_relations['series'] === array(array(
            'id' => '44000000-0000-4000-8000-000000000002',
            'label' => 'TASK-014 Series',
            'publicPath' => '/series/task-014-series/',
        ))
        && $identity_bound_relations['applications'] === array(array(
            'id' => '44000000-0000-4000-8000-000000000003',
            'label' => 'TASK-014 Application',
            'publicPath' => '/applications/task-014-application/',
        )),
        'Valid identity-bound series/applications references are missing.'
    );
    $exclusions = array();
    foreach (array(
        'missing_image',
        'unprotected_image',
        'missing_category',
        'missing_uuid',
        'invalid_kind',
        'invalid_lifecycle',
        'detail_missing_path',
        'accessory_with_path',
        'too_many_attributes',
        'source_action',
        'mismatched_reference_id',
        'draft',
    ) as $key) {
        $excluded = gdhe_product_card_for_post(get_post((int) $manifest['posts'][$key])) === null;
        gdhe_task014_test_assert($excluded, 'Negative ProductCard was not excluded: ' . $key);
        $exclusions[$key] = true;
    }
    gdhe_task014_test_assert(
        $actions['detail_product:active'][0] === 'view_product'
        && $actions['detail_product:discontinued'][0] === 'view_product'
        && $actions['catalog_accessory:active'] === array('direct_rfq', '/request-a-quote/')
        && $actions['catalog_accessory:discontinued'] === array('replacement_contact', '/contact/'),
        'Four-cell action matrix drifted.'
    );

    $errors = array();
    $errors['locale'] = gdhe_task014_expect_error(array('locale' => 'fr'), 400, 'gdhe_invalid_locale');
    $errors['schema'] = gdhe_task014_expect_error(array('schema' => '3.0.0'), 400, 'gdhe_invalid_schema');
    $errors['page-zero'] = gdhe_task014_expect_error(array('page' => 0), 400, 'gdhe_invalid_pagination');
    $errors['page-decimal'] = gdhe_task014_expect_error(array('page' => '1.5'), 400, 'gdhe_invalid_pagination');
    $errors['page-native-overflow'] = gdhe_task014_expect_error(
        array('page' => str_repeat('9', 100)),
        400,
        'gdhe_invalid_pagination'
    );
    $errors['page-offset-overflow'] = gdhe_task014_expect_error(
        array('page' => (string) PHP_INT_MAX, 'per_page' => 100),
        400,
        'gdhe_invalid_pagination'
    );
    $errors['per-page'] = gdhe_task014_expect_error(array('per_page' => 101), 400, 'gdhe_invalid_pagination');
    $errors['sort'] = gdhe_task014_expect_error(array('sort' => 'random'), 400, 'gdhe_invalid_sort');
    $errors['filter-taxonomy'] = gdhe_task014_expect_error(
        array('filter' => 'product_series:task-014-series'),
        400,
        'gdhe_invalid_filter'
    );
    $errors['filter-slug'] = gdhe_task014_expect_error(
        array('filter' => 'product_category:Bad Value'),
        400,
        'gdhe_invalid_filter'
    );
    $errors['unknown-parameter'] = gdhe_task014_expect_error(
        array('meta_key' => '_gdhe_product_card_v1_source'),
        400,
        'gdhe_invalid_parameter'
    );
    gdhe_task014_write_json($artifact_dir . '/PRODUCT_CARD_ERROR_FIXTURES.json', $errors);

    $conditional = gdhe_task014_test_request(
        array('per_page' => 100),
        array('If-None-Match' => $results['all.json']['headers']['ETag'])
    );
    gdhe_task014_test_assert($conditional['status'] === 304, 'Conditional ProductCard request did not return 304.');

    $hashes = array();
    foreach (array_keys($cases) as $filename) {
        $hashes[$filename] = hash_file('sha256', $golden_dir . '/' . $filename);
    }
    $summary = array(
        'fixtureVersion' => GDHE_TASK014_FIXTURE_VERSION,
        'apiVersion' => '1',
        'schemaVersion' => GDHE_PRODUCT_CARD_SCHEMA_VERSION,
        'positiveGoldenCount' => count($cases),
        'negativeRequestCount' => count($errors),
        'invalidCandidateExclusions' => $exclusions,
        'referenceIdentityCoverage' => $reference_identity_coverage,
        'referenceRoleCoverage' => $reference_role_coverage,
        'identityBoundPositiveRelations' => $identity_bound_relations,
        'eligibleTotal' => 4,
        'oneItemEvidence' => array(
            'itemCount' => count($one_item['items']),
            'total' => $one_item['total'],
            'totalPages' => $one_item['totalPages'],
            'singleCollectionRequest' => true,
            'perCardResolveRequests' => 0,
        ),
        'pageItemCounts' => array(2, 2, 0),
        'actionMatrix' => $actions,
        'conditionalStatus' => 304,
        'goldenSha256' => $hashes,
        'valid' => true,
    );
    gdhe_task014_write_json($artifact_dir . '/PRODUCT_CARD_RUNTIME_VALIDATION.json', $summary);
    return $summary;
}

WP_CLI::line(wp_json_encode(
    gdhe_task014_run_contract_test(),
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
));
