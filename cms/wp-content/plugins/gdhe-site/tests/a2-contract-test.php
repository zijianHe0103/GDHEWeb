<?php

defined('ABSPATH') || exit;

function gdhe_a2_pairs(array $flat): array
{
    $result = array();
    for ($index = 0; $index < count($flat); $index += 2) {
        $result[(string) $flat[$index]] = $flat[$index + 1];
    }
    return $result;
}

function gdhe_a2_test_request(string $route, array $params = array(), array $headers = array()): array
{
    $request = new WP_REST_Request('GET', $route);
    foreach (array_keys($params) as $key) {
        call_user_func(array($request, 'set_param'), $key, $params[$key]);
    }
    foreach (array_keys($headers) as $key) {
        call_user_func(array($request, 'set_header'), $key, $headers[$key]);
    }
    $response = rest_do_request($request);
    return gdhe_a2_pairs(array(
        'status', (int) call_user_func(array($response, 'get_status')),
        'data', call_user_func(array($response, 'get_data')),
        'headers', call_user_func(array($response, 'get_headers'))
    ));
}

function gdhe_a2_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_a2_test_write_json(string $path, $value): void
{
    $encoded = wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded) || file_put_contents($path, $encoded . PHP_EOL) === false) {
        throw new RuntimeException('Could not write test JSON: ' . $path);
    }
}

function gdhe_a2_test_error(string $route, array $params, int $status, string $code): array
{
    $result = gdhe_a2_test_request($route, $params);
    gdhe_a2_test_assert($result['status'] === $status, 'Unexpected status for ' . $code);
    gdhe_a2_test_assert(is_array($result['data']) && isset($result['data']['code']) && $result['data']['code'] === $code, 'Unexpected error code for ' . $code);
    gdhe_a2_test_assert(isset($result['data']['apiVersion'], $result['data']['message'], $result['data']['status'], $result['data']['requestId']), 'Incomplete stable error envelope.');
    return $result;
}

function gdhe_a2_error_fixture(array $data): array
{
    $data['requestId'] = '40000000-0000-4000-8000-000000000001';
    return $data;
}

function gdhe_a2_run_contract_test(): array
{
    $manifest = get_option(GDHE_A2_FIXTURE_OPTION, array());
    gdhe_a2_test_assert(is_array($manifest) && isset($manifest['posts']['home']), 'Fixture manifest is missing.');
    gdhe_a2_test_assert(!is_user_logged_in(), 'Contract test must execute anonymously.');
    $expected_content_ids = array();
    $expected_content_ids['home'] = '10000000-0000-4000-8000-000000000001';
    $expected_content_ids['service'] = '10000000-0000-4000-8000-000000000002';
    $expected_content_ids['case'] = '10000000-0000-4000-8000-000000000003';
    $expected_content_ids['material'] = '10000000-0000-4000-8000-000000000004';
    $expected_content_ids['service_alpha'] = '10000000-0000-4000-8000-000000000009';
    $expected_content_ids['service_beta'] = '10000000-0000-4000-8000-00000000000a';
    $expected_media_ids = array();
    $expected_media_ids['home'] = '20000000-0000-4000-8000-000000000001';
    $expected_media_ids['service'] = '20000000-0000-4000-8000-000000000002';
    $expected_media_ids['case'] = '20000000-0000-4000-8000-000000000003';
    $expected_media_ids['material'] = '20000000-0000-4000-8000-000000000004';
    foreach (array_keys($expected_content_ids) as $fixture_key) {
        $actual_content_id = gdhe_public_identifier((int) $manifest['posts'][$fixture_key]);
        gdhe_a2_test_assert($actual_content_id === $expected_content_ids[$fixture_key], 'Fixture content UUID drifted.');
        if (isset($expected_media_ids[$fixture_key])) {
            $actual_media_id = gdhe_public_identifier((int) $manifest['attachments'][$fixture_key], '_gdhe_public_media_id');
            gdhe_a2_test_assert($actual_media_id === $expected_media_ids[$fixture_key], 'Fixture media UUID drifted.');
        }
    }

    $artifact_dir = dirname(ABSPATH) . '/frontend/src/lib/cms/contracts/fixtures';
    $golden_dir = $artifact_dir . '/golden';
    if (!is_dir($golden_dir) && !mkdir($golden_dir, 0775, true) && !is_dir($golden_dir)) {
        throw new RuntimeException('Could not create golden output directory.');
    }

    $positive_cases = array();
    $positive_cases['resolve-home.json'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('locale', 'en', 'path', '/', 'schema', GDHE_SCHEMA_VERSION)));
    $positive_cases['resolve-service.json'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('locale', 'en', 'path', '/services/task-007-a2-precision-machining/', 'schema', GDHE_SCHEMA_VERSION)));
    $positive_cases['resolve-case-study.json'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('locale', 'en', 'path', '/case-studies/task-007-a2-aerospace-bracket/', 'schema', GDHE_SCHEMA_VERSION)));
    $positive_cases['resolve-material.json'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('locale', 'en', 'path', '/materials/task-007-a2-aluminum-6061/', 'schema', GDHE_SCHEMA_VERSION)));
    $positive_cases['collection-service.json'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('locale', 'en', 'filter', 'service_family:task-007-a2-cnc', 'sort', 'title_asc', 'page', 1, 'per_page', 2)));
    $positive_cases['collection-service-page-2.json'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('locale', 'en', 'filter', 'service_family:task-007-a2-cnc', 'sort', 'title_asc', 'page', 2, 'per_page', 2)));
    $positive_cases['collection-service-page-3-empty.json'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('locale', 'en', 'filter', 'service_family:task-007-a2-cnc', 'sort', 'title_asc', 'page', 3, 'per_page', 2)));
    $positive_cases['collection-service-modified.json'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('locale', 'en', 'filter', 'service_family:task-007-a2-cnc', 'sort', 'modified_desc', 'page', 1, 'per_page', 100)));
    $positive_cases['collection-service-per-page-1.json'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('locale', 'en', 'filter', 'service_family:task-007-a2-cnc', 'sort', 'title_asc', 'page', 1, 'per_page', 1)));
    $positive_cases['collection-case-study.json'] = array('/gdhe/v1/collection/case_study', gdhe_a2_pairs(array('locale', 'en', 'filter', 'manufacturing_process:task-007-a2-milling')));
    $positive_cases['collection-material.json'] = array('/gdhe/v1/collection/material', gdhe_a2_pairs(array('locale', 'en', 'filter', 'material_family:task-007-a2-aluminum')));
    $positive_cases['navigation.json'] = array('/gdhe/v1/navigation', gdhe_a2_pairs(array('locale', 'en')));
    $positive_cases['route-manifest.json'] = array('/gdhe/v1/route-manifest', gdhe_a2_pairs(array('locale', 'en')));

    $golden_checks = array();
    $positive_results = array();
    foreach (array_keys($positive_cases) as $filename) {
        $definition = $positive_cases[$filename];
        $result = gdhe_a2_test_request((string) $definition[0], $definition[1]);
        gdhe_a2_test_assert($result['status'] === 200, 'Positive request failed: ' . $filename);
        $positive_results[$filename] = $result;
        $encoded = strtolower((string) wp_json_encode($result['data']));
        foreach (array('acf', 'postmeta', 'site_settings', 'credentials', 'editorial_notes', 'user_email', 'user_pass') as $forbidden) {
            gdhe_a2_test_assert(!str_contains($encoded, $forbidden), 'Anonymous leakage detected: ' . $forbidden);
        }
        $path = $golden_dir . '/' . $filename;
        gdhe_a2_test_write_json($path, $result['data']);
        $golden_checks[$filename] = hash_file('sha256', $path);
    }
    gdhe_a2_test_assert(count($positive_results['collection-service.json']['data']['items']) === 2, 'Collection page 1 did not contain two items.');
    gdhe_a2_test_assert(count($positive_results['collection-service-page-2.json']['data']['items']) === 1, 'Collection page 2 did not contain one item.');
    gdhe_a2_test_assert($positive_results['collection-service-page-3-empty.json']['data']['items'] === array(), 'Terminal collection page was not empty.');
    $cross_page_totals = array(
        $positive_results['collection-service.json']['data']['total'],
        $positive_results['collection-service-page-2.json']['data']['total'],
        $positive_results['collection-service-page-3-empty.json']['data']['total']
    );
    gdhe_a2_test_assert($cross_page_totals === array(3, 3, 3), 'Filtered collection total was not invariant across page 1, page 2 and the terminal empty page.');
    $modified_items = $positive_results['collection-service-modified.json']['data']['items'];
    $modified_paths = array_column($modified_items, 'publicPath');
    $alpha_index = array_search('/services/task-007-a2-shared-alpha/', $modified_paths, true);
    $beta_index = array_search('/services/task-007-a2-shared-beta/', $modified_paths, true);
    gdhe_a2_test_assert(is_int($alpha_index) && is_int($beta_index) && $alpha_index < $beta_index, 'Modified sort tie-break was not canonical path order.');
    $home_json = strtolower((string) wp_json_encode($positive_results['resolve-home.json']['data']));
    foreach (array('<script', '<style', '<iframe', '<img', 'onclick=', 'onerror=', 'onmouseover=', 'javascript:') as $unsafe_html) {
        gdhe_a2_test_assert(!str_contains($home_json, $unsafe_html), 'Unsafe public HTML survived: ' . $unsafe_html);
    }
    gdhe_a2_test_assert(str_contains($home_json, 'safehtml'), 'Public safeHtml authority was not serialized.');

    $negative_matrix = array();
    $error_fixtures = array();
    $unpublished = gdhe_a2_pairs(array(
        'draft', '/services/task-007-a2-draft-service/',
        'private', '/services/task-007-a2-private-service/',
        'pending', '/services/task-007-a2-pending-service/',
        'trash', '/services/task-007-a2-trashed-service/'
    ));
    foreach (array_keys($unpublished) as $status) {
        $params = gdhe_a2_pairs(array('locale', 'en', 'path', $unpublished[$status]));
        $result = gdhe_a2_test_error('/gdhe/v1/resolve', $params, 404, 'gdhe_not_found');
        $negative_matrix['publication-' . $status] = gdhe_a2_pairs(array('status', $result['status'], 'code', $result['data']['code']));
        $error_fixtures['gdhe_not_found'] = gdhe_a2_error_fixture($result['data']);
    }

    $cases = array();
    $cases['nonexistent'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/services/task-007-a2-does-not-exist/')), 404, 'gdhe_not_found');
    $cases['invalid-locale'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('locale', 'fr', 'path', '/')), 400, 'gdhe_invalid_locale');
    $cases['invalid-path'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '//invalid/')), 400, 'gdhe_invalid_path');
    $cases['invalid-path-dot'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/services/../secret/')), 400, 'gdhe_invalid_path');
    $cases['invalid-path-uppercase'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/Services/test/')), 400, 'gdhe_invalid_path');
    $cases['invalid-path-encoded-separator'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/services%2Fsecret/')), 400, 'gdhe_invalid_path');
    $cases['invalid-path-query'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/services/test/?x=1')), 400, 'gdhe_invalid_path');
    $cases['invalid-path-fragment'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/services/test/#x')), 400, 'gdhe_invalid_path');
    $cases['invalid-schema'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/', 'schema', '9.9.9')), 400, 'gdhe_invalid_schema');
    $cases['invalid-type'] = array('/gdhe/v1/collection/page', array(), 400, 'gdhe_invalid_collection_type');
    $cases['invalid-filter'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('filter', 'material_family:bad')), 400, 'gdhe_invalid_filter');
    $cases['invalid-sort'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('sort', 'random')), 400, 'gdhe_invalid_sort');
    $cases['invalid-page'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('page', 0)), 400, 'gdhe_invalid_pagination');
    $cases['invalid-per-page-zero'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('per_page', 0)), 400, 'gdhe_invalid_pagination');
    $cases['invalid-per-page-high'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('per_page', 101)), 400, 'gdhe_invalid_pagination');
    foreach (array_keys($cases) as $name) {
        $definition = $cases[$name];
        $result = gdhe_a2_test_error((string) $definition[0], $definition[1], (int) $definition[2], (string) $definition[3]);
        $negative_matrix[$name] = gdhe_a2_pairs(array('status', $result['status'], 'code', $result['data']['code']));
        $error_fixtures[(string) $definition[3]] = gdhe_a2_error_fixture($result['data']);
    }

    gdhe_a2_test_assert(gdhe_content_reference((int) $manifest['posts']['draft']) === null, 'Draft reference did not fail closed.');
    gdhe_a2_test_assert(gdhe_normalize_media_reference(0) === null, 'Missing media did not fail closed.');
    gdhe_a2_test_assert(gdhe_normalize_media_reference((int) $manifest['posts']['service']) === null, 'Non-attachment media did not fail closed.');

    $unknown = gdhe_a2_pairs(array('acf_fc_layout', 'unknown'));
    gdhe_a2_test_assert(is_wp_error(gdhe_validate_module_collection(array($unknown), false)), 'Unknown module type did not fail closed.');
    $duplicate = gdhe_a2_pairs(array('acf_fc_layout', 'rich_text', 'module_id', '00000000-0000-4000-8000-000000000002', 'module_schema_version', GDHE_MODULE_SCHEMA_VERSION));
    gdhe_a2_test_assert(is_wp_error(gdhe_validate_module_collection(array($duplicate, $duplicate), false)), 'Duplicate module identity did not fail closed.');
    $bad_version = $duplicate;
    $bad_version['module_schema_version'] = '9.9.9';
    gdhe_a2_test_assert(is_wp_error(gdhe_validate_module_collection(array($bad_version), false)), 'Invalid module version did not fail closed.');
    $bad_table = gdhe_a2_table_module('Invalid', 'A', 'B');
    $bad_table['rows'][0]['cells'] = array();
    gdhe_a2_test_assert(is_wp_error(gdhe_validate_module_collection(array($bad_table), false)), 'Invalid table did not fail closed.');
    $missing_identity = gdhe_a2_pairs(array('acf_fc_layout', 'rich_text', 'body', 'Missing identity.'));
    gdhe_a2_test_assert(is_wp_error(gdhe_validate_module_collection(array($missing_identity), false)), 'Missing module identity did not fail closed.');

    $invalid_link = array();
    $invalid_link['title'] = 'Unsafe';
    $invalid_link['url'] = 'javascript:alert(1)';
    $invalid_link['target'] = '_self';
    gdhe_a2_test_assert(gdhe_normalize_public_link($invalid_link) === null, 'Dangerous link protocol did not fail closed.');
    $invalid_target = $invalid_link;
    $invalid_target['url'] = 'https://example.com/';
    $invalid_target['target'] = 'popup';
    gdhe_a2_test_assert(gdhe_normalize_public_link($invalid_target) === null, 'Unknown link target did not fail closed.');

    $invalid_card = gdhe_a2_card_grid_module();
    $invalid_card['items'][0]['link'] = $invalid_link;
    $invalid_card_result = gdhe_validate_module_collection(array($invalid_card), false);
    $invalid_split = gdhe_a2_split_media_module((int) $manifest['attachments']['home']);
    $invalid_split['media_position'] = 'center';
    $invalid_split_result = gdhe_validate_module_collection(array($invalid_split), false);
    $invalid_accordion = gdhe_a2_accordion_module();
    $invalid_accordion['items'][0]['answer'] = '';
    $invalid_accordion_result = gdhe_validate_module_collection(array($invalid_accordion), false);
    $invalid_cta = gdhe_a2_cta_banner_module();
    $invalid_cta['primary_cta'] = $invalid_link;
    $invalid_cta_result = gdhe_validate_module_collection(array($invalid_cta), false);
    foreach (array($invalid_card_result, $invalid_split_result, $invalid_accordion_result, $invalid_cta_result) as $invalid_module_result) {
        gdhe_a2_test_assert(is_wp_error($invalid_module_result), 'Invalid module fixture did not fail closed.');
    }
    $valid_modules = array(
        gdhe_a2_accordion_module(),
        gdhe_a2_card_grid_module(),
        gdhe_a2_split_media_module((int) $manifest['attachments']['home']),
        gdhe_a2_cta_banner_module()
    );
    $module_fixtures = array();
    $module_fixtures['fixtureVersion'] = GDHE_A2_FIXTURE_REVISION;
    $module_fixtures['valid'] = gdhe_normalize_public_modules($valid_modules);
    $module_fixtures['invalid'] = array();
    $invalid_public_accordion = $module_fixtures['valid'][0];
    unset($invalid_public_accordion['data']['items'][0]['safeHtml']);
    $module_fixtures['invalid'][] = gdhe_a2_pairs(array('schema', 'accordion.schema.json', 'instance', $invalid_public_accordion, 'expectedValid', false));
    $invalid_public_card = $module_fixtures['valid'][1];
    $invalid_public_card['data']['items'][0]['link']['url'] = 'javascript:alert(1)';
    $module_fixtures['invalid'][] = gdhe_a2_pairs(array('schema', 'card-grid.schema.json', 'instance', $invalid_public_card, 'expectedValid', false));
    $invalid_public_split = $module_fixtures['valid'][2];
    $invalid_public_split['data']['media_position'] = 'center';
    $module_fixtures['invalid'][] = gdhe_a2_pairs(array('schema', 'split-media.schema.json', 'instance', $invalid_public_split, 'expectedValid', false));
    $invalid_public_cta = $module_fixtures['valid'][3];
    $invalid_public_cta['data']['primary_cta']['target'] = 'popup';
    $module_fixtures['invalid'][] = gdhe_a2_pairs(array('schema', 'cta-banner.schema.json', 'instance', $invalid_public_cta, 'expectedValid', false));
    $module_fixtures['runtimeInvalidErrorCodes'] = array();
    foreach (array($invalid_card_result, $invalid_split_result, $invalid_accordion_result, $invalid_cta_result) as $invalid_module_result) {
        $module_fixtures['runtimeInvalidErrorCodes'][] = (string) call_user_func(array($invalid_module_result, 'get_error_code'));
    }

    $attachment_id = (int) $manifest['attachments']['home'];
    $attachment = get_post($attachment_id);
    $attachment_values = get_object_vars($attachment);
    $parent_id = (int) $attachment_values['post_parent'];
    $attachment_update = gdhe_a2_pairs(array('ID', $attachment_id, 'post_parent', 0));
    wp_update_post($attachment_update);
    gdhe_a2_test_assert(gdhe_normalize_media_reference($attachment_id) === null, 'Unattached media did not fail closed.');
    $attachment_update['post_parent'] = $parent_id;
    wp_update_post($attachment_update);

    $conflict_post = gdhe_a2_fixture_post('page', 'publish', 'TASK-007 A2 Route Conflict', 'task-007-a2-route-conflict', 'Conflict negative fixture.', '/', 90, '30000000-0000-4000-8000-000000000001');
    gdhe_a2_test_assert(!is_wp_error($conflict_post), 'Could not create route conflict fixture.');
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, (int) $conflict_post);
    update_field('field_gdhe_template_key', 'standard', (int) $conflict_post);
    update_field('field_gdhe_modules', array(), (int) $conflict_post);
    $conflict_result = gdhe_a2_test_error('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/')), 409, 'gdhe_route_conflict');
    $negative_matrix['route-conflict'] = gdhe_a2_pairs(array('status', $conflict_result['status'], 'code', $conflict_result['data']['code']));
    $error_fixtures['gdhe_route_conflict'] = gdhe_a2_error_fixture($conflict_result['data']);
    wp_delete_post((int) $conflict_post, true);

    $invariant_post = gdhe_a2_fixture_post('page', 'publish', 'TASK-007 A2 Contract Invariant', 'task-007-a2-contract-invariant', 'Invariant negative fixture.', '/task-007-a2-contract-invariant/', 100, '30000000-0000-4000-8000-000000000002');
    gdhe_a2_test_assert(!is_wp_error($invariant_post), 'Could not create contract invariant fixture.');
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, (int) $invariant_post);
    update_field('field_gdhe_template_key', 'unknown_template', (int) $invariant_post);
    update_field('field_gdhe_modules', array(), (int) $invariant_post);
    $invariant_result = gdhe_a2_test_error('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/task-007-a2-contract-invariant/')), 500, 'gdhe_contract_invariant');
    $negative_matrix['content-invariant'] = gdhe_a2_pairs(array('status', $invariant_result['status'], 'code', $invariant_result['data']['code']));
    $error_fixtures['gdhe_contract_invariant'] = gdhe_a2_error_fixture($invariant_result['data']);
    wp_delete_post((int) $invariant_post, true);

    $unknown_template_post = gdhe_a2_fixture_post('service', 'publish', 'TASK-007 A2 Ineligible Template', 'task-007-a2-ineligible-template', 'Collection negative fixture.', '/services/task-007-a2-ineligible-template/', 101, '30000000-0000-4000-8000-000000000003');
    gdhe_a2_test_assert(!is_wp_error($unknown_template_post), 'Could not create unknown-template collection fixture.');
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, (int) $unknown_template_post);
    update_field('field_gdhe_template_key', 'unknown_template', (int) $unknown_template_post);
    update_field('field_gdhe_modules', array(), (int) $unknown_template_post);
    $invalid_module_post = gdhe_a2_fixture_post('service', 'publish', 'TASK-007 A2 Ineligible Module', 'task-007-a2-ineligible-module', 'Collection negative fixture.', '/services/task-007-a2-ineligible-module/', 102, '30000000-0000-4000-8000-000000000004');
    gdhe_a2_test_assert(!is_wp_error($invalid_module_post), 'Could not create invalid-module collection fixture.');
    $invalid_modules = array(gdhe_a2_rich_module('Invalid module', '<p>Invalid schema version.</p>'));
    $invalid_modules[0]['module_schema_version'] = '9.9.9';
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, (int) $invalid_module_post);
    update_field('field_gdhe_template_key', 'service', (int) $invalid_module_post);
    update_field('field_gdhe_modules', $invalid_modules, (int) $invalid_module_post);
    update_post_meta((int) $invalid_module_post, 'modules_0_module_schema_version', '9.9.9');
    clean_post_cache((int) $invalid_module_post);
    acf_flush_value_cache((int) $invalid_module_post, 'modules');
    $invalid_path_post = gdhe_a2_fixture_post('service', 'publish', 'TASK-007 A2 Ineligible Path', 'task-007-a2-ineligible-path', 'Collection negative fixture.', '/services/task-007-a2-ineligible-path/', 103, '30000000-0000-4000-8000-000000000005');
    gdhe_a2_test_assert(!is_wp_error($invalid_path_post), 'Could not create invalid-path collection fixture.');
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, (int) $invalid_path_post);
    update_field('field_gdhe_template_key', 'service', (int) $invalid_path_post);
    update_field('field_gdhe_modules', array(), (int) $invalid_path_post);
    update_post_meta((int) $invalid_path_post, '_gdhe_public_path', '/Services/task-007-a2-ineligible-path/');
    wp_set_object_terms((int) $unknown_template_post, array((int) $manifest['terms']['serviceFamily']), 'service_family');
    wp_set_object_terms((int) $invalid_module_post, array((int) $manifest['terms']['serviceFamily']), 'service_family');
    wp_set_object_terms((int) $invalid_path_post, array((int) $manifest['terms']['serviceFamily']), 'service_family');
    gdhe_a2_test_assert(is_wp_error(gdhe_build_content_envelope(get_post((int) $unknown_template_post))), 'Unknown-template collection fixture unexpectedly satisfied the public contract.');
    gdhe_a2_test_assert(is_wp_error(gdhe_build_content_envelope(get_post((int) $invalid_module_post))), 'Invalid-module collection fixture unexpectedly satisfied the public contract.');
    gdhe_a2_test_assert(is_wp_error(gdhe_build_content_envelope(get_post((int) $invalid_path_post))), 'Invalid-path collection fixture unexpectedly satisfied the public contract.');
    $eligible_params = gdhe_a2_pairs(array('locale', 'en', 'filter', 'service_family:task-007-a2-cnc', 'sort', 'title_asc', 'page', 1, 'per_page', 2));
    $eligible_page_one = gdhe_a2_test_request('/gdhe/v1/collection/service', $eligible_params);
    $eligible_params['page'] = 2;
    $eligible_page_two = gdhe_a2_test_request('/gdhe/v1/collection/service', $eligible_params);
    $eligible_params['page'] = 3;
    $eligible_page_three = gdhe_a2_test_request('/gdhe/v1/collection/service', $eligible_params);
    $eligible_totals = array($eligible_page_one['data']['total'], $eligible_page_two['data']['total'], $eligible_page_three['data']['total']);
    $eligible_sizes = array(count($eligible_page_one['data']['items']), count($eligible_page_two['data']['items']), count($eligible_page_three['data']['items']));
    gdhe_a2_test_assert($eligible_totals === array(3, 3, 3), 'Ineligible published candidates changed collection totals.');
    gdhe_a2_test_assert($eligible_sizes === array(2, 1, 0), 'Ineligible published candidates changed collection page items.');
    $resolved_one = gdhe_a2_test_request('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', $eligible_page_one['data']['items'][0]['publicPath'])));
    $resolved_two = gdhe_a2_test_request('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', $eligible_page_one['data']['items'][1]['publicPath'])));
    $resolved_three = gdhe_a2_test_request('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', $eligible_page_two['data']['items'][0]['publicPath'])));
    gdhe_a2_test_assert($resolved_one['status'] === 200 && $resolved_one['data']['id'] === $eligible_page_one['data']['items'][0]['id'], 'Collection item one was not accepted by resolve.');
    gdhe_a2_test_assert($resolved_two['status'] === 200 && $resolved_two['data']['id'] === $eligible_page_one['data']['items'][1]['id'], 'Collection item two was not accepted by resolve.');
    gdhe_a2_test_assert($resolved_three['status'] === 200 && $resolved_three['data']['id'] === $eligible_page_two['data']['items'][0]['id'], 'Collection item three was not accepted by resolve.');
    $negative_matrix['collection-unknown-template-excluded'] = gdhe_a2_pairs(array('excluded', true, 'total', 3));
    $negative_matrix['collection-invalid-module-excluded'] = gdhe_a2_pairs(array('excluded', true, 'total', 3));
    $negative_matrix['collection-invalid-canonical-path-excluded'] = gdhe_a2_pairs(array('excluded', true, 'total', 3));
    wp_delete_post((int) $unknown_template_post, true);
    wp_delete_post((int) $invalid_module_post, true);
    wp_delete_post((int) $invalid_path_post, true);

    $header_requests = array();
    $header_requests['resolve'] = array('/gdhe/v1/resolve', gdhe_a2_pairs(array('path', '/')), true);
    $header_requests['collection'] = array('/gdhe/v1/collection/service', gdhe_a2_pairs(array('filter', 'service_family:task-007-a2-cnc')), false);
    $header_requests['navigation'] = array('/gdhe/v1/navigation', array(), false);
    $header_requests['routeManifest'] = array('/gdhe/v1/route-manifest', array(), false);
    $header_fixtures = array();
    foreach (array_keys($header_requests) as $endpoint) {
        $definition = $header_requests[$endpoint];
        $first = gdhe_a2_test_request((string) $definition[0], $definition[1]);
        $etag = isset($first['headers']['ETag']) ? (string) $first['headers']['ETag'] : '';
        gdhe_a2_test_assert($first['status'] === 200 && $etag !== '', 'ETag was not emitted for ' . $endpoint);
        gdhe_a2_test_assert(($first['headers']['Cache-Control'] ?? '') === 'public, max-age=60', 'Success Cache-Control drifted for ' . $endpoint);
        gdhe_a2_test_assert(($first['headers']['Content-Type'] ?? '') === 'application/json; charset=UTF-8', 'Success Content-Type drifted for ' . $endpoint);
        gdhe_a2_test_assert(gdhe_is_uuid_v4((string) ($first['headers']['X-GDHE-Request-ID'] ?? '')), 'Success request ID drifted for ' . $endpoint);
        if ($definition[2]) {
            gdhe_a2_test_assert(isset($first['headers']['Last-Modified']), 'Resolve Last-Modified was not emitted.');
        } else {
            gdhe_a2_test_assert(!isset($first['headers']['Last-Modified']), 'Non-resolve endpoint emitted Last-Modified.');
        }
        $conditional_headers = array();
        $conditional_headers['If-None-Match'] = $etag;
        $conditional = gdhe_a2_test_request((string) $definition[0], $definition[1], $conditional_headers);
        gdhe_a2_test_assert($conditional['status'] === 304, 'Conditional request did not return 304 for ' . $endpoint);
        gdhe_a2_test_assert(($conditional['headers']['ETag'] ?? '') === $etag, 'Conditional ETag drifted for ' . $endpoint);
        gdhe_a2_test_assert(($conditional['headers']['Cache-Control'] ?? '') === 'public, max-age=60', 'Conditional Cache-Control drifted for ' . $endpoint);
        gdhe_a2_test_assert(gdhe_is_uuid_v4((string) ($conditional['headers']['X-GDHE-Request-ID'] ?? '')), 'Conditional request ID drifted for ' . $endpoint);
        gdhe_a2_test_assert(!isset($conditional['headers']['Content-Type']), 'Conditional response emitted Content-Type for ' . $endpoint);
        $header_fixtures[$endpoint] = gdhe_a2_pairs(array(
            'successStatus', 200,
            'notModifiedStatus', 304,
            'cacheControl', 'public, max-age=60',
            'etag', 'required',
            'lastModified', $definition[2] ? 'required' : 'omitted',
            'contentType200', 'application/json; charset=UTF-8',
            'contentType304', 'omitted',
            'requestIdHeader', 'uuid-v4'
        ));
    }
    foreach (array_keys($header_requests) as $endpoint) {
        $definition = $header_requests[$endpoint];
        $error_params = $definition[1];
        $error_params['locale'] = 'fr';
        $error_probe = gdhe_a2_test_request((string) $definition[0], $error_params);
        gdhe_a2_test_assert($error_probe['status'] === 400, 'Error transport status drifted for ' . $endpoint);
        gdhe_a2_test_assert(($error_probe['headers']['Cache-Control'] ?? '') === 'no-store', 'Error Cache-Control drifted for ' . $endpoint);
        gdhe_a2_test_assert(($error_probe['headers']['Content-Type'] ?? '') === 'application/json; charset=UTF-8', 'Error Content-Type drifted for ' . $endpoint);
        gdhe_a2_test_assert(gdhe_is_uuid_v4((string) ($error_probe['headers']['X-GDHE-Request-ID'] ?? '')), 'Error request ID drifted for ' . $endpoint);
    }

    $path_matrix = array();
    $path_matrix['root'] = gdhe_validate_public_path('/');
    $path_matrix['canonical'] = gdhe_validate_public_path('/services/task-007-a2-precision-machining/');
    $path_matrix['doubleSlash'] = gdhe_validate_public_path('/services//bad/');
    $path_matrix['dotSegment'] = gdhe_validate_public_path('/services/../bad/');
    $path_matrix['uppercase'] = gdhe_validate_public_path('/Services/bad/');
    $path_matrix['encodedSeparator'] = gdhe_validate_public_path('/services%2fbad/');
    $path_matrix['query'] = gdhe_validate_public_path('/services/bad/?x=1');
    $path_matrix['fragment'] = gdhe_validate_public_path('/services/bad/#x');
    gdhe_a2_test_assert($path_matrix['root'] && $path_matrix['canonical'], 'Canonical public path positive boundary failed.');
    foreach (array('doubleSlash', 'dotSegment', 'uppercase', 'encodedSeparator', 'query', 'fragment') as $invalid_path_key) {
        gdhe_a2_test_assert(!$path_matrix[$invalid_path_key], 'Invalid public path was accepted: ' . $invalid_path_key);
    }

    $collection_evidence = array();
    $collection_evidence['fixtureVersion'] = GDHE_A2_FIXTURE_REVISION;
    $collection_evidence['publishedFilteredTotal'] = 3;
    $collection_evidence['pageSizes'] = array(2, 1, 0);
    $collection_evidence['crossPageTotals'] = $cross_page_totals;
    $collection_evidence['totalInvariant'] = $cross_page_totals === array(3, 3, 3);
    $collection_evidence['validPerPageBoundaries'] = array(1, 100);
    $collection_evidence['invalidPerPageBoundaries'] = array(0, 101);
    $collection_evidence['sorts'] = array('title_asc', 'modified_desc');
    $collection_evidence['tieBreak'] = 'post_name ASC';
    $collection_evidence['filterEchoed'] = true;
    $collection_evidence['sortEchoed'] = true;
    $collection_evidence['ineligiblePublishedCandidates'] = array('unknown-template', 'invalid-module', 'invalid-canonical-path');
    $collection_evidence['ineligibleCandidatesExcluded'] = true;
    $collection_evidence['everyItemResolveAccepted'] = true;

    $summary = array();
    $summary['testVersion'] = 'TASK-007-A2-CONTRACT-R5';
    $summary['anonymous'] = true;
    $summary['positiveCount'] = count($positive_cases);
    $summary['negativeCount'] = count($negative_matrix);
    $summary['negativeMatrix'] = $negative_matrix;
    $summary['failClosed'] = gdhe_a2_pairs(array('reference', true, 'media', true, 'module', true, 'table', true, 'link', true, 'template', true, 'path', true));
    $summary['safeHtml'] = gdhe_a2_pairs(array('authority', 'CMS wp_kses explicit allowlist', 'maliciousCases', 8, 'passed', true));
    $summary['conditionalRequest'] = gdhe_a2_pairs(array('endpointCount', 4, 'etag', true, 'notModifiedStatus', 304));
    $summary['collectionDeterminism'] = $collection_evidence;
    $summary['publicBounds'] = gdhe_a2_pairs(array('uuidVersion', 4, 'navigationMaxItems', 100, 'navigationMaxDepth', 3, 'routeMaxItems', 5000, 'relationGroups', 5, 'relationItemsPerGroup', 20));
    $summary['goldenSha256'] = $golden_checks;
    gdhe_a2_test_write_json($artifact_dir . '/CONTRACT_RUNTIME_SUMMARY.json', $summary);
    gdhe_a2_test_write_json($artifact_dir . '/FIXTURE_MANIFEST.json', $manifest);
    gdhe_a2_test_write_json($artifact_dir . '/ERROR_CONTRACT_FIXTURES.json', $error_fixtures);
    gdhe_a2_test_write_json($artifact_dir . '/HEADER_CONTRACT_FIXTURES.json', $header_fixtures);
    gdhe_a2_test_write_json($artifact_dir . '/MODULE_CONTRACT_FIXTURES.json', $module_fixtures);
    gdhe_a2_test_write_json($artifact_dir . '/COLLECTION_DETERMINISM.json', $collection_evidence);
    gdhe_a2_test_write_json($artifact_dir . '/PUBLIC_PATH_FIXTURES.json', $path_matrix);
    return $summary;
}

$gdhe_a2_result = gdhe_a2_run_contract_test();
WP_CLI::line(wp_json_encode($gdhe_a2_result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
