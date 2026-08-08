<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_TASK023_FIXTURE_VERSION = 'TASK-023-RELATED-PRODUCT-CARD-P1-R1';
const GDHE_TASK023_FIXTURE_OPTION = 'gdhe_task023_fixture_manifest';
const GDHE_TASK023_FIXTURE_MARKER = '_gdhe_task023_fixture_marker';

function gdhe_task023_target_definitions(): array
{
    return array(
        'detail_alpha' => array('publish', 'Detail Alpha', 'detail_product', 'active'),
        'accessory_beta' => array('publish', 'Accessory Beta', 'catalog_accessory', 'active'),
        'detail_gamma' => array('publish', 'Detail Gamma', 'detail_product', 'active'),
        'accessory_delta' => array('publish', 'Accessory Delta', 'catalog_accessory', 'active'),
        'unpublished' => array('draft', 'Unpublished', 'detail_product', 'active'),
        'revoked' => array('publish', 'Revoked', 'detail_product', 'active'),
        'hostile_media' => array('publish', 'Hostile Media', 'detail_product', 'active'),
        'missing_unit' => array('publish', 'Missing Unit', 'catalog_accessory', 'active'),
        'action_mismatch' => array('publish', 'Action Mismatch', 'catalog_accessory', 'discontinued'),
        'uuid_conflict_alpha' => array('publish', 'UUID Conflict Alpha', 'detail_product', 'active'),
    );
}

function gdhe_task023_card_source(string $key, string $kind, string $lifecycle): array
{
    $source = array(
        'version' => GDHE_PRODUCT_CARD_SCHEMA_VERSION,
        'sourceClass' => 'test_candidate',
        'websiteEligible' => $key !== 'revoked',
        'kind' => $kind,
        'lifecycle' => $lifecycle,
        'image' => array(
            'id' => sprintf('62000000-0000-4000-8000-%012d', crc32($key)),
            'url' => 'https://media.gdhe.example/task-023/' . str_replace('_', '-', $key) . '.webp',
            'width' => 1200,
            'height' => 800,
            'alt' => 'Protected synthetic TASK-023 related product image',
            'protected' => $key !== 'hostile_media',
        ),
        'primaryCategory' => array(
            'id' => '61000000-0000-4000-8000-000000000001',
            'label' => 'TASK-023 Related Products',
            'publicPath' => '/products/accessories/task-023-related-products/',
            'filterSlug' => 'task-023-related-products',
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
    return $source;
}

function gdhe_task023_cleanup_fixtures(?array $known_manifest = null): array
{
    $manifest = is_array($known_manifest)
        ? $known_manifest
        : get_option(GDHE_TASK023_FIXTURE_OPTION, array());
    $deleted = array('posts' => 0, 'terms' => 0);
    foreach (array_values($manifest['posts'] ?? array()) as $post_id) {
        if (get_post((int) $post_id) && wp_delete_post((int) $post_id, true)) {
            $deleted['posts']++;
        }
    }
    $query = new WP_Query(array(
        'post_type' => array_merge(gdhe_public_post_types(), array('attachment')),
        'post_status' => 'any',
        'posts_per_page' => -1,
        'meta_query' => array(array(
            'key' => GDHE_TASK023_FIXTURE_MARKER,
            'value' => GDHE_TASK023_FIXTURE_VERSION,
        )),
    ));
    foreach ((array) gdhe_object_value($query, 'posts', array()) as $post) {
        $post_id = (int) gdhe_object_value($post, 'ID', 0);
        if (get_post($post_id) && wp_delete_post($post_id, true)) {
            $deleted['posts']++;
        }
    }
    foreach (array(
        'category' => 'product_category',
        'series' => 'product_series',
        'installation' => 'installation_type',
    ) as $key => $taxonomy) {
        $term_id = (int) ($manifest['terms'][$key] ?? 0);
        if ($term_id !== 0 && term_exists($term_id, $taxonomy)) {
            $result = wp_delete_term($term_id, $taxonomy);
            if ($result && !is_wp_error($result)) {
                $deleted['terms']++;
            }
        }
    }
    delete_option(GDHE_TASK023_FIXTURE_OPTION);
    return $deleted;
}

function gdhe_task023_record_post(array &$manifest, string $key, int $post_id): void
{
    update_post_meta($post_id, GDHE_TASK023_FIXTURE_MARKER, GDHE_TASK023_FIXTURE_VERSION);
    $manifest['posts'][$key] = $post_id;
    update_option(GDHE_TASK023_FIXTURE_OPTION, $manifest, false);
}

function gdhe_task023_create_post(
    string $key,
    string $status,
    string $title,
    string $path,
    string $public_id,
    int $order
) {
    $post_id = wp_insert_post(array(
        'post_type' => 'product',
        'post_status' => $status,
        'post_title' => 'TASK-023 ' . $title,
        'post_name' => 'task-023-' . str_replace('_', '-', $key),
        'post_excerpt' => 'Synthetic TASK-023 related-product test candidate.',
        'post_date' => '2026-08-06 11:00:00',
        'post_date_gmt' => '2026-08-06 03:00:00',
        'post_modified' => sprintf('2026-08-06 11:%02d:00', $order),
        'post_modified_gmt' => sprintf('2026-08-06 03:%02d:00', $order),
        'menu_order' => $order,
    ), true);
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    update_post_meta($post_id, '_gdhe_public_id', $public_id);
    if ($path === '') {
        delete_post_meta($post_id, '_gdhe_public_path');
    } else {
        update_post_meta($post_id, '_gdhe_public_path', $path);
    }
    return $post_id;
}

function gdhe_task023_create_fixtures()
{
    $existing = get_option(GDHE_TASK023_FIXTURE_OPTION, array());
    if (is_array($existing) && !empty($existing['posts'])) {
        return new WP_Error('gdhe_task023_fixture_exists', 'TASK-023 fixtures already exist.');
    }
    $manifest = array(
        'fixtureVersion' => GDHE_TASK023_FIXTURE_VERSION,
        'posts' => array(),
        'terms' => array(),
        'orderedRelations' => array(),
    );
    update_option(GDHE_TASK023_FIXTURE_OPTION, $manifest, false);

    $landing = wp_insert_post(array(
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_title' => 'TASK-023 Related Products',
        'post_name' => 'task-023-related-products-landing',
        'post_excerpt' => 'Synthetic TASK-023 category landing.',
        'post_date' => '2026-08-06 10:00:00',
        'post_date_gmt' => '2026-08-06 02:00:00',
    ), true);
    if (is_wp_error($landing)) {
        gdhe_task023_cleanup_fixtures($manifest);
        return $landing;
    }
    $landing = (int) $landing;
    gdhe_task023_record_post($manifest, 'category_landing', $landing);
    update_post_meta($landing, '_gdhe_public_id', '61000000-0000-4000-8000-000000000001');
    update_post_meta($landing, '_gdhe_public_path', '/products/accessories/task-023-related-products/');
    gdhe_a3_update_common_fields(
        $landing,
        'standard',
        gdhe_a3_fixture_relations(),
        array(gdhe_a3_fixture_module('64000000-0000-4000-8000-000000000001', 'TASK-023 category'))
    );

    foreach (array(
        'category' => array('product_category', 'TASK-023 Related Products', 'task-023-related-products'),
        'series' => array('product_series', 'TASK-023 Series', 'task-023-series'),
        'installation' => array('installation_type', 'TASK-023 Installation', 'task-023-installation'),
    ) as $key => $definition) {
        $term = wp_insert_term($definition[1], $definition[0], array('slug' => $definition[2]));
        if (is_wp_error($term)) {
            gdhe_task023_cleanup_fixtures($manifest);
            return $term;
        }
        $manifest['terms'][$key] = (int) $term['term_id'];
        update_option(GDHE_TASK023_FIXTURE_OPTION, $manifest, false);
    }

    $source = gdhe_task023_create_post(
        'source',
        'publish',
        'FGD X15+PVC Source',
        '/products/fgd-x15-pvc/',
        '60000000-0000-4000-8000-000000000001',
        0
    );
    if (is_wp_error($source)) {
        gdhe_task023_cleanup_fixtures($manifest);
        return $source;
    }
    gdhe_task023_record_post($manifest, 'source', (int) $source);

    $order = 1;
    foreach (gdhe_task023_target_definitions() as $key => $definition) {
        $kind = $definition[2];
        $path = $kind === 'detail_product'
            ? '/products/task-023-' . str_replace('_', '-', $key) . '/'
            : '';
        $public_id = $key === 'uuid_conflict_alpha'
            ? '60000000-0000-4000-8000-000000000002'
            : sprintf('60000000-0000-4000-8000-%012d', $order + 1);
        $post_id = gdhe_task023_create_post(
            $key,
            $definition[0],
            $definition[1],
            $path,
            $public_id,
            $order
        );
        if (is_wp_error($post_id)) {
            gdhe_task023_cleanup_fixtures($manifest);
            return $post_id;
        }
        $post_id = (int) $post_id;
        gdhe_task023_record_post($manifest, $key, $post_id);
        update_post_meta(
            $post_id,
            GDHE_PRODUCT_CARD_SOURCE_META,
            wp_json_encode(
                gdhe_task023_card_source($key, $kind, $definition[3]),
                JSON_UNESCAPED_SLASHES
            )
        );
        if ($kind === 'catalog_accessory') {
            $direct_quote = array(
                'version' => GDHE_RELATED_PRODUCT_CARD_SCHEMA_VERSION,
                'directQuote' => $key === 'missing_unit'
                    ? array()
                    : array('quantityUnit' => 'piece'),
            );
            update_post_meta(
                $post_id,
                GDHE_RELATED_PRODUCT_CARD_SOURCE_META,
                wp_json_encode($direct_quote, JSON_UNESCAPED_SLASHES)
            );
        }
        $order++;
    }

    foreach ($manifest['posts'] as $key => $post_id) {
        if ($key === 'category_landing') {
            continue;
        }
        wp_set_object_terms($post_id, array($manifest['terms']['category']), 'product_category');
        wp_set_object_terms($post_id, array($manifest['terms']['series']), 'product_series');
        wp_set_object_terms($post_id, array($manifest['terms']['installation']), 'installation_type');
        gdhe_a3_update_common_fields(
            $post_id,
            'product',
            gdhe_a3_fixture_relations(),
            array(gdhe_a3_fixture_module(
                sprintf('64000000-0000-4000-8000-%012d', $order + 1),
                'TASK-023 synthetic product'
            ))
        );
        update_field(
            'field_gdhe_product_details',
            gdhe_a3_product_details('task-023-' . str_replace('_', '-', $key)),
            $post_id
        );
        $order++;
    }

    $manifest['orderedRelations'] = array(
        $manifest['posts']['detail_alpha'],
        $manifest['posts']['accessory_beta'],
        $manifest['posts']['detail_gamma'],
        $manifest['posts']['accessory_delta'],
        $manifest['posts']['source'],
        $manifest['posts']['detail_alpha'],
        $manifest['posts']['unpublished'],
        $manifest['posts']['revoked'],
        $manifest['posts']['hostile_media'],
        $manifest['posts']['missing_unit'],
        $manifest['posts']['action_mismatch'],
    );
    update_field(
        'field_gdhe_relationships',
        gdhe_a3_fixture_relations(array('products' => $manifest['orderedRelations'])),
        (int) $manifest['posts']['source']
    );
    update_option(GDHE_TASK023_FIXTURE_OPTION, $manifest, false);
    return $manifest;
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gdhe task023-fixtures create', function (): void {
        $result = gdhe_task023_create_fixtures();
        if (is_wp_error($result)) {
            WP_CLI::error((string) $result->get_error_message());
        }
        WP_CLI::line(wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe task023-fixtures show', function (): void {
        WP_CLI::line(wp_json_encode(
            get_option(GDHE_TASK023_FIXTURE_OPTION, array()),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ));
    });
    WP_CLI::add_command('gdhe task023-fixtures cleanup', function (): void {
        WP_CLI::line(wp_json_encode(
            gdhe_task023_cleanup_fixtures(),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ));
    });
}
