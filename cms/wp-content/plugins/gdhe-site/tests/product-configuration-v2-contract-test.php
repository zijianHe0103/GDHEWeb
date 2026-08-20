<?php

defined('ABSPATH') || exit;

function gdhe_task021_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_task021_test_request(array $params, array $headers = array()): array
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

function gdhe_task021_test_write_json(string $path, $value): void
{
    $encoded = wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded) || file_put_contents($path, $encoded . PHP_EOL) === false) {
        throw new RuntimeException('Could not write TASK-021 JSON evidence.');
    }
}

function gdhe_task021_test_normalized_error(array $result): array
{
    gdhe_task021_test_assert(
        gdhe_is_uuid_v4((string) ($result['data']['requestId'] ?? '')),
        'Error request ID is not UUIDv4.'
    );
    $body = $result['data'];
    $body['requestId'] = '<uuid-v4>';
    return $body;
}

function gdhe_task021_test_probe(array $changes, int $order)
{
    $post_id = gdhe_task021_create_product('probe-' . $order, 'publish', 'valid', $order);
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    $source = gdhe_task021_valid_source();
    $source['sourceClass'] = 'production';
    foreach ($changes as $key => $value) {
        if ($key === 'articleNumber') {
            $source['articleNumberOptions'][0]['articleNumber'] = $value;
        } elseif ($key === 'lengthMeters') {
            $source['articleNumberOptions'][0]['lengthMeters'] = $value;
        } else {
            $source['product'][$key] = $value;
        }
    }
    wp_update_post(array('ID' => $post_id, 'post_title' => $source['product']['name']));
    update_post_meta($post_id, '_gdhe_public_id', $source['product']['id']);
    update_post_meta($post_id, '_gdhe_public_path', $source['product']['publicPath']);
    update_post_meta($post_id, 'product_details', array('model' => $source['product']['model']));
    update_post_meta(
        $post_id,
        GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META,
        wp_json_encode($source, JSON_UNESCAPED_SLASHES)
    );
    return $post_id;
}

$result = gdhe_task021_test_request(array(
    'locale' => 'en',
    'schema' => '2.0.0',
    'path' => '/products/fgd-x15-pvc/',
));
gdhe_task021_test_assert(
    $result['status'] === 200,
    'Eligible Product Configuration v2 did not return 200.'
);
$document = $result['data'];
gdhe_task021_test_assert(
    ($document['product'] ?? null) === array(
        'id' => '21000000-0000-4000-8000-000000000001',
        'model' => 'FGD X15+PVC',
        'name' => 'FGD X15+PVC Track',
        'publicPath' => '/products/fgd-x15-pvc/',
        'productKind' => 'curtain_track',
        'quantityUnit' => 'piece',
    ),
    'Product Configuration v2 identity drifted.'
);
gdhe_task021_test_assert(
    ($document['articleNumberOptions'] ?? null) === array(array(
        'articleNumber' => 'GDHEPRD000172',
        'lengthMeters' => 6,
        'color' => array('code' => 'ivory-white', 'label' => 'Ivory White'),
    )),
    'Product Configuration v2 invented or lost an option.'
);
gdhe_task021_test_assert(
    ($document['configurationPolicy'] ?? null) === gdhe_task021_configuration_policy(),
    'Product Configuration v2 policy drifted.'
);
gdhe_task021_test_assert(
    ($result['headers']['Cache-Control'] ?? '') === 'public, max-age=60'
        && isset($result['headers']['ETag'])
        && gdhe_is_uuid_v4((string) ($result['headers']['X-GDHE-Request-ID'] ?? '')),
    'Product Configuration v2 success headers drifted.'
);
$encoded = strtolower((string) wp_json_encode($result['data']));
gdhe_task021_test_assert(
    !str_contains($encoded, 'installation') && !str_contains($encoded, 'accessory'),
    'Product Configuration v2 exposed installation or accessory fields.'
);
foreach (array('postid', 'databaseid', 'postmeta', 'purchaseprice', 'supplier', 'feishu', 'internal') as $private) {
    gdhe_task021_test_assert(!str_contains($encoded, $private), 'Private field leaked: ' . $private);
}

$artifact_dir = dirname(ABSPATH) . '/frontend/src/lib/cms/product-configuration-v2-contract/fixtures';
$golden_dir = $artifact_dir . '/golden-product-configuration-v2';
if (!is_dir($golden_dir) && !mkdir($golden_dir, 0775, true) && !is_dir($golden_dir)) {
    throw new RuntimeException('Could not create TASK-021 Golden directory.');
}
gdhe_task021_test_write_json($golden_dir . '/fgd-x15-pvc.json', $document);

$conditional = gdhe_task021_test_request(
    array('locale' => 'en', 'schema' => '2.0.0', 'path' => '/products/fgd-x15-pvc/'),
    array('If-None-Match' => (string) $result['headers']['ETag'])
);
gdhe_task021_test_assert($conditional['status'] === 304 && $conditional['data'] === null, 'V2 ETag did not return a bodyless 304.');

$error_cases = array(
    'unknown-parameter' => array(array('schema' => '2.0.0', 'path' => '/products/fgd-x15-pvc/', 'private' => 'x'), 400, 'gdhe_invalid_parameter'),
    'invalid-locale' => array(array('schema' => '2.0.0', 'locale' => 'fr', 'path' => '/products/fgd-x15-pvc/'), 400, 'gdhe_invalid_locale'),
    'unsupported-schema' => array(array('schema' => '9.0.0', 'path' => '/products/fgd-x15-pvc/'), 400, 'gdhe_invalid_schema'),
    'invalid-path' => array(array('schema' => '2.0.0', 'path' => '/products/FGD-X15-PVC/'), 400, 'gdhe_invalid_path'),
    'missing-path' => array(array('schema' => '2.0.0'), 400, 'gdhe_invalid_path'),
    'not-found' => array(array('schema' => '2.0.0', 'path' => '/products/not-present/'), 404, 'gdhe_not_found'),
);
$errors = array();
foreach ($error_cases as $name => $case) {
    $error = gdhe_task021_test_request($case[0]);
    gdhe_task021_test_assert(
        $error['status'] === $case[1] && ($error['data']['code'] ?? '') === $case[2],
        'Product Configuration v2 error drifted: ' . $name
    );
    gdhe_task021_test_assert(($error['headers']['Cache-Control'] ?? '') === 'no-store', 'V2 error is cacheable: ' . $name);
    $errors[$name] = gdhe_task021_test_normalized_error($error);
}
gdhe_task021_test_write_json($artifact_dir . '/PRODUCT_CONFIGURATION_V2_ERROR_FIXTURES.json', $errors);

$manifest = get_option(GDHE_TASK021_FIXTURE_OPTION, array());
$exclusions = array();
foreach (array('draft', 'ineligible', 'duplicate_article', 'duplicate_choice', 'guessed_length', 'malformed_color', 'malformed_length', 'inconsistent_color', 'installation_field', 'accessory_field', 'internal_field', 'wrong_model', 'wrong_path', 'malformed_source') as $key) {
    $excluded = gdhe_product_configuration_v2_for_post(get_post((int) $manifest['posts'][$key])) === null;
    gdhe_task021_test_assert($excluded, 'Invalid v2 candidate was accepted: ' . $key);
    $exclusions[$key] = true;
}

$duplicate_id = gdhe_task021_test_probe(array(
    'id' => '21000000-0000-4000-8000-000000000002',
    'model' => 'TASK-021 Duplicate Article',
    'name' => 'TASK-021 Duplicate Article Track',
    'publicPath' => '/products/task-021-duplicate-article/',
), 30);
gdhe_task021_test_assert(!is_wp_error($duplicate_id), 'Could not create duplicate Article Number probe.');
try {
    gdhe_task021_test_assert(gdhe_product_configuration_v2_documents() === array(), 'Global duplicate Article Number did not fail closed.');
} finally {
    wp_delete_post((int) $duplicate_id, true);
}

$shared_id = gdhe_task021_test_probe(array(
    'id' => '21000000-0000-4000-8000-000000000003',
    'model' => 'TASK-021 Shared Choice',
    'name' => 'TASK-021 Shared Choice Track',
    'publicPath' => '/products/task-021-shared-choice/',
    'articleNumber' => 'GDHEPRD000173',
), 31);
gdhe_task021_test_assert(!is_wp_error($shared_id), 'Could not create shared-choice probe.');
try {
    gdhe_task021_test_assert(count(gdhe_product_configuration_v2_documents()) === 2, 'Distinct products could not share one public choice.');
} finally {
    wp_delete_post((int) $shared_id, true);
}

$color_id = gdhe_task021_test_probe(array(
    'id' => '21000000-0000-4000-8000-000000000004',
    'model' => 'TASK-021 Color Consistency',
    'name' => 'TASK-021 Color Consistency Track',
    'publicPath' => '/products/task-021-color-consistency/',
    'articleNumber' => 'GDHEPRD000176',
), 34);
gdhe_task021_test_assert(!is_wp_error($color_id), 'Could not create color consistency probe.');
$color_source = json_decode((string) get_post_meta(
    (int) $color_id,
    GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META,
    true
), true);
$color_option = $color_source['articleNumberOptions'][0];
$color_option['articleNumber'] = 'GDHEPRD000177';
$color_option['lengthMeters'] = 5;
$color_option['color']['label'] = 'Cream';
$color_source['articleNumberOptions'][] = $color_option;
update_post_meta(
    (int) $color_id,
    GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META,
    wp_json_encode($color_source, JSON_UNESCAPED_SLASHES)
);
try {
    gdhe_task021_test_assert(
        gdhe_product_configuration_v2_for_post(get_post((int) $color_id)) === null,
        'One color code mapped to inconsistent labels.'
    );
} finally {
    wp_delete_post((int) $color_id, true);
}

$choice_id = gdhe_task021_test_probe(array('articleNumber' => 'GDHEPRD000174'), 32);
gdhe_task021_test_assert(!is_wp_error($choice_id), 'Could not create same-product choice probe.');
try {
    gdhe_task021_test_assert(gdhe_product_configuration_v2_documents() === array(), 'Same-product choice ambiguity did not fail closed.');
} finally {
    wp_delete_post((int) $choice_id, true);
}

$conflict_id = gdhe_task021_test_probe(array(
    'model' => 'TASK-021 Conflicting Identity',
    'name' => 'TASK-021 Conflicting Identity Track',
    'publicPath' => '/products/task-021-conflicting-identity/',
    'articleNumber' => 'GDHEPRD000175',
    'lengthMeters' => 5,
), 33);
gdhe_task021_test_assert(!is_wp_error($conflict_id), 'Could not create identity-conflict probe.');
try {
    gdhe_task021_test_assert(gdhe_product_configuration_v2_documents() === array(), 'Stable UUID identity conflict did not fail closed.');
} finally {
    wp_delete_post((int) $conflict_id, true);
}
gdhe_task021_test_assert(count(gdhe_product_configuration_v2_documents()) === 1, 'Aggregate probes were not reversible.');

$runtime = array(
    'evidenceVersion' => 'TASK-021-PRODUCT-CONFIGURATION-V2-RUNTIME-1',
    'schemaVersion' => '2.0.0',
    'successCount' => 1,
    'errorCount' => count($errors),
    'candidateExclusionCount' => count($exclusions),
    'etag304' => true,
    'globalArticleNumberUnique' => true,
    'publicChoiceUniquePerStableProduct' => true,
    'distinctProductsMaySharePublicChoice' => true,
    'stableProductIdentityConsistent' => true,
    'installationAndAccessoryAbsent' => true,
    'valid' => true,
);
gdhe_task021_test_write_json($artifact_dir . '/PRODUCT_CONFIGURATION_V2_RUNTIME_VALIDATION.json', $runtime);

WP_CLI::line(wp_json_encode(array(
    'schemaVersion' => '2.0.0',
    'errorCount' => count($errors),
    'candidateExclusionCount' => count($exclusions),
    'installationFieldsAbsent' => true,
    'valid' => true,
), JSON_PRETTY_PRINT));
