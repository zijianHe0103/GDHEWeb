<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_A3_MIGRATION_VERSION = '3.0.0';
const GDHE_A3_MIGRATION_MARKER = '_gdhe_a3_migration_version';
const GDHE_A3_MIGRATION_BACKUP = '_gdhe_a3_migration_backup';

function gdhe_a3_legacy_types(): array
{
    return array('service', 'industry', 'case_study', 'material', 'surface_finish', 'testimonial');
}

function gdhe_a3_legacy_ids(): array
{
    global $wpdb;
    $posts_table = (string) gdhe_object_value($wpdb, 'posts', '');
    $placeholders = implode(',', array_fill(0, count(gdhe_a3_legacy_types()), '%s'));
    $sql = "SELECT ID FROM {$posts_table} WHERE post_type IN ({$placeholders}) ORDER BY ID ASC";
    $prepared = call_user_func_array(array($wpdb, 'prepare'), array_merge(array($sql), gdhe_a3_legacy_types()));
    $ids = call_user_func(array($wpdb, 'get_col'), $prepared);
    return is_array($ids) ? array_map('intval', $ids) : array();
}

function gdhe_a3_target_type(int $post_id, string $legacy_type): string
{
    if ($legacy_type === 'industry') {
        return 'market';
    }
    if ($legacy_type === 'case_study') {
        return 'reference';
    }
    if ($legacy_type === 'service'
        && get_post_meta($post_id, '_gdhe_a3_target_type', true) === 'product'
        && get_post_meta($post_id, '_gdhe_a3_product_classification', true) === 'confirmed') {
        return 'product';
    }
    return '';
}

function gdhe_a3_plan_post(int $post_id): array
{
    $post = get_post($post_id);
    $legacy_type = (string) gdhe_object_value($post, 'post_type', '');
    $status = (string) gdhe_object_value($post, 'post_status', '');
    $target_type = gdhe_a3_target_type($post_id, $legacy_type);
    $classification = 'ambiguous';
    $reason = 'legacy_type_requires_manual_classification';
    if ($status === 'auto-draft') {
        $classification = 'ignored_ephemeral';
        $reason = 'auto_draft_is_not_business_content';
    } elseif (get_post_meta($post_id, GDHE_A3_MIGRATION_MARKER, true) === GDHE_A3_MIGRATION_VERSION) {
        $classification = 'current';
        $reason = 'already_migrated';
    } elseif ($target_type !== '') {
        $classification = 'convertible';
        $reason = 'explicit_mapping_available';
    }
    $plan = array();
    $plan['postId'] = $post_id;
    $plan['legacyType'] = $legacy_type;
    $plan['status'] = $status;
    $plan['classification'] = $classification;
    $plan['targetType'] = $target_type;
    $plan['reason'] = $reason;
    $plan['wouldWrite'] = $classification === 'convertible';
    return $plan;
}

function gdhe_a3_inventory(?array $ids = null): array
{
    $candidate_ids = $ids === null ? gdhe_a3_legacy_ids() : $ids;
    $records = array();
    foreach ($candidate_ids as $post_id) {
        $records[] = gdhe_a3_plan_post((int) $post_id);
    }
    return $records;
}

function gdhe_a3_snapshot(int $post_id): array
{
    global $wpdb;
    $posts_table = (string) gdhe_object_value($wpdb, 'posts', '');
    $meta_table = (string) gdhe_object_value($wpdb, 'postmeta', '');
    $relationships_table = (string) gdhe_object_value($wpdb, 'term_relationships', '');
    $post_query = call_user_func(
        array($wpdb, 'prepare'),
        "SELECT * FROM {$posts_table} WHERE ID = %d",
        $post_id
    );
    $meta_query = call_user_func(
        array($wpdb, 'prepare'),
        "SELECT meta_key, meta_value FROM {$meta_table} WHERE post_id = %d ORDER BY meta_id ASC",
        $post_id
    );
    $relationship_query = call_user_func(
        array($wpdb, 'prepare'),
        "SELECT term_taxonomy_id, term_order FROM {$relationships_table} WHERE object_id = %d ORDER BY term_taxonomy_id ASC",
        $post_id
    );
    $snapshot = array();
    $snapshot['post'] = call_user_func(array($wpdb, 'get_row'), $post_query, ARRAY_A);
    $snapshot['meta'] = call_user_func(array($wpdb, 'get_results'), $meta_query, ARRAY_A);
    $snapshot['relationships'] = call_user_func(array($wpdb, 'get_results'), $relationship_query, ARRAY_A);
    return $snapshot;
}

function gdhe_a3_target_path(string $target_type, string $slug): string
{
    $prefixes = array();
    $prefixes['product'] = 'products';
    $prefixes['market'] = 'markets';
    $prefixes['reference'] = 'references';
    $prefix = $prefixes[$target_type] ?? '';
    return $prefix === '' ? '' : '/' . $prefix . '/' . $slug . '/';
}

function gdhe_a3_remap_relationships($value): array
{
    $legacy = is_array($value) ? $value : array();
    $relationships = array();
    $relationships['products'] = $legacy['services'] ?? array();
    $relationships['markets'] = $legacy['industries'] ?? array();
    $relationships['references'] = $legacy['case_studies'] ?? array();
    $relationships['support_articles'] = array();
    $relationships['downloads'] = array();
    return $relationships;
}

function gdhe_a3_normalize_relationships($value): array
{
    $source = is_array($value) ? $value : array();
    $normalized = array();
    foreach (array('products', 'markets', 'references', 'support_articles', 'downloads') as $key) {
        $ids = is_array($source[$key] ?? null) ? $source[$key] : array();
        $normalized[$key] = array();
        foreach ($ids as $id) {
            $normalized[$key][] = (int) gdhe_object_value($id, 'ID', $id);
        }
    }
    return $normalized;
}

function gdhe_a3_failure_injected(string $stage, int $post_id): bool
{
    return (bool) apply_filters('gdhe_a3_migration_failure_stage', false, $stage, $post_id);
}

function gdhe_a3_restore_snapshot(int $post_id, array $snapshot)
{
    global $wpdb;
    if (!is_array($snapshot['post'] ?? null)) {
        return new WP_Error('gdhe_a3_restore_failed', 'A3 restore snapshot is invalid.');
    }
    $posts_table = (string) gdhe_object_value($wpdb, 'posts', '');
    $meta_table = (string) gdhe_object_value($wpdb, 'postmeta', '');
    $relationships_table = (string) gdhe_object_value($wpdb, 'term_relationships', '');
    $post_data = $snapshot['post'];
    unset($post_data['ID']);
    $where = array();
    $where['ID'] = $post_id;
    if (call_user_func(array($wpdb, 'update'), $posts_table, $post_data, $where) === false) {
        return new WP_Error('gdhe_a3_restore_failed', 'A3 could not restore the source post.');
    }

    $delete_meta = call_user_func(
        array($wpdb, 'prepare'),
        "DELETE FROM {$meta_table} WHERE post_id = %d",
        $post_id
    );
    if (call_user_func(array($wpdb, 'query'), $delete_meta) === false) {
        return new WP_Error('gdhe_a3_restore_failed', 'A3 could not clear partial migration meta.');
    }
    foreach ($snapshot['meta'] ?? array() as $row) {
        $record = array();
        $record['post_id'] = $post_id;
        $record['meta_key'] = (string) ($row['meta_key'] ?? '');
        $record['meta_value'] = (string) ($row['meta_value'] ?? '');
        if (call_user_func(array($wpdb, 'insert'), $meta_table, $record) === false) {
            return new WP_Error('gdhe_a3_restore_failed', 'A3 could not restore source meta.');
        }
    }

    $delete_relationships = call_user_func(
        array($wpdb, 'prepare'),
        "DELETE FROM {$relationships_table} WHERE object_id = %d",
        $post_id
    );
    if (call_user_func(array($wpdb, 'query'), $delete_relationships) === false) {
        return new WP_Error('gdhe_a3_restore_failed', 'A3 could not clear partial term relationships.');
    }
    foreach ($snapshot['relationships'] ?? array() as $row) {
        $record = array();
        $record['object_id'] = $post_id;
        $record['term_taxonomy_id'] = (int) ($row['term_taxonomy_id'] ?? 0);
        $record['term_order'] = (int) ($row['term_order'] ?? 0);
        if (call_user_func(array($wpdb, 'insert'), $relationships_table, $record) === false) {
            return new WP_Error('gdhe_a3_restore_failed', 'A3 could not restore term relationships.');
        }
    }
    clean_post_cache($post_id);
    if (gdhe_a3_snapshot($post_id) !== $snapshot) {
        return new WP_Error('gdhe_a3_restore_failed', 'A3 restore read-back did not match the immutable snapshot.');
    }
    return true;
}

function gdhe_a3_fail_and_restore(int $post_id, array $snapshot, string $message)
{
    $restored = gdhe_a3_restore_snapshot($post_id, $snapshot);
    if (is_wp_error($restored)) {
        return $restored;
    }
    return new WP_Error('gdhe_a3_apply_failed', $message);
}

function gdhe_a3_apply_post(int $post_id)
{
    $plan = gdhe_a3_plan_post($post_id);
    if ($plan['classification'] === 'current') {
        $result = array();
        $result['postId'] = $post_id;
        $result['changed'] = false;
        $result['classification'] = 'current';
        return $result;
    }
    if ($plan['classification'] !== 'convertible') {
        return new WP_Error('gdhe_a3_ambiguous', 'A3 refused a record without an explicit reversible mapping.', $plan);
    }
    if (get_post_meta($post_id, GDHE_A3_MIGRATION_BACKUP, true) !== '') {
        return new WP_Error('gdhe_a3_backup_exists', 'A3 refused to overwrite an existing rollback snapshot.');
    }
    $snapshot = gdhe_a3_snapshot($post_id);
    if (!is_array($snapshot['post'] ?? null)) {
        return new WP_Error('gdhe_a3_snapshot_failed', 'A3 could not snapshot the source post.');
    }
    $encoded = wp_json_encode($snapshot);
    if (!is_string($encoded) || $encoded === '') {
        return new WP_Error('gdhe_a3_snapshot_failed', 'A3 could not encode the rollback snapshot.');
    }
    $backup_write = update_post_meta($post_id, GDHE_A3_MIGRATION_BACKUP, wp_slash($encoded));
    if ($backup_write === false || get_post_meta($post_id, GDHE_A3_MIGRATION_BACKUP, true) !== $encoded) {
        return gdhe_a3_fail_and_restore($post_id, $snapshot, 'A3 could not persist the rollback snapshot.');
    }
    $legacy_relationships = get_field('relationships', $post_id, true);
    $expected_relationships = gdhe_a3_normalize_relationships(
        gdhe_a3_remap_relationships($legacy_relationships)
    );

    $post_update = array();
    $post_update['ID'] = $post_id;
    $post_update['post_type'] = $plan['targetType'];
    $updated = gdhe_a3_failure_injected('post_update', $post_id)
        ? new WP_Error('gdhe_a3_injected_failure', 'Injected post update failure.')
        : wp_update_post($post_update, true);
    if (is_wp_error($updated)) {
        return gdhe_a3_fail_and_restore($post_id, $snapshot, 'A3 post update failed and the source record was restored.');
    }
    $slug = (string) gdhe_object_value(get_post($post_id), 'post_name', '');
    $expected_path = gdhe_a3_target_path($plan['targetType'], $slug);
    update_post_meta($post_id, '_gdhe_public_path', $expected_path);
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, $post_id);
    update_field('field_gdhe_template_key', $plan['targetType'], $post_id);
    update_field('field_gdhe_relationships', $expected_relationships, $post_id);
    update_post_meta($post_id, GDHE_A3_MIGRATION_MARKER, GDHE_A3_MIGRATION_VERSION);

    $verified = get_post_type($post_id) === $plan['targetType']
        && get_field('schema_version', $post_id, true) === GDHE_SCHEMA_VERSION
        && get_post_meta($post_id, '_gdhe_public_path', true) === $expected_path
        && get_field('template_key', $post_id, true) === $plan['targetType']
        && gdhe_a3_normalize_relationships(get_field('relationships', $post_id, true)) === $expected_relationships
        && get_post_meta($post_id, GDHE_A3_MIGRATION_MARKER, true) === GDHE_A3_MIGRATION_VERSION;
    foreach (array('path_readback', 'template_readback', 'relations_readback') as $stage) {
        if (gdhe_a3_failure_injected($stage, $post_id)) {
            $verified = false;
        }
    }
    if (!$verified) {
        return gdhe_a3_fail_and_restore(
            $post_id,
            $snapshot,
            'A3 write/read-back verification failed and the source record was restored.'
        );
    }
    $result = array();
    $result['postId'] = $post_id;
    $result['changed'] = true;
    $result['classification'] = 'migrated';
    $result['targetType'] = $plan['targetType'];
    return $result;
}

function gdhe_a3_rollback_post(int $post_id)
{
    $encoded = get_post_meta($post_id, GDHE_A3_MIGRATION_BACKUP, true);
    $snapshot = is_string($encoded) ? json_decode($encoded, true) : null;
    if (!is_array($snapshot) || !is_array($snapshot['post'] ?? null)) {
        $already_restored = in_array(get_post_type($post_id), gdhe_a3_legacy_types(), true)
            && get_post_meta($post_id, GDHE_A3_MIGRATION_MARKER, true) === ''
            && get_post_meta($post_id, GDHE_A3_MIGRATION_BACKUP, true) === '';
        if ($already_restored) {
            $result = array();
            $result['postId'] = $post_id;
            $result['changed'] = false;
            $result['classification'] = 'already_rolled_back';
            return $result;
        }
        return new WP_Error('gdhe_a3_backup_invalid', 'A3 rollback snapshot is missing or invalid.');
    }
    $restored = gdhe_a3_restore_snapshot($post_id, $snapshot);
    if (is_wp_error($restored)) {
        return $restored;
    }
    $result = array();
    $result['postId'] = $post_id;
    $result['changed'] = true;
    $result['classification'] = 'rolled_back';
    return $result;
}

if (defined('WP_CLI') && WP_CLI) {
    final class GDHE_A3_Migration_Command
    {
        public function __invoke(array $args, array $assoc_args): void
        {
            $mode = $args[0] ?? 'dry-run';
            $ids = isset($assoc_args['ids'])
                ? array_values(array_filter(array_map('intval', explode(',', (string) $assoc_args['ids']))))
                : null;
            if ($mode === 'inventory' || $mode === 'dry-run') {
                WP_CLI::line(wp_json_encode(gdhe_a3_inventory($ids), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                return;
            }
            if ($ids === null || $ids === array()) {
                WP_CLI::error('A3 apply and rollback require an explicit ids allowlist.');
            }
            $results = array();
            foreach ($ids as $post_id) {
                if ($mode === 'apply') {
                    $result = gdhe_a3_apply_post($post_id);
                } elseif ($mode === 'rollback') {
                    $result = gdhe_a3_rollback_post($post_id);
                } else {
                    $result = new WP_Error('gdhe_a3_mode_invalid', 'Unknown A3 migration mode.');
                }
                if (is_wp_error($result)) {
                    WP_CLI::error((string) call_user_func(array($result, 'get_error_message')));
                }
                $results[] = $result;
            }
            WP_CLI::line(wp_json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }
    }
    WP_CLI::add_command('gdhe a3-migrate', 'GDHE_A3_Migration_Command');
}
