<?php

defined('ABSPATH') || exit;

function gdhe_a1_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_a1_test_error_code($value): string
{
    return is_wp_error($value)
        ? (string) call_user_func(array($value, 'get_error_code'))
        : '';
}

$summary = array();
$summary['schemaFiles'] = 0;
$summary['pureAssertions'] = 0;
$summary['fixtureId'] = null;
$summary['cleanup'] = false;
$fixture_id = 0;

try {
    $schema_files = glob(GDHE_SITE_PATH . 'config/schemas/*.json');
    $module_schema_files = glob(GDHE_SITE_PATH . 'config/schemas/modules/*.json');
    $schema_files = array_merge(is_array($schema_files) ? $schema_files : array(), is_array($module_schema_files) ? $module_schema_files : array());
    gdhe_a1_test_assert(count($schema_files) === 14, 'Expected fourteen A1 JSON Schema files.');
    foreach ($schema_files as $schema_file) {
        $schema = json_decode((string) file_get_contents($schema_file), true);
        gdhe_a1_test_assert(is_array($schema), 'Schema JSON must parse.');
        gdhe_a1_test_assert(isset($schema['$schema']) && $schema['$schema'] === 'https://json-schema.org/draft/2020-12/schema', 'Schema draft must be 2020-12.');
        gdhe_a1_test_assert(isset($schema['$id']) && str_contains($schema['$id'], '/schemas/v2/'), 'Schema canonical ID must use the v2 namespace.');
    }
    foreach (array('page', 'collection', 'navigation', 'route-manifest') as $envelope_name) {
        $envelope_path = GDHE_SITE_PATH . 'config/schemas/' . $envelope_name . '.schema.json';
        $envelope = json_decode((string) file_get_contents($envelope_path), true);
        gdhe_a1_test_assert(
            isset($envelope['properties']['schemaVersion']['const'])
                && $envelope['properties']['schemaVersion']['const'] === GDHE_SCHEMA_VERSION,
            'Envelope schemaVersion must match the active content schema.'
        );
    }
    $schema_response = gdhe_rest_schema();
    $schema_data = call_user_func(array($schema_response, 'get_data'));
    gdhe_a1_test_assert($schema_data['schemaVersion'] === '2.0.0', 'Schema discovery must expose content schema 2.0.0.');
    gdhe_a1_test_assert($schema_data['moduleSchemaVersion'] === '1.0.0', 'Schema discovery must expose module schema 1.0.0.');
    do_action('rest_api_init');
    $routes = call_user_func(array(rest_get_server(), 'get_routes'));
    gdhe_a1_test_assert(isset($routes['/gdhe/v1/schema']), 'A1 schema discovery route must remain registered.');
    gdhe_a1_test_assert(!isset($routes['/gdhe/v1/resolve']), 'A1 must not register the deferred A2 resolve route.');
    $summary['schemaFiles'] = count($schema_files);

    $rich = array();
    $rich['acf_fc_layout'] = 'rich_text';
    $rich['heading'] = 'A1 rich text';
    $rich['body'] = 'Synthetic body';

    $table = array();
    $table['acf_fc_layout'] = 'data_table';
    $table['caption'] = 'Synthetic table';
    $table['columns'] = array();
    $column_a = array();
    $column_a['key'] = 'grade';
    $column_a['label'] = 'Grade';
    $table['columns'][] = $column_a;
    $column_b = array();
    $column_b['key'] = 'tolerance';
    $column_b['label'] = 'Tolerance';
    $table['columns'][] = $column_b;
    $cell_a = array();
    $cell_a['column_key'] = 'grade';
    $cell_a['value'] = '6061';
    $cell_b = array();
    $cell_b['column_key'] = 'tolerance';
    $cell_b['value'] = '0.05 mm';
    $row = array();
    $row['cells'] = array($cell_a, $cell_b);
    $table['rows'] = array($row);

    $prepared = gdhe_prepare_modules_for_save(array($rich, $table));
    gdhe_a1_test_assert(gdhe_is_uuid_v4($prepared[0]['module_id']), 'First module ID must be UUID v4.');
    gdhe_a1_test_assert(gdhe_is_uuid_v4($prepared[1]['module_id']), 'Second module ID must be UUID v4.');
    gdhe_a1_test_assert($prepared[0]['module_schema_version'] === '1.0.0', 'Module version must be 1.0.0.');
    gdhe_a1_test_assert(gdhe_is_uuid_v4($prepared[1]['rows'][0]['row_id']), 'Table row ID must be UUID v4.');
    gdhe_a1_test_assert(gdhe_validate_module_collection($prepared, false) === true, 'Prepared module collection must validate.');

    $reordered = gdhe_prepare_modules_for_save(array_reverse($prepared));
    gdhe_a1_test_assert($reordered[0]['module_id'] === $prepared[1]['module_id'], 'Reorder must preserve module identity.');
    gdhe_a1_test_assert($reordered[1]['module_id'] === $prepared[0]['module_id'], 'Reorder must preserve both module identities.');

    $copied = $prepared;
    $copied[] = $prepared[0];
    $copied = gdhe_prepare_modules_for_save($copied);
    gdhe_a1_test_assert($copied[2]['module_id'] !== $prepared[0]['module_id'], 'Copied module must receive a new identity.');

    $bad_type = $prepared;
    $bad_type[0]['acf_fc_layout'] = 'unknown';
    gdhe_a1_test_assert(gdhe_a1_test_error_code(gdhe_validate_module_collection($bad_type, false)) === 'gdhe_module_type_invalid', 'Unknown module type must fail closed.');
    $bad_version = $prepared;
    $bad_version[0]['module_schema_version'] = '9.0.0';
    gdhe_a1_test_assert(gdhe_a1_test_error_code(gdhe_validate_module_collection($bad_version, false)) === 'gdhe_module_version_invalid', 'Unknown module version must fail closed.');
    $bad_table = $prepared;
    $bad_table[1]['columns'][1]['key'] = 'grade';
    gdhe_a1_test_assert(gdhe_a1_test_error_code(gdhe_validate_module_collection($bad_table, false)) === 'gdhe_table_column_key_invalid', 'Duplicate table keys must fail closed.');

    $legacy = gdhe_parse_legacy_table("Grade|Tolerance\n6061|0.05 mm");
    gdhe_a1_test_assert(is_array($legacy) && count($legacy['rows']) === 1, 'Unambiguous legacy table must parse.');
    gdhe_a1_test_assert(gdhe_a1_test_error_code(gdhe_parse_legacy_table("Grade|Grade\nA|B")) === 'gdhe_legacy_table_ambiguous_header', 'Duplicate normalized legacy headers must fail closed.');
    gdhe_a1_test_assert(gdhe_a1_test_error_code(gdhe_parse_legacy_table("Grade|Tolerance\n6061")) === 'gdhe_legacy_table_ambiguous_row', 'Uneven legacy row must fail closed.');
    $summary['pureAssertions'] = 36;

    $fixture = array();
    $fixture['post_type'] = 'service';
    $fixture['post_status'] = 'draft';
    $fixture['post_title'] = 'TASK-007 A1 TEMP MIGRATION';
    $fixture['post_name'] = 'task-007-a1-temp-migration';
    $fixture_id = wp_insert_post($fixture, true);
    gdhe_a1_test_assert(!is_wp_error($fixture_id), 'Synthetic A1 fixture creation failed.');
    $fixture_id = (int) $fixture_id;
    $summary['fixtureId'] = $fixture_id;

    update_post_meta($fixture_id, '_modules', 'field_gdhe_modules');
    update_post_meta($fixture_id, 'modules', array('data_table', 'rich_text'));
    update_post_meta($fixture_id, '_schema_version', 'field_gdhe_schema_version');
    update_post_meta($fixture_id, 'schema_version', '1.0.0');
    update_post_meta($fixture_id, '_modules_0_caption', 'field_gdhe_module_table_caption');
    update_post_meta($fixture_id, 'modules_0_caption', 'Legacy synthetic specifications');
    update_post_meta($fixture_id, '_modules_0_table_data', 'field_gdhe_module_table_data');
    update_post_meta($fixture_id, 'modules_0_table_data', "Grade|Tolerance\n6061|0.05 mm");
    update_post_meta($fixture_id, '_modules_1_heading', 'field_gdhe_module_rich_heading');
    update_post_meta($fixture_id, 'modules_1_heading', 'Synthetic details');
    update_post_meta($fixture_id, '_modules_1_body', 'field_gdhe_module_rich_body');
    update_post_meta($fixture_id, 'modules_1_body', 'TASK-007 synthetic content');

    $raw_before = wp_json_encode(gdhe_a1_raw_module_meta($fixture_id));
    $dry_run = gdhe_a1_plan_post($fixture_id);
    $raw_after_dry_run = wp_json_encode(gdhe_a1_raw_module_meta($fixture_id));
    gdhe_a1_test_assert($dry_run['classification'] === 'convertible' && $dry_run['wouldWrite'] === true, 'Dry-run must classify the synthetic legacy record as convertible.');
    gdhe_a1_test_assert($raw_before === $raw_after_dry_run, 'Dry-run must not write module meta.');

    $apply = gdhe_a1_apply_post($fixture_id);
    if (is_wp_error($apply)) {
        $apply_message = call_user_func(array($apply, 'get_error_message'));
        throw new RuntimeException('First apply error: ' . gdhe_a1_test_error_code($apply) . ' ' . $apply_message);
    }
    gdhe_a1_test_assert(is_array($apply) && $apply['changed'] === true, 'First apply must change the convertible record.');
    $migrated = get_field('modules', $fixture_id, true);
    gdhe_a1_test_assert(is_array($migrated) && count($migrated) === 2, 'Migrated modules must be readable through SCF.');
    gdhe_a1_test_assert(get_field('schema_version', $fixture_id, true) === '2.0.0', 'Apply must persist content schema 2.0.0.');
    gdhe_a1_test_assert(gdhe_validate_module_collection($migrated, false) === true, 'Migrated modules must pass strict validation.');
    gdhe_a1_test_assert(gdhe_a1_legacy_tables($fixture_id) === array(), 'Apply must remove legacy table_data meta.');

    $raw_after_apply = wp_json_encode(gdhe_a1_raw_module_meta($fixture_id));
    $apply_again = gdhe_a1_apply_post($fixture_id);
    gdhe_a1_test_assert(is_array($apply_again) && $apply_again['changed'] === false && $apply_again['classification'] === 'current', 'Repeated apply must be idempotent.');
    gdhe_a1_test_assert($raw_after_apply === wp_json_encode(gdhe_a1_raw_module_meta($fixture_id)), 'Repeated apply must not change module meta.');

    $ids_before_reorder = array($migrated[0]['module_id'], $migrated[1]['module_id']);
    update_field('field_gdhe_modules', array_reverse($migrated), $fixture_id);
    $after_reorder = get_field('modules', $fixture_id, true);
    gdhe_a1_test_assert($after_reorder[0]['module_id'] === $ids_before_reorder[1] && $after_reorder[1]['module_id'] === $ids_before_reorder[0], 'Persisted reorder must preserve IDs.');

    $copy_value = $after_reorder;
    $copy_value[] = $after_reorder[0];
    update_field('field_gdhe_modules', $copy_value, $fixture_id);
    $after_copy = get_field('modules', $fixture_id, true);
    gdhe_a1_test_assert(
        $after_copy[2]['module_id'] !== $after_copy[0]['module_id'],
        'Persisted copy must receive a new ID: ' . wp_json_encode($after_copy)
    );

    $rollback = gdhe_a1_rollback_post($fixture_id);
    gdhe_a1_test_assert(
        is_array($rollback) && $rollback['changed'] === true,
        'Rollback must restore the raw legacy snapshot: ' . wp_json_encode($rollback)
    );
    $raw_after_rollback = wp_json_encode(gdhe_a1_raw_module_meta($fixture_id));
    gdhe_a1_test_assert(
        $raw_before === $raw_after_rollback,
        'Rollback must restore exact module meta. Before: ' . $raw_before . ' After: ' . $raw_after_rollback
    );
    $rollback_again = gdhe_a1_rollback_post($fixture_id);
    gdhe_a1_test_assert(is_array($rollback_again) && $rollback_again['changed'] === false, 'Repeated rollback must be idempotent.');

    update_post_meta($fixture_id, 'modules_0_table_data', "Grade|Tolerance\n6061");
    $ambiguous_before = wp_json_encode(gdhe_a1_raw_module_meta($fixture_id));
    $ambiguous_plan = gdhe_a1_plan_post($fixture_id);
    gdhe_a1_test_assert($ambiguous_plan['classification'] === 'ambiguous', 'Ambiguous record must be reported.');
    $ambiguous_apply = gdhe_a1_apply_post($fixture_id);
    gdhe_a1_test_assert(gdhe_a1_test_error_code($ambiguous_apply) === 'gdhe_a1_ambiguous', 'Ambiguous apply must fail closed.');
    gdhe_a1_test_assert($ambiguous_before === wp_json_encode(gdhe_a1_raw_module_meta($fixture_id)), 'Ambiguous apply must not write.');
} finally {
    if (is_int($fixture_id) && 0 < $fixture_id) {
        wp_delete_post($fixture_id, true);
    }
    $remaining_args = array();
    $remaining_args['post_type'] = 'service';
    $remaining_args['post_status'] = 'any';
    $remaining_args['numberposts'] = -1;
    $remaining_args['title'] = 'TASK-007 A1 TEMP MIGRATION';
    $remaining_args['fields'] = 'ids';
    $remaining = get_posts($remaining_args);
    $summary['cleanup'] = is_array($remaining) && $remaining === array();
}

gdhe_a1_test_assert($summary['cleanup'] === true, 'Synthetic fixture cleanup failed.');
echo wp_json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;
