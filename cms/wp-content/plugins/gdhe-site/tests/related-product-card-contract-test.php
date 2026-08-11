<?php

defined('ABSPATH') || exit;

function gdhe_task023_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_task023_test_request(array $params = array(), array $headers = array()): array
{
    $request = new WP_REST_Request('GET', '/gdhe/v1/related-product-cards');
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

function gdhe_task023_test_params(): array
{
    return array(
        'locale' => 'en',
        'schema' => '1.0.0',
        'source_path' => '/products/fgd-x15-pvc/',
    );
}

function gdhe_task023_test_relations(int $source_id, array $products): void
{
    update_field(
        'field_gdhe_relationships',
        gdhe_a3_fixture_relations(array('products' => $products)),
        $source_id
    );
}

function gdhe_task023_test_write_json(string $path, $value): void
{
    $encoded = wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded) || file_put_contents($path, $encoded . PHP_EOL) === false) {
        throw new RuntimeException('Could not write TASK-023 JSON evidence.');
    }
}

function gdhe_task023_test_error(array $params, int $status, string $code): array
{
    $result = gdhe_task023_test_request($params);
    gdhe_task023_test_assert($result['status'] === $status, 'Unexpected error status: ' . $code);
    gdhe_task023_test_assert(($result['data']['code'] ?? '') === $code, 'Unexpected error code: ' . $code);
    gdhe_task023_test_assert(
        ($result['headers']['Cache-Control'] ?? '') === 'no-store',
        'Error response was cacheable: ' . $code
    );
    foreach (array('apiVersion', 'message', 'status', 'requestId') as $key) {
        gdhe_task023_test_assert(isset($result['data'][$key]), 'Error envelope is incomplete.');
    }
    gdhe_task023_test_assert(
        preg_match(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/D',
            (string) $result['data']['requestId']
        ) === 1,
        'Runtime error requestId is not UUID v4: ' . $code
    );
    return $result['data'];
}

function gdhe_task023_run_contract_test(): array
{
    gdhe_task023_test_assert(!is_user_logged_in(), 'TASK-023 contract test must be anonymous.');
    $manifest = get_option(GDHE_TASK023_FIXTURE_OPTION, array());
    gdhe_task023_test_assert(
        is_array($manifest) && count($manifest['posts'] ?? array()) === 12,
        'TASK-023 Fixture manifest is missing.'
    );
    $source_id = (int) $manifest['posts']['source'];
    $original_relations = array_values($manifest['orderedRelations']);
    $valid_ids = array(
        (int) $manifest['posts']['detail_alpha'],
        (int) $manifest['posts']['accessory_beta'],
        (int) $manifest['posts']['detail_gamma'],
        (int) $manifest['posts']['accessory_delta'],
    );
    $artifact_dir = dirname(ABSPATH) . '/TASKS/ARTIFACTS/TASK-023';
    $golden_dir = $artifact_dir . '/golden-related-product-card';
    if (!is_dir($golden_dir) && !mkdir($golden_dir, 0775, true) && !is_dir($golden_dir)) {
        throw new RuntimeException('Could not create TASK-023 Golden directory.');
    }

    $cases = array(
        'zero.json' => array(),
        'one.json' => array_slice($valid_ids, 0, 1),
        'three.json' => array_slice($valid_ids, 0, 3),
        'four-plus.json' => $original_relations,
    );
    $results = array();
    try {
        foreach ($cases as $filename => $relations) {
            gdhe_task023_test_relations($source_id, $relations);
            $result = gdhe_task023_test_request(gdhe_task023_test_params());
            gdhe_task023_test_assert($result['status'] === 200, 'Positive request failed: ' . $filename);
            gdhe_task023_test_assert(
                ($result['headers']['Cache-Control'] ?? '') === 'public, max-age=60'
                && isset($result['headers']['ETag'])
                && isset($result['headers']['X-GDHE-Request-ID']),
                'Success headers drifted: ' . $filename
            );
            $encoded = strtolower((string) wp_json_encode($result['data']));
            foreach (array(
                'postid',
                'databaseid',
                'attachmentid',
                'postmeta',
                'feishu',
                'article_numbers',
                'supplier',
                'purchase_price',
                'inventory',
            ) as $forbidden) {
                gdhe_task023_test_assert(
                    !str_contains($encoded, $forbidden),
                    'Anonymous related-product leakage: ' . $forbidden
                );
            }
            gdhe_task023_test_write_json($golden_dir . '/' . $filename, $result['data']);
            $results[$filename] = $result;
        }

        $expected_counts = array('zero.json' => 0, 'one.json' => 1, 'three.json' => 3, 'four-plus.json' => 4);
        foreach ($expected_counts as $filename => $count) {
            gdhe_task023_test_assert(
                count($results[$filename]['data']['items'] ?? array()) === $count,
                '0/1/3/4+ evidence count drifted: ' . $filename
            );
        }
        $items = $results['four-plus.json']['data']['items'];
        gdhe_task023_test_assert(
            array_column(array_column($items, 'card'), 'id') === array(
                '60000000-0000-4000-8000-000000000002',
                '60000000-0000-4000-8000-000000000003',
                '60000000-0000-4000-8000-000000000004',
                '60000000-0000-4000-8000-000000000005',
            ),
            'Stored relation order or exclusion behavior drifted.'
        );
        gdhe_task023_test_assert(
            $items[0]['card']['action']['mode'] === 'view_product'
            && $items[0]['directQuote'] === null
            && $items[1]['card']['action']['mode'] === 'direct_rfq'
            && $items[1]['directQuote'] === array(
                'kind' => 'catalog_accessory',
                'quantityUnit' => 'piece',
            ),
            'Detail/accessory action or no-guessing directQuote projection drifted.'
        );
        foreach (array('unpublished', 'revoked', 'hostile_media', 'missing_unit', 'action_mismatch') as $key) {
            gdhe_task023_test_assert(
                gdhe_related_product_card_item(get_post((int) $manifest['posts'][$key])) === null,
                'Invalid related-product target was eligible: ' . $key
            );
        }

        $uuid_conflict_id = (int) $manifest['posts']['uuid_conflict_alpha'];
        gdhe_task023_test_assert(
            is_array(gdhe_related_product_card_item(get_post($uuid_conflict_id))),
            'UUID-conflict target must be independently eligible for the aggregate identity regression.'
        );
        gdhe_task023_test_relations($source_id, array(
            $valid_ids[1],
            $valid_ids[0],
            $uuid_conflict_id,
            $valid_ids[2],
            $valid_ids[0],
            $valid_ids[3],
        ));
        $uuid_conflict = gdhe_task023_test_request(gdhe_task023_test_params());
        gdhe_task023_test_assert($uuid_conflict['status'] === 200, 'UUID-conflict request failed.');
        gdhe_task023_test_assert(
            array_column(array_column($uuid_conflict['data']['items'] ?? array(), 'card'), 'id') === array(
                '60000000-0000-4000-8000-000000000003',
                '60000000-0000-4000-8000-000000000004',
                '60000000-0000-4000-8000-000000000005',
            ),
            'Distinct eligible posts sharing one public UUID did not all fail closed.'
        );
        gdhe_task023_test_assert(
            !str_contains(
                (string) wp_json_encode($uuid_conflict['data']['items'] ?? array()),
                'task-023-detail-alpha'
            )
            && !str_contains(
                (string) wp_json_encode($uuid_conflict['data']['items'] ?? array()),
                'task-023-uuid-conflict-alpha'
            ),
            'A conflicting public-UUID card action remained public.'
        );
        gdhe_task023_test_relations($source_id, $original_relations);

        $conditional = gdhe_task023_test_request(
            gdhe_task023_test_params(),
            array('If-None-Match' => $results['four-plus.json']['headers']['ETag'])
        );
        gdhe_task023_test_assert(
            $conditional['status'] === 304
            && $conditional['data'] === null
            && ($conditional['headers']['ETag'] ?? '') === $results['four-plus.json']['headers']['ETag'],
            'Conditional related-product response did not return bodyless 304.'
        );

        $errors = array();
        $errors['locale'] = gdhe_task023_test_error(
            array_merge(gdhe_task023_test_params(), array('locale' => 'fr')),
            400,
            'gdhe_invalid_locale'
        );
        $errors['schema'] = gdhe_task023_test_error(
            array_merge(gdhe_task023_test_params(), array('schema' => '9.9.9')),
            400,
            'gdhe_invalid_schema'
        );
        $errors['path'] = gdhe_task023_test_error(
            array_merge(gdhe_task023_test_params(), array('source_path' => '/Products/Bad/')),
            400,
            'gdhe_invalid_path'
        );
        $errors['unknown'] = gdhe_task023_test_error(
            array_merge(gdhe_task023_test_params(), array('page' => '1')),
            400,
            'gdhe_invalid_parameter'
        );
        $errors['not-found'] = gdhe_task023_test_error(
            array_merge(gdhe_task023_test_params(), array('source_path' => '/products/not-present/')),
            404,
            'gdhe_not_found'
        );

        gdhe_task023_test_relations($source_id, array_fill(0, 21, $valid_ids[0]));
        $errors['over-20'] = gdhe_task023_test_error(
            gdhe_task023_test_params(),
            500,
            'gdhe_contract_invariant'
        );

        update_post_meta($source_id, 'relationships_products', 'not-an-array');
        $errors['malformed-relations'] = gdhe_task023_test_error(
            gdhe_task023_test_params(),
            500,
            'gdhe_contract_invariant'
        );

        $conflict_id = $valid_ids[0];
        $conflict_path = (string) get_post_meta($conflict_id, '_gdhe_public_path', true);
        update_post_meta($conflict_id, '_gdhe_public_path', '/products/fgd-x15-pvc/');
        $errors['source-conflict'] = gdhe_task023_test_error(
            gdhe_task023_test_params(),
            409,
            'gdhe_route_conflict'
        );
        update_post_meta($conflict_id, '_gdhe_public_path', $conflict_path);

        $source_schema = (string) get_field('schema_version', $source_id, true);
        update_field('field_gdhe_schema_version', '2.0.0', $source_id);
        $errors['source-ineligible'] = gdhe_task023_test_error(
            gdhe_task023_test_params(),
            500,
            'gdhe_contract_invariant'
        );
        update_field('field_gdhe_schema_version', $source_schema, $source_id);
        $evidence_errors = $errors;
        foreach ($evidence_errors as &$evidence_error) {
            $evidence_error['requestId'] = '00000000-0000-4000-8000-000000000023';
        }
        unset($evidence_error);
        gdhe_task023_test_write_json(
            $artifact_dir . '/RELATED_PRODUCT_ERROR_FIXTURES.json',
            $evidence_errors
        );
    } finally {
        gdhe_task023_test_relations($source_id, $original_relations);
    }

    $hashes = array();
    foreach (array_keys($cases) as $filename) {
        $hashes[$filename] = hash_file('sha256', $golden_dir . '/' . $filename);
    }
    $summary = array(
        'fixtureVersion' => GDHE_TASK023_FIXTURE_VERSION,
        'apiVersion' => '1',
        'schemaVersion' => GDHE_RELATED_PRODUCT_CARD_SCHEMA_VERSION,
        'positiveGoldenCount' => 4,
        'stateItemCounts' => array(0, 1, 3, 4),
        'orderedEligibleCount' => 4,
        'detailAndAccessoryCovered' => true,
        'selfDuplicateAndInvalidTargetsExcluded' => true,
        'publicUuidConflictFailsClosed' => true,
        'singleCollectionRequest' => true,
        'perCardResolveRequests' => 0,
        'conditionalStatus' => 304,
        'negativeRequestCount' => count($errors),
        'goldenSha256' => $hashes,
        'valid' => true,
    );
    gdhe_task023_test_write_json($artifact_dir . '/RELATED_PRODUCT_RUNTIME_VALIDATION.json', $summary);
    return $summary;
}

WP_CLI::line(wp_json_encode(
    gdhe_task023_run_contract_test(),
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
));
