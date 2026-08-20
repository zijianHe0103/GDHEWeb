<?php

defined('ABSPATH') || exit;

function gdhe_task019_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_task019_test_request(array $params = array(), array $headers = array()): array
{
    $request = new WP_REST_Request('GET', '/gdhe/v1/product-configurations');
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

function gdhe_task019_write_json(string $path, $value): void
{
    $encoded = wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded) || file_put_contents($path, $encoded . PHP_EOL) === false) {
        throw new RuntimeException('Could not write TASK-019 JSON evidence.');
    }
}

function gdhe_task019_normalized_error(array $result): array
{
    gdhe_task019_test_assert(
        gdhe_is_uuid_v4((string) ($result['data']['requestId'] ?? '')),
        'Error request ID is not UUIDv4.'
    );
    $body = $result['data'];
    $body['requestId'] = '<uuid-v4>';
    return $body;
}

function gdhe_task019_create_shared_choice_product()
{
    $post_id = gdhe_task019_create_product(
        'shared-choice-distinct-product',
        'publish',
        'valid',
        29
    );
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    $source = gdhe_task019_valid_source();
    $source['sourceClass'] = 'production';
    $source['product'] = array(
        'id' => '17000000-0000-4000-8000-000000000002',
        'model' => 'TASK-019 Shared Choice',
        'name' => 'TASK-019 Shared Choice Track',
        'publicPath' => '/products/task-019-shared-choice/',
        'productKind' => 'curtain_track',
        'quantityUnit' => 'piece',
    );
    $source['articleNumberOptions'][0]['articleNumber'] = 'GDHEPRD000173';
    $updated = wp_update_post(array(
        'ID' => $post_id,
        'post_title' => $source['product']['name'],
    ), true);
    if (is_wp_error($updated)) {
        wp_delete_post($post_id, true);
        return $updated;
    }
    update_post_meta($post_id, '_gdhe_public_id', $source['product']['id']);
    update_post_meta($post_id, '_gdhe_public_path', $source['product']['publicPath']);
    update_post_meta($post_id, 'product_details', array('model' => $source['product']['model']));
    update_post_meta(
        $post_id,
        GDHE_PRODUCT_CONFIGURATION_SOURCE_META,
        wp_json_encode($source, JSON_UNESCAPED_SLASHES)
    );
    return $post_id;
}

function gdhe_task019_create_conflicting_identity_product()
{
    $post_id = gdhe_task019_create_product(
        'conflicting-stable-identity',
        'publish',
        'valid',
        30
    );
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    $source = gdhe_task019_valid_source();
    $source['sourceClass'] = 'production';
    $source['product']['model'] = 'TASK-019 Conflicting Identity';
    $source['product']['name'] = 'TASK-019 Conflicting Identity Track';
    $source['product']['publicPath'] = '/products/task-019-conflicting-identity/';
    $source['articleNumberOptions'][0]['articleNumber'] = 'GDHEPRD000174';
    $source['articleNumberOptions'][0]['lengthMeters'] = 5;
    $updated = wp_update_post(array(
        'ID' => $post_id,
        'post_title' => $source['product']['name'],
    ), true);
    if (is_wp_error($updated)) {
        wp_delete_post($post_id, true);
        return $updated;
    }
    update_post_meta($post_id, '_gdhe_public_path', $source['product']['publicPath']);
    update_post_meta($post_id, 'product_details', array('model' => $source['product']['model']));
    update_post_meta(
        $post_id,
        GDHE_PRODUCT_CONFIGURATION_SOURCE_META,
        wp_json_encode($source, JSON_UNESCAPED_SLASHES)
    );
    return $post_id;
}

function gdhe_task019_run_contract_test(): array
{
    gdhe_task019_test_assert(!is_user_logged_in(), 'TASK-019 runtime test must be anonymous.');
    $manifest = get_option(GDHE_TASK019_FIXTURE_OPTION, array());
    gdhe_task019_test_assert(
        is_array($manifest) && count($manifest['posts'] ?? array()) === 13,
        'TASK-019 Fixture manifest is missing.'
    );
    $params = array(
        'locale' => 'en',
        'schema' => '1.0.0',
        'path' => '/products/fgd-x15-pvc/',
    );
    $result = gdhe_task019_test_request($params);
    gdhe_task019_test_assert(
        $result['status'] === 200,
        'Eligible Product Configuration did not return 200.'
    );
    gdhe_task019_test_assert(
        ($result['headers']['Cache-Control'] ?? '') === 'public, max-age=60',
        'Product Configuration cache header drifted.'
    );
    gdhe_task019_test_assert(isset($result['headers']['ETag']), 'Product Configuration ETag is missing.');
    gdhe_task019_test_assert(
        gdhe_is_uuid_v4((string) ($result['headers']['X-GDHE-Request-ID'] ?? '')),
        'Product Configuration request ID is not UUIDv4.'
    );
    $document = $result['data'];
    gdhe_task019_test_assert(
        ($document['product'] ?? null) === array(
            'id' => '17000000-0000-4000-8000-000000000001',
            'model' => 'FGD X15+PVC',
            'name' => 'FGD X15+PVC Track',
            'publicPath' => '/products/fgd-x15-pvc/',
            'productKind' => 'curtain_track',
            'quantityUnit' => 'piece',
        ),
        'Product Configuration public identity drifted.'
    );
    gdhe_task019_test_assert(
        ($document['articleNumberOptions'] ?? null) === array(array(
            'articleNumber' => 'GDHEPRD000172',
            'lengthMeters' => 6,
            'color' => array('code' => 'ivory-white', 'label' => 'Ivory White'),
        )),
        'Product Configuration invented or lost a standard option.'
    );
    gdhe_task019_test_assert(
        ($document['configurationPolicy'] ?? null) === gdhe_task019_configuration_policy(),
        'Product Configuration policy drifted.'
    );
    $encoded = strtolower((string) wp_json_encode($document));
    foreach (array(
        'postid',
        'databaseid',
        'postmeta',
        '"meta"',
        '"acf"',
        '"scf"',
        'feishu',
        'record_id',
        'supplier',
        'purchaseprice',
        'purchase_price',
        'cost',
        'profit',
        'stock',
        'customerprice',
        'internal',
        'audit',
        'diagnostic',
    ) as $forbidden) {
        gdhe_task019_test_assert(
            !str_contains($encoded, $forbidden),
            'Anonymous Product Configuration leakage: ' . $forbidden
        );
    }

    $artifact_dir = dirname(ABSPATH) . '/frontend/src/lib/cms/product-configuration-contract/fixtures';
    $golden_dir = $artifact_dir . '/golden-product-configuration';
    if (!is_dir($golden_dir) && !mkdir($golden_dir, 0775, true) && !is_dir($golden_dir)) {
        throw new RuntimeException('Could not create TASK-019 Golden directory.');
    }
    gdhe_task019_write_json($golden_dir . '/fgd-x15-pvc.json', $document);

    $conditional = gdhe_task019_test_request(
        $params,
        array('If-None-Match' => (string) $result['headers']['ETag'])
    );
    gdhe_task019_test_assert($conditional['status'] === 304, 'Conditional request did not return 304.');
    gdhe_task019_test_assert($conditional['data'] === null, 'Conditional response was not bodyless.');

    $error_cases = array(
        'unknown-parameter' => array(
            $params + array('meta_key' => GDHE_PRODUCT_CONFIGURATION_SOURCE_META),
            400,
            'gdhe_invalid_parameter',
        ),
        'invalid-locale' => array(
            array('path' => '/products/fgd-x15-pvc/', 'locale' => 'fr'),
            400,
            'gdhe_invalid_locale',
        ),
        'invalid-schema' => array(
            array('path' => '/products/fgd-x15-pvc/', 'schema' => '3.0.0'),
            400,
            'gdhe_invalid_schema',
        ),
        'invalid-path' => array(
            array('path' => '/products/FGD-X15-PVC/'),
            400,
            'gdhe_invalid_path',
        ),
        'missing-path' => array(),
        'not-found' => array(
            array('path' => '/products/not-present/'),
            404,
            'gdhe_not_found',
        ),
    );
    $errors = array();
    foreach ($error_cases as $name => $case) {
        if ($name === 'missing-path') {
            $case = array(array(), 400, 'gdhe_invalid_path');
        }
        $error = gdhe_task019_test_request($case[0]);
        gdhe_task019_test_assert(
            $error['status'] === $case[1] && ($error['data']['code'] ?? '') === $case[2],
            'Product Configuration error matrix drifted: ' . $name
        );
        gdhe_task019_test_assert(
            ($error['headers']['Cache-Control'] ?? '') === 'no-store',
            'Product Configuration error is cacheable: ' . $name
        );
        $errors[$name] = gdhe_task019_normalized_error($error);
    }
    gdhe_task019_write_json($artifact_dir . '/PRODUCT_CONFIGURATION_ERROR_FIXTURES.json', $errors);

    $exclusions = array();
    foreach (array(
        'draft',
        'ineligible',
        'wrong_model',
        'wrong_path',
        'duplicate_article',
        'duplicate_choice',
        'extra_length',
        'guessed_accessory',
        'invalid_packaging',
        'custom_article',
        'internal_field',
        'malformed_source',
    ) as $key) {
        $excluded = gdhe_product_configuration_for_post(
            get_post((int) $manifest['posts'][$key])
        ) === null;
        gdhe_task019_test_assert($excluded, 'Invalid Product Configuration was accepted: ' . $key);
        $exclusions[$key] = true;
    }

    $duplicate_id = gdhe_task019_create_product('cross-source-duplicate', 'publish', 'valid', 30);
    gdhe_task019_test_assert(!is_wp_error($duplicate_id), 'Could not create duplicate-source probe.');
    try {
        $duplicate = gdhe_task019_test_request($params);
        gdhe_task019_test_assert(
            $duplicate['status'] === 404,
            'Cross-source duplicate Article Number did not fail closed.'
        );
    } finally {
        wp_delete_post((int) $duplicate_id, true);
    }
    $restored = gdhe_task019_test_request($params);
    gdhe_task019_test_assert($restored['status'] === 200, 'Duplicate-source probe was not reversible.');

    $shared_choice_id = gdhe_task019_create_shared_choice_product();
    gdhe_task019_test_assert(
        !is_wp_error($shared_choice_id),
        'Could not create distinct-product shared-choice probe.'
    );
    try {
        gdhe_task019_test_assert(
            is_array(gdhe_product_configuration_for_post(get_post((int) $shared_choice_id))),
            'Distinct-product shared-choice probe was not individually valid.'
        );
        $shared_choice_documents = gdhe_product_configuration_documents();
        $shared_choice_paths = array_column(
            array_column($shared_choice_documents, 'product'),
            'publicPath'
        );
        sort($shared_choice_paths, SORT_STRING);
        gdhe_task019_test_assert(
            $shared_choice_paths === array(
                '/products/fgd-x15-pvc/',
                '/products/task-019-shared-choice/',
            ),
            'Distinct products sharing 6 m / Ivory White were not both eligible.'
        );
        $shared_choice_result = gdhe_task019_test_request(array(
            'locale' => 'en',
            'schema' => '1.0.0',
            'path' => '/products/task-019-shared-choice/',
        ));
        gdhe_task019_test_assert(
            $shared_choice_result['status'] === 200,
            'Distinct-product shared-choice path did not resolve.'
        );
    } finally {
        wp_delete_post((int) $shared_choice_id, true);
    }
    $restored = gdhe_task019_test_request($params);
    gdhe_task019_test_assert($restored['status'] === 200, 'Shared-choice probe was not reversible.');

    $conflicting_identity_id = gdhe_task019_create_conflicting_identity_product();
    gdhe_task019_test_assert(
        !is_wp_error($conflicting_identity_id),
        'Could not create conflicting stable-identity probe.'
    );
    try {
        gdhe_task019_test_assert(
            is_array(gdhe_product_configuration_for_post(get_post((int) $conflicting_identity_id))),
            'Conflicting stable-identity probe was not individually valid.'
        );
        $conflicting_documents = array_values(array_filter(
            gdhe_product_configuration_documents(),
            function (array $candidate): bool {
                return ($candidate['product']['id'] ?? '')
                    === '17000000-0000-4000-8000-000000000001';
            }
        ));
        gdhe_task019_test_assert(
            $conflicting_documents === array(),
            'One stable product UUID mapped to conflicting public identities.'
        );
        $conflict_paths = array(
            '/products/fgd-x15-pvc/',
            '/products/task-019-conflicting-identity/',
        );
        foreach ($conflict_paths as $conflict_path) {
            $conflict_result = gdhe_task019_test_request(array(
                'locale' => 'en',
                'schema' => '1.0.0',
                'path' => $conflict_path,
            ));
            gdhe_task019_test_assert(
                $conflict_result['status'] === 404,
                'Conflicting stable identity remained publicly resolvable.'
            );
        }
    } finally {
        wp_delete_post((int) $conflicting_identity_id, true);
    }
    $restored = gdhe_task019_test_request($params);
    gdhe_task019_test_assert($restored['status'] === 200, 'Stable-identity probe was not reversible.');

    $summary = array(
        'fixtureVersion' => GDHE_TASK019_FIXTURE_VERSION,
        'apiVersion' => '1',
        'schemaVersion' => GDHE_PRODUCT_CONFIGURATION_SCHEMA_VERSION,
        'positiveGoldenCount' => 1,
        'negativeRequestCount' => count($errors),
        'invalidCandidateExclusions' => $exclusions,
        'crossSourceDuplicateArticleNumberRejected' => true,
        'sameProductDuplicatePublicChoiceRejected' => true,
        'distinctProductSharedPublicChoiceAccepted' => true,
        'conflictingStableProductIdentityRejected' => true,
        'conditionalStatus' => 304,
        'standardOptionCount' => 1,
        'customLengthWithoutArticleNumber' => true,
        'goldenSha256' => array(
            'fgd-x15-pvc.json' => hash_file('sha256', $golden_dir . '/fgd-x15-pvc.json'),
        ),
        'valid' => true,
    );
    gdhe_task019_write_json(
        $artifact_dir . '/PRODUCT_CONFIGURATION_RUNTIME_VALIDATION.json',
        $summary
    );
    return $summary;
}

WP_CLI::line(wp_json_encode(
    gdhe_task019_run_contract_test(),
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
));
