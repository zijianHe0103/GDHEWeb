<?php

defined('ABSPATH') || exit;

function gdhe_a3_migration_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_a3_migration_test_post(string $suffix, string $type = 'service'): int
{
    $post = array();
    $post['post_type'] = $type;
    $post['post_status'] = 'draft';
    $post['post_title'] = 'TASK-007 A3 Migration ' . $suffix;
    $post['post_name'] = 'task-007-a3-migration-' . sanitize_title($suffix);
    $post_id = wp_insert_post($post, true);
    gdhe_a3_migration_test_assert(!is_wp_error($post_id), 'Could not create migration fixture.');
    $post_id = (int) $post_id;
    if ($type === 'service') {
        update_post_meta($post_id, '_gdhe_a3_target_type', 'product');
        update_post_meta($post_id, '_gdhe_a3_product_classification', 'confirmed');
        $legacy = array();
        $legacy['services'] = array($post_id);
        $legacy['industries'] = array($post_id);
        $legacy['case_studies'] = array($post_id);
        update_field('field_gdhe_relationships', $legacy, $post_id);
    }
    return $post_id;
}

function gdhe_a3_migration_test_cleanup(array $ids): void
{
    foreach ($ids as $post_id) {
        if (get_post((int) $post_id)) {
            wp_delete_post((int) $post_id, true);
        }
    }
}

function gdhe_a3_migration_test_failure(string $stage, array &$ids): array
{
    $post_id = gdhe_a3_migration_test_post($stage);
    $ids[] = $post_id;
    $snapshot = gdhe_a3_snapshot($post_id);
    $inject = function ($current, string $candidate_stage, int $candidate_id) use ($stage, $post_id) {
        return $candidate_stage === $stage && $candidate_id === $post_id ? true : $current;
    };
    add_filter('gdhe_a3_migration_failure_stage', $inject, 10, 3);
    $result = gdhe_a3_apply_post($post_id);
    remove_filter('gdhe_a3_migration_failure_stage', $inject, 10);
    gdhe_a3_migration_test_assert(is_wp_error($result), 'Injected migration failure unexpectedly passed: ' . $stage);
    gdhe_a3_migration_test_assert(gdhe_a3_snapshot($post_id) === $snapshot, 'Injected migration failure left partial state: ' . $stage);
    gdhe_a3_migration_test_assert(get_post_meta($post_id, GDHE_A3_MIGRATION_BACKUP, true) === '', 'Injected failure left backup meta: ' . $stage);
    gdhe_a3_migration_test_assert(get_post_meta($post_id, GDHE_A3_MIGRATION_MARKER, true) === '', 'Injected failure left marker meta: ' . $stage);
    $evidence = array();
    $evidence['stage'] = $stage;
    $evidence['errorCode'] = call_user_func(array($result, 'get_error_code'));
    $evidence['snapshotRestored'] = true;
    $evidence['backupMetaRemoved'] = true;
    return $evidence;
}

function gdhe_a3_run_migration_runtime_test(): array
{
    $ids = array();
    try {
        $post_id = gdhe_a3_migration_test_post('success');
        $ids[] = $post_id;
        $initial = gdhe_a3_snapshot($post_id);
        $inventory = gdhe_a3_inventory(array($post_id));
        gdhe_a3_migration_test_assert(($inventory[0]['classification'] ?? '') === 'convertible', 'Non-zero inventory did not classify the fixture.');
        $dry_run = gdhe_a3_inventory(array($post_id));
        gdhe_a3_migration_test_assert(gdhe_a3_snapshot($post_id) === $initial, 'Dry-run modified the fixture.');
        $apply = gdhe_a3_apply_post($post_id);
        gdhe_a3_migration_test_assert(!is_wp_error($apply) && !empty($apply['changed']), 'Migration apply failed.');
        $apply_again = gdhe_a3_apply_post($post_id);
        gdhe_a3_migration_test_assert(!is_wp_error($apply_again) && empty($apply_again['changed']), 'Repeated apply was not idempotent.');
        $rollback = gdhe_a3_rollback_post($post_id);
        gdhe_a3_migration_test_assert(!is_wp_error($rollback) && !empty($rollback['changed']), 'Migration rollback failed.');
        gdhe_a3_migration_test_assert(gdhe_a3_snapshot($post_id) === $initial, 'Rollback was not an exact snapshot restore.');
        $rollback_again = gdhe_a3_rollback_post($post_id);
        gdhe_a3_migration_test_assert(!is_wp_error($rollback_again) && empty($rollback_again['changed']), 'Repeated rollback was not idempotent.');

        $failure_results = array();
        foreach (array('post_update', 'path_readback', 'template_readback', 'relations_readback') as $stage) {
            $failure_results[] = gdhe_a3_migration_test_failure($stage, $ids);
        }

        $ambiguous_id = gdhe_a3_migration_test_post('ambiguous', 'material');
        $ids[] = $ambiguous_id;
        $ambiguous_snapshot = gdhe_a3_snapshot($ambiguous_id);
        $ambiguous = gdhe_a3_apply_post($ambiguous_id);
        gdhe_a3_migration_test_assert(is_wp_error($ambiguous), 'Ambiguous migration fixture unexpectedly applied.');
        gdhe_a3_migration_test_assert(gdhe_a3_snapshot($ambiguous_id) === $ambiguous_snapshot, 'Ambiguous refusal modified the fixture.');

        $report = array();
        $report['evidenceVersion'] = 'TASK-007-A3-MIGRATION-RUNTIME-R1';
        $report['inventoryCount'] = count($inventory);
        $report['dryRunZeroWrite'] = $dry_run === $inventory;
        $report['applyChanged'] = true;
        $report['repeatedApplyNoOp'] = true;
        $report['exactRollback'] = true;
        $report['repeatedRollbackNoOp'] = true;
        $report['ambiguousRefused'] = true;
        $report['failureInjectionResults'] = $failure_results;
        return $report;
    } finally {
        gdhe_a3_migration_test_cleanup($ids);
    }
}

$a3_migration_result = gdhe_a3_run_migration_runtime_test();
$a3_migration_path = dirname(ABSPATH) . '/TASKS/ARTIFACTS/TASK-007/A3_MIGRATION_RUNTIME_VALIDATION.json';
$a3_migration_json = wp_json_encode($a3_migration_result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if (!is_string($a3_migration_json) || file_put_contents($a3_migration_path, $a3_migration_json . PHP_EOL) === false) {
    throw new RuntimeException('Could not write A3 migration runtime evidence.');
}
WP_CLI::line($a3_migration_json);
