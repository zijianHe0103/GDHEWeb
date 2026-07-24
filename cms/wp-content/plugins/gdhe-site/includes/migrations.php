<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_A1_MIGRATION_VERSION = '2.0.0';
const GDHE_A1_BACKUP_META = '_gdhe_a1_modules_backup';
const GDHE_A1_VERSION_META = '_gdhe_a1_schema_version';

function gdhe_a1_post_types(): array
{
    $schema = gdhe_load_json_config('config/schema.v3.json');
    $public_types = isset($schema['publicTypes']) && is_array($schema['publicTypes'])
        ? $schema['publicTypes']
        : array();
    return array_merge(array('page', 'post'), $public_types);
}

function gdhe_a1_candidate_ids(): array
{
    $args = array();
    $args['post_type'] = gdhe_a1_post_types();
    $args['post_status'] = array('publish', 'draft', 'pending', 'private', 'future');
    $args['numberposts'] = -1;
    $args['fields'] = 'ids';
    $args['orderby'] = 'ID';
    $args['order'] = 'ASC';
    return get_posts($args);
}

function gdhe_a1_postmeta_table(): string
{
    global $wpdb;
    return call_user_func(array($wpdb, 'get_blog_prefix')) . 'postmeta';
}

function gdhe_a1_raw_module_meta(int $post_id): array
{
    global $wpdb;

    $table = gdhe_a1_postmeta_table();
    $sql = "SELECT meta_key, meta_value FROM {$table} WHERE post_id = %d AND (meta_key = 'schema_version' OR meta_key = '_schema_version' OR meta_key = 'modules' OR meta_key = '_modules' OR meta_key LIKE 'modules\\_%%' OR meta_key LIKE '\\_modules\\_%%') ORDER BY meta_id ASC";
    $prepared = call_user_func(array($wpdb, 'prepare'), $sql, $post_id);
    $rows = call_user_func(array($wpdb, 'get_results'), $prepared, ARRAY_A);
    return is_array($rows) ? $rows : array();
}

function gdhe_a1_legacy_tables(int $post_id): array
{
    $tables = array();
    foreach (gdhe_a1_raw_module_meta($post_id) as $row) {
        if (preg_match('/^modules_([0-9]+)_table_data$/', $row['meta_key'], $matches) === 1) {
            $tables[(int) $matches[1]] = (string) $row['meta_value'];
        }
    }
    return $tables;
}

function gdhe_a1_plan_post(int $post_id): array
{
    $modules = function_exists('get_field') ? get_field('modules', $post_id, true) : array();
    $modules = is_array($modules) ? $modules : array();
    $legacy_tables = gdhe_a1_legacy_tables($post_id);
    $content_schema_version = function_exists('get_field')
        ? get_field('schema_version', $post_id, true)
        : '';
    $reasons = array();
    $changed = false;

    foreach (array_keys($modules) as $index) {
        if (!is_array($modules[$index])) {
            $reasons[] = 'module_not_object:' . $index;
            continue;
        }
        $layout = gdhe_module_layout($modules[$index]);
        if ($layout === 'data_table' && isset($legacy_tables[$index])) {
            $parsed = gdhe_parse_legacy_table($legacy_tables[$index]);
            if (is_wp_error($parsed)) {
                $code = call_user_func(array($parsed, 'get_error_code'));
                $reasons[] = 'ambiguous_data_table:' . $index . ':' . $code;
                continue;
            }
            $modules[$index]['columns'] = $parsed['columns'];
            $modules[$index]['rows'] = $parsed['rows'];
            $changed = true;
        }
    }

    $prepared = gdhe_prepare_modules_for_save($modules, $post_id, array());
    if ($prepared !== $modules) {
        $changed = true;
    }
    if ($modules !== array() && $content_schema_version !== GDHE_SCHEMA_VERSION) {
        $changed = true;
    }
    $validation = gdhe_validate_module_collection($prepared, false);
    if (is_wp_error($validation)) {
        $reasons[] = call_user_func(array($validation, 'get_error_code'));
    }

    if ($reasons !== array()) {
        $classification = 'ambiguous';
    } elseif (get_post_meta($post_id, GDHE_A1_VERSION_META, true) === GDHE_A1_MIGRATION_VERSION) {
        $classification = 'current';
        $changed = false;
    } elseif ($modules === array() && $legacy_tables === array()) {
        $classification = 'no_modules';
        $changed = false;
    } else {
        $classification = $changed ? 'convertible' : 'compatible';
    }

    $plan = array();
    $plan['postId'] = $post_id;
    $plan['postType'] = get_post_type($post_id);
    $plan['status'] = get_post_status($post_id);
    $plan['moduleCount'] = count($modules);
    $plan['legacyTableCount'] = count($legacy_tables);
    $plan['classification'] = $classification;
    $plan['wouldWrite'] = $changed && $classification !== 'ambiguous';
    $plan['reasons'] = $reasons;
    $plan['modules'] = $prepared;
    return $plan;
}

function gdhe_a1_inventory(?array $post_ids = null): array
{
    $post_ids = $post_ids === null ? gdhe_a1_candidate_ids() : $post_ids;
    $records = array();
    foreach ($post_ids as $post_id) {
        $records[] = gdhe_a1_plan_post((int) $post_id);
    }
    return $records;
}

function gdhe_a1_result(int $post_id, bool $changed, string $classification): array
{
    $result = array();
    $result['postId'] = $post_id;
    $result['changed'] = $changed;
    $result['classification'] = $classification;
    return $result;
}

function gdhe_a1_delete_legacy_table_meta(int $post_id): void
{
    global $wpdb;

    $table = gdhe_a1_postmeta_table();
    $sql = "DELETE FROM {$table} WHERE post_id = %d AND (meta_key LIKE 'modules\\_%%\\_table_data' OR meta_key LIKE '\\_modules\\_%%\\_table_data')";
    $prepared = call_user_func(array($wpdb, 'prepare'), $sql, $post_id);
    call_user_func(array($wpdb, 'query'), $prepared);
}

function gdhe_a1_apply_post(int $post_id)
{
    $plan = gdhe_a1_plan_post($post_id);
    if ($plan['classification'] === 'ambiguous') {
        return new WP_Error('gdhe_a1_ambiguous', 'Migration refused an ambiguous record.', $plan);
    }
    if ($plan['classification'] === 'current' || !$plan['wouldWrite']) {
        return gdhe_a1_result($post_id, false, $plan['classification']);
    }

    $snapshot = gdhe_a1_raw_module_meta($post_id);
    update_post_meta($post_id, GDHE_A1_BACKUP_META, wp_slash(wp_json_encode($snapshot)));
    update_field('field_gdhe_modules', $plan['modules'], $post_id);
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, $post_id);
    $stored = get_field('modules', $post_id, true);
    $stored_schema_version = get_field('schema_version', $post_id, true);
    $stored_validation = gdhe_validate_module_collection($stored, false);
    if (!is_array($stored)
        || count($stored) !== count($plan['modules'])
        || $stored_schema_version !== GDHE_SCHEMA_VERSION
        || is_wp_error($stored_validation)) {
        gdhe_a1_restore_raw_module_meta($post_id, $snapshot);
        delete_post_meta($post_id, GDHE_A1_BACKUP_META);
        return new WP_Error('gdhe_a1_update_failed', 'SCF did not persist a valid migrated module value.');
    }

    gdhe_a1_delete_legacy_table_meta($post_id);
    update_post_meta($post_id, GDHE_A1_VERSION_META, GDHE_A1_MIGRATION_VERSION);
    return gdhe_a1_result($post_id, true, $plan['classification']);
}

function gdhe_a1_restore_raw_module_meta(int $post_id, array $snapshot): void
{
    global $wpdb;

    $table = gdhe_a1_postmeta_table();
    $sql = "DELETE FROM {$table} WHERE post_id = %d AND (meta_key = 'schema_version' OR meta_key = '_schema_version' OR meta_key = 'modules' OR meta_key = '_modules' OR meta_key LIKE 'modules\\_%%' OR meta_key LIKE '\\_modules\\_%%')";
    $prepared = call_user_func(array($wpdb, 'prepare'), $sql, $post_id);
    call_user_func(array($wpdb, 'query'), $prepared);

    foreach ($snapshot as $row) {
        if (isset($row['meta_key']) && array_key_exists('meta_value', $row)) {
            $data = array();
            $data['post_id'] = $post_id;
            $data['meta_key'] = (string) $row['meta_key'];
            $data['meta_value'] = (string) $row['meta_value'];
            call_user_func(array($wpdb, 'insert'), $table, $data, array('%d', '%s', '%s'));
        }
    }
    clean_post_cache($post_id);
    if (function_exists('acf_flush_value_cache')) {
        acf_flush_value_cache($post_id, 'modules');
        acf_flush_value_cache($post_id, 'schema_version');
    }
}

function gdhe_a1_rollback_post(int $post_id)
{
    $encoded = get_post_meta($post_id, GDHE_A1_BACKUP_META, true);
    if (!is_string($encoded) || $encoded === '') {
        return gdhe_a1_result($post_id, false, 'no_backup');
    }
    $snapshot = json_decode($encoded, true);
    if (!is_array($snapshot)) {
        return new WP_Error('gdhe_a1_backup_invalid', 'Migration backup meta is not valid JSON.');
    }

    gdhe_a1_restore_raw_module_meta($post_id, $snapshot);
    delete_post_meta($post_id, GDHE_A1_VERSION_META);
    delete_post_meta($post_id, GDHE_A1_BACKUP_META);
    return gdhe_a1_result($post_id, true, 'rolled_back');
}

if (defined('WP_CLI') && WP_CLI) {
    final class GDHE_A1_Migration_Command
    {
        public function __invoke(array $args, array $assoc_args): void
        {
            $mode = isset($args[0]) ? $args[0] : 'dry-run';
            $ids = isset($assoc_args['ids'])
                ? array_values(array_filter(array_map('intval', explode(',', (string) $assoc_args['ids']))))
                : null;

            if ($mode === 'inventory' || $mode === 'dry-run') {
                WP_CLI::line(wp_json_encode(gdhe_a1_inventory($ids), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                return;
            }
            if ($ids === null || $ids === array()) {
                WP_CLI::error('The apply and rollback modes require an explicit ids allowlist.');
            }

            $results = array();
            foreach ($ids as $post_id) {
                if ($mode === 'apply') {
                    $result = gdhe_a1_apply_post($post_id);
                } elseif ($mode === 'rollback') {
                    $result = gdhe_a1_rollback_post($post_id);
                } else {
                    $result = new WP_Error('gdhe_a1_mode_invalid', 'Unknown migration mode.');
                }
                if (is_wp_error($result)) {
                    WP_CLI::error(call_user_func(array($result, 'get_error_message')));
                }
                $results[] = $result;
            }
            WP_CLI::line(wp_json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }
    }

    WP_CLI::add_command('gdhe a1-migrate', 'GDHE_A1_Migration_Command');
}
