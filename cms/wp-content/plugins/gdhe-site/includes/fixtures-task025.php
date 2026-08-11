<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_TASK025_FIXTURE_VERSION = 'TASK-025-ARTICLE-NUMBER-BATCH-1';
const GDHE_TASK025_FIXTURE_OPTION = 'gdhe_task025_fixture_manifest';
const GDHE_TASK025_FIXTURE_MARKER = '_gdhe_task025_fixture_marker';

function gdhe_task025_record_post(array &$manifest, string $key, int $post_id): void
{
    update_post_meta($post_id, GDHE_TASK025_FIXTURE_MARKER, GDHE_TASK025_FIXTURE_VERSION);
    $manifest['posts'][$key] = $post_id;
    update_option(GDHE_TASK025_FIXTURE_OPTION, $manifest, false);
}

function gdhe_task025_product_card_source(string $key, string $kind): array
{
    return array(
        'version' => GDHE_PRODUCT_CARD_SCHEMA_VERSION,
        'sourceClass' => 'test_candidate',
        'websiteEligible' => true,
        'kind' => $kind,
        'lifecycle' => 'active',
        'image' => array(
            'id' => $key === 'source'
                ? '25000000-0000-4000-8000-000000000010'
                : '25000000-0000-4000-8000-000000000011',
            'url' => 'https://media.gdhe.example/task-025/' . $key . '.webp',
            'width' => 1200,
            'height' => 800,
            'alt' => 'Protected synthetic TASK-025 product image',
            'protected' => true,
        ),
        'primaryCategory' => array(
            'id' => '25000000-0000-4000-8000-000000000001',
            'label' => 'TASK-025 Accessories',
            'publicPath' => '/products/accessories/task-025-accessories/',
            'filterSlug' => 'task-025-accessories',
        ),
        'series' => array(),
        'applications' => array(),
        'keyAttributes' => array(array(
            'key' => 'accessory_category',
            'label' => 'Category',
            'value' => 'Synthetic test candidate',
            'unit' => null,
        )),
    );
}

function gdhe_task025_create_card_post(
    string $key,
    string $title,
    string $model,
    string $kind,
    ?string $path,
    string $public_id,
    int $order,
    array $manifest
) {
    $post_id = wp_insert_post(array(
        'post_type' => 'product', 'post_status' => 'publish',
        'post_title' => $title, 'post_name' => 'task-025-' . $key,
        'post_excerpt' => 'Synthetic TASK-025 quote validation fixture.',
        'post_date' => '2026-08-11 09:00:00', 'post_date_gmt' => '2026-08-11 01:00:00',
        'post_modified' => sprintf('2026-08-11 09:%02d:00', $order),
        'post_modified_gmt' => sprintf('2026-08-11 01:%02d:00', $order),
        'menu_order' => $order,
    ), true);
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    update_post_meta($post_id, '_gdhe_public_id', $public_id);
    if ($path === null) {
        delete_post_meta($post_id, '_gdhe_public_path');
    } else {
        update_post_meta($post_id, '_gdhe_public_path', $path);
    }
    update_post_meta($post_id, GDHE_PRODUCT_CARD_SOURCE_META, wp_json_encode(
        gdhe_task025_product_card_source($key, $kind),
        JSON_UNESCAPED_SLASHES
    ));
    wp_set_object_terms($post_id, array((int) $manifest['terms']['category']), 'product_category');
    wp_set_object_terms($post_id, array((int) $manifest['terms']['series']), 'product_series');
    wp_set_object_terms($post_id, array((int) $manifest['terms']['installation']), 'installation_type');
    gdhe_a3_update_common_fields(
        $post_id,
        'product',
        gdhe_a3_fixture_relations(),
        array(gdhe_a3_fixture_module(
            sprintf('25000000-0000-4000-8000-%012d', $order + 100),
            'TASK-025 synthetic product'
        ))
    );
    $details = gdhe_a3_product_details('task-025-' . $key);
    $details['model'] = $model;
    update_field('field_gdhe_product_details', $details, $post_id);
    return $post_id;
}

function gdhe_task025_cleanup_fixtures(?array $known_manifest = null): array
{
    $manifest = is_array($known_manifest) ? $known_manifest : get_option(GDHE_TASK025_FIXTURE_OPTION, array());
    $deleted = array('posts' => 0, 'terms' => 0, 'options' => 0);
    $ids = array_values($manifest['posts'] ?? array());
    $query = new WP_Query(array(
        'post_type' => array_merge(gdhe_public_post_types(), array('attachment')),
        'post_status' => 'any', 'posts_per_page' => -1,
        'meta_query' => array(array('key' => GDHE_TASK025_FIXTURE_MARKER, 'value' => GDHE_TASK025_FIXTURE_VERSION)),
    ));
    foreach ((array) $query->posts as $post) {
        $ids[] = (int) $post->ID;
    }
    foreach (array_unique(array_map('intval', $ids)) as $post_id) {
        if (get_post($post_id) && wp_delete_post($post_id, true)) {
            $deleted['posts']++;
        }
    }
    foreach (array('category' => 'product_category', 'series' => 'product_series', 'installation' => 'installation_type') as $key => $taxonomy) {
        $term_id = (int) ($manifest['terms'][$key] ?? 0);
        if ($term_id && term_exists($term_id, $taxonomy) && wp_delete_term($term_id, $taxonomy)) {
            $deleted['terms']++;
        }
    }
    if (delete_option(GDHE_TASK025_FIXTURE_OPTION)) {
        $deleted['options']++;
    }
    return $deleted;
}

function gdhe_task025_create_fixtures()
{
    $existing = get_option(GDHE_TASK025_FIXTURE_OPTION, array());
    if (is_array($existing) && !empty($existing['posts'])) {
        return new WP_Error('gdhe_task025_fixture_exists', 'TASK-025 fixtures already exist.');
    }
    $manifest = array('fixtureVersion' => GDHE_TASK025_FIXTURE_VERSION, 'posts' => array(), 'terms' => array());
    update_option(GDHE_TASK025_FIXTURE_OPTION, $manifest, false);
    $landing = wp_insert_post(array(
        'post_type' => 'page', 'post_status' => 'publish',
        'post_title' => 'TASK-025 Accessories', 'post_name' => 'task-025-accessories',
        'post_excerpt' => 'Synthetic TASK-025 category landing.',
    ), true);
    if (is_wp_error($landing)) {
        gdhe_task025_cleanup_fixtures($manifest);
        return $landing;
    }
    gdhe_task025_record_post($manifest, 'category_landing', (int) $landing);
    update_post_meta((int) $landing, '_gdhe_public_id', '25000000-0000-4000-8000-000000000001');
    update_post_meta((int) $landing, '_gdhe_public_path', '/products/accessories/task-025-accessories/');
    gdhe_a3_update_common_fields((int) $landing, 'standard', gdhe_a3_fixture_relations(), array(
        gdhe_a3_fixture_module('25000000-0000-4000-8000-000000000002', 'TASK-025 category'),
    ));
    foreach (array(
        'category' => array('product_category', 'TASK-025 Accessories', 'task-025-accessories'),
        'series' => array('product_series', 'TASK-025 Series', 'task-025-series'),
        'installation' => array('installation_type', 'TASK-025 Installation', 'task-025-installation'),
    ) as $key => $definition) {
        $term = wp_insert_term($definition[1], $definition[0], array('slug' => $definition[2]));
        if (is_wp_error($term)) {
            gdhe_task025_cleanup_fixtures($manifest);
            return $term;
        }
        $manifest['terms'][$key] = (int) $term['term_id'];
        update_option(GDHE_TASK025_FIXTURE_OPTION, $manifest, false);
    }
    $configured = wp_insert_post(array(
        'post_type' => 'product', 'post_status' => 'publish',
        'post_title' => 'FGD X15+PVC Track', 'post_name' => 'task-025-fgd-x15-pvc',
        'post_excerpt' => 'Synthetic TASK-025 configured product.',
        'post_date' => '2026-08-11 09:00:00', 'post_date_gmt' => '2026-08-11 01:00:00',
        'post_modified' => '2026-08-11 09:01:00', 'post_modified_gmt' => '2026-08-11 01:01:00',
    ), true);
    if (is_wp_error($configured)) {
        gdhe_task025_cleanup_fixtures($manifest);
        return $configured;
    }
    $configured = (int) $configured;
    gdhe_task025_record_post($manifest, 'configured', $configured);
    update_post_meta($configured, '_gdhe_public_id', '21000000-0000-4000-8000-000000000001');
    update_post_meta($configured, '_gdhe_public_path', '/products/fgd-x15-pvc/');
    update_post_meta($configured, 'product_details', array('model' => 'FGD X15+PVC'));
    update_post_meta($configured, GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META, wp_json_encode(gdhe_task021_valid_source(), JSON_UNESCAPED_SLASHES));
    gdhe_sync_public_article_number_index($configured);

    $source = gdhe_task025_create_card_post(
        'source', 'TASK-025 Related Source', 'TASK-025 Source', 'detail_product',
        '/products/task-025-related-source/', '25000000-0000-4000-8000-000000000020', 2, $manifest
    );
    $accessory = gdhe_task025_create_card_post(
        'accessory', 'TASK-025 Synthetic Accessory', 'TASK-025 ACCESSORY', 'catalog_accessory',
        null, '25000000-0000-4000-8000-000000000021', 3, $manifest
    );
    if (is_wp_error($source) || is_wp_error($accessory)) {
        gdhe_task025_cleanup_fixtures($manifest);
        return is_wp_error($source) ? $source : $accessory;
    }
    gdhe_task025_record_post($manifest, 'source', (int) $source);
    gdhe_task025_record_post($manifest, 'accessory', (int) $accessory);
    update_post_meta((int) $accessory, GDHE_RELATED_PRODUCT_CARD_SOURCE_META, wp_json_encode(array(
        'version' => '1.0.0', 'directQuote' => array('quantityUnit' => 'piece'),
    ), JSON_UNESCAPED_SLASHES));
    update_post_meta((int) $accessory, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, wp_json_encode(array(
        'version' => '1.0.0', 'sourceClass' => 'test_candidate', 'websiteEligible' => true,
        'product' => array(
            'id' => '25000000-0000-4000-8000-000000000021',
            'model' => 'TASK-025 ACCESSORY', 'name' => 'TASK-025 Synthetic Accessory',
            'publicPath' => null, 'productKind' => 'catalog_accessory', 'quantityUnit' => 'piece',
        ),
        'articleNumber' => 'GDHEPRD000901', 'quantityUnit' => 'piece',
    ), JSON_UNESCAPED_SLASHES));
    gdhe_sync_public_article_number_index((int) $accessory);
    update_field('field_gdhe_relationships', gdhe_a3_fixture_relations(array('products' => array((int) $accessory))), (int) $source);
    update_option(GDHE_TASK025_FIXTURE_OPTION, $manifest, false);
    return $manifest;
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gdhe task025-fixtures create', function (): void {
        $result = gdhe_task025_create_fixtures();
        is_wp_error($result) ? WP_CLI::error($result->get_error_message()) : WP_CLI::line(wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe task025-fixtures show', function (): void {
        WP_CLI::line(wp_json_encode(get_option(GDHE_TASK025_FIXTURE_OPTION, array()), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe task025-fixtures cleanup', function (): void {
        WP_CLI::line(wp_json_encode(gdhe_task025_cleanup_fixtures(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
}
