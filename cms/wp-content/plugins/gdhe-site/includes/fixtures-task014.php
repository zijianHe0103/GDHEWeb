<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_TASK014_FIXTURE_VERSION = 'TASK-014-PRODUCT-CARD-1';
const GDHE_TASK014_FIXTURE_OPTION = 'gdhe_task014_fixture_manifest';
const GDHE_TASK014_FIXTURE_MARKER = '_gdhe_task014_fixture_marker';

function gdhe_task014_fixture_definition(
    string $key,
    string $status,
    string $title,
    string $path,
    string $id,
    string $kind,
    string $lifecycle
): array {
    return compact('key', 'status', 'title', 'path', 'id', 'kind', 'lifecycle');
}

function gdhe_task014_fixture_definitions(): array
{
    return array(
        gdhe_task014_fixture_definition(
            'detail_active',
            'publish',
            'TASK-014 Alpha Detail Active',
            '/products/task-014-alpha-detail-active/',
            '41000000-0000-4000-8000-000000000001',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'detail_discontinued',
            'publish',
            'TASK-014 Beta Detail Discontinued',
            '/products/task-014-beta-detail-discontinued/',
            '41000000-0000-4000-8000-000000000002',
            'detail_product',
            'discontinued'
        ),
        gdhe_task014_fixture_definition(
            'accessory_active',
            'publish',
            'TASK-014 Gamma Accessory Active',
            '',
            '41000000-0000-4000-8000-000000000003',
            'catalog_accessory',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'accessory_discontinued',
            'publish',
            'TASK-014 Delta Accessory Discontinued',
            '',
            '41000000-0000-4000-8000-000000000004',
            'catalog_accessory',
            'discontinued'
        ),
        gdhe_task014_fixture_definition(
            'missing_image',
            'publish',
            'TASK-014 Negative Missing Image',
            '/products/task-014-negative-missing-image/',
            '41000000-0000-4000-8000-000000000005',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'unprotected_image',
            'publish',
            'TASK-014 Negative Unprotected Image',
            '/products/task-014-negative-unprotected-image/',
            '41000000-0000-4000-8000-000000000006',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'missing_category',
            'publish',
            'TASK-014 Negative Missing Category',
            '/products/task-014-negative-missing-category/',
            '41000000-0000-4000-8000-000000000007',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'missing_uuid',
            'publish',
            'TASK-014 Negative Missing UUID',
            '/products/task-014-negative-missing-uuid/',
            '',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'invalid_kind',
            'publish',
            'TASK-014 Negative Invalid Kind',
            '/products/task-014-negative-invalid-kind/',
            '41000000-0000-4000-8000-000000000008',
            'unknown',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'invalid_lifecycle',
            'publish',
            'TASK-014 Negative Invalid Lifecycle',
            '/products/task-014-negative-invalid-lifecycle/',
            '41000000-0000-4000-8000-000000000009',
            'detail_product',
            'unknown'
        ),
        gdhe_task014_fixture_definition(
            'detail_missing_path',
            'publish',
            'TASK-014 Negative Detail Missing Path',
            '',
            '41000000-0000-4000-8000-00000000000a',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'accessory_with_path',
            'publish',
            'TASK-014 Negative Accessory With Path',
            '/products/task-014-negative-accessory-with-path/',
            '41000000-0000-4000-8000-00000000000b',
            'catalog_accessory',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'too_many_attributes',
            'publish',
            'TASK-014 Negative Too Many Attributes',
            '/products/task-014-negative-too-many-attributes/',
            '41000000-0000-4000-8000-00000000000c',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'source_action',
            'publish',
            'TASK-014 Negative Source Action',
            '/products/task-014-negative-source-action/',
            '41000000-0000-4000-8000-00000000000d',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'mismatched_reference_id',
            'publish',
            'TASK-014 Negative Mismatched Reference ID',
            '/products/task-014-negative-mismatched-reference-id/',
            '41000000-0000-4000-8000-00000000000f',
            'detail_product',
            'active'
        ),
        gdhe_task014_fixture_definition(
            'draft',
            'draft',
            'TASK-014 Negative Draft',
            '/products/task-014-negative-draft/',
            '41000000-0000-4000-8000-00000000000e',
            'detail_product',
            'active'
        ),
    );
}

function gdhe_task014_source(array $definition): array
{
    $image = array(
        'id' => '42000000-0000-4000-8000-' . substr($definition['id'] !== '' ? $definition['id'] : '000000000000', -12),
        'url' => 'https://media.gdhe.example/task-014/' . $definition['key'] . '.webp',
        'width' => 1200,
        'height' => 800,
        'alt' => 'Protected synthetic TASK-014 product card image',
        'protected' => true,
    );
    $category = array(
        'id' => '44000000-0000-4000-8000-000000000001',
        'label' => 'TASK-014 Card Products',
        'publicPath' => '/products/curtain-track-systems/task-014-card-products/',
        'filterSlug' => 'task-014-card-products',
    );
    $attribute = array(
        'key' => 'system_type',
        'label' => 'System type',
        'value' => 'Synthetic fixture',
        'unit' => null,
    );
    $source = array(
        'version' => GDHE_PRODUCT_CARD_SCHEMA_VERSION,
        'sourceClass' => 'test_candidate',
        'websiteEligible' => true,
        'kind' => $definition['kind'],
        'lifecycle' => $definition['lifecycle'],
        'image' => $image,
        'primaryCategory' => $category,
        'series' => array(),
        'applications' => array(),
        'keyAttributes' => array($attribute),
    );
    if ($definition['key'] === 'detail_active') {
        $source['series'] = array(array(
            'id' => '44000000-0000-4000-8000-000000000002',
            'label' => 'TASK-014 Series',
            'publicPath' => '/series/task-014-series/',
        ));
        $source['applications'] = array(array(
            'id' => '44000000-0000-4000-8000-000000000003',
            'label' => 'TASK-014 Application',
            'publicPath' => '/applications/task-014-application/',
        ));
    }
    if ($definition['key'] === 'missing_image') {
        $source['image'] = null;
    } elseif ($definition['key'] === 'unprotected_image') {
        $source['image']['protected'] = false;
    } elseif ($definition['key'] === 'missing_category') {
        $source['primaryCategory'] = null;
    } elseif ($definition['key'] === 'too_many_attributes') {
        $source['keyAttributes'] = array($attribute, $attribute, $attribute, $attribute);
    } elseif ($definition['key'] === 'source_action') {
        $source['action'] = array('mode' => 'direct_rfq');
    } elseif ($definition['key'] === 'mismatched_reference_id') {
        $mismatched = array(
            'id' => '43000000-0000-4000-8000-000000000099',
            'label' => 'TASK-014 Card Products',
            'publicPath' => '/products/curtain-track-systems/task-014-card-products/',
        );
        $source['primaryCategory']['id'] = $mismatched['id'];
        $source['series'] = array($mismatched);
        $source['applications'] = array($mismatched);
    }
    return $source;
}

function gdhe_task014_create_product(array $definition, int $order)
{
    $post = array(
        'post_type' => 'product',
        'post_status' => $definition['status'],
        'post_title' => $definition['title'],
        'post_name' => 'task-014-' . str_replace('_', '-', $definition['key']),
        'post_excerpt' => 'Synthetic TASK-014 ProductCard fixture.',
        'post_date' => '2026-07-29 16:00:00',
        'post_date_gmt' => '2026-07-29 08:00:00',
        'post_modified' => sprintf('2026-07-29 16:%02d:00', $order),
        'post_modified_gmt' => sprintf('2026-07-29 08:%02d:00', $order),
        'menu_order' => $order,
    );
    $post_id = wp_insert_post($post, true);
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    update_post_meta($post_id, GDHE_TASK014_FIXTURE_MARKER, GDHE_TASK014_FIXTURE_VERSION);
    if ($definition['id'] === '') {
        delete_post_meta($post_id, '_gdhe_public_id');
    } else {
        update_post_meta($post_id, '_gdhe_public_id', $definition['id']);
    }
    if ($definition['path'] === '') {
        delete_post_meta($post_id, '_gdhe_public_path');
    } else {
        update_post_meta($post_id, '_gdhe_public_path', $definition['path']);
    }
    update_post_meta(
        $post_id,
        GDHE_PRODUCT_CARD_SOURCE_META,
        wp_json_encode(gdhe_task014_source($definition), JSON_UNESCAPED_SLASHES)
    );
    return $post_id;
}

function gdhe_task014_cleanup_fixtures(?array $known_manifest = null): array
{
    $manifest = is_array($known_manifest)
        ? $known_manifest
        : get_option(GDHE_TASK014_FIXTURE_OPTION, array());
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
            'key' => GDHE_TASK014_FIXTURE_MARKER,
            'value' => GDHE_TASK014_FIXTURE_VERSION,
        )),
    ));
    foreach ((array) gdhe_object_value($query, 'posts', array()) as $post) {
        $post_id = (int) gdhe_object_value($post, 'ID', 0);
        if (get_post($post_id) && wp_delete_post($post_id, true)) {
            $deleted['posts']++;
        }
    }
    $taxonomies = array(
        'category' => 'product_category',
        'series' => 'product_series',
        'installation' => 'installation_type',
    );
    foreach ($taxonomies as $key => $taxonomy) {
        $term_id = (int) ($manifest['terms'][$key] ?? 0);
        if ($term_id !== 0 && term_exists($term_id, $taxonomy)) {
            $result = wp_delete_term($term_id, $taxonomy);
            if ($result && !is_wp_error($result)) {
                $deleted['terms']++;
            }
        }
    }
    delete_option(GDHE_TASK014_FIXTURE_OPTION);
    return $deleted;
}

function gdhe_task014_create_fixtures()
{
    $existing = get_option(GDHE_TASK014_FIXTURE_OPTION, array());
    if (is_array($existing) && !empty($existing['posts'])) {
        return new WP_Error('gdhe_task014_fixture_exists', 'TASK-014 fixtures already exist.');
    }
    $manifest = array(
        'fixtureVersion' => GDHE_TASK014_FIXTURE_VERSION,
        'posts' => array(),
        'terms' => array(),
    );
    update_option(GDHE_TASK014_FIXTURE_OPTION, $manifest, false);

    $landing = wp_insert_post(array(
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_title' => 'TASK-014 Card Products',
        'post_name' => 'task-014-card-products',
        'post_excerpt' => 'Synthetic category landing fixture.',
        'post_date' => '2026-07-29 15:00:00',
        'post_date_gmt' => '2026-07-29 07:00:00',
    ), true);
    if (is_wp_error($landing)) {
        gdhe_task014_cleanup_fixtures($manifest);
        return $landing;
    }
    $landing = (int) $landing;
    update_post_meta($landing, GDHE_TASK014_FIXTURE_MARKER, GDHE_TASK014_FIXTURE_VERSION);
    update_post_meta($landing, '_gdhe_public_id', '44000000-0000-4000-8000-000000000001');
    update_post_meta(
        $landing,
        '_gdhe_public_path',
        '/products/curtain-track-systems/task-014-card-products/'
    );
    gdhe_a3_update_common_fields(
        $landing,
        'standard',
        gdhe_a3_fixture_relations(),
        array(gdhe_a3_fixture_module('45000000-0000-4000-8000-000000000001', 'TASK-014 category'))
    );
    $manifest['posts']['category_landing'] = $landing;
    update_option(GDHE_TASK014_FIXTURE_OPTION, $manifest, false);

    $relation_landings = array(
        'series_landing' => array(
            'TASK-014 Series',
            'task-014-series-landing',
            '44000000-0000-4000-8000-000000000002',
            '/series/task-014-series/',
            '45000000-0000-4000-8000-000000000002',
        ),
        'application_landing' => array(
            'TASK-014 Application',
            'task-014-application',
            '44000000-0000-4000-8000-000000000003',
            '/applications/task-014-application/',
            '45000000-0000-4000-8000-000000000003',
        ),
    );
    foreach ($relation_landings as $key => $definition) {
        $post_id = wp_insert_post(array(
            'post_type' => 'page',
            'post_status' => 'publish',
            'post_title' => $definition[0],
            'post_name' => $definition[1],
            'post_excerpt' => 'Synthetic relation landing fixture.',
            'post_date' => '2026-07-29 15:00:00',
            'post_date_gmt' => '2026-07-29 07:00:00',
        ), true);
        if (is_wp_error($post_id)) {
            gdhe_task014_cleanup_fixtures($manifest);
            return $post_id;
        }
        $post_id = (int) $post_id;
        update_post_meta($post_id, GDHE_TASK014_FIXTURE_MARKER, GDHE_TASK014_FIXTURE_VERSION);
        update_post_meta($post_id, '_gdhe_public_id', $definition[2]);
        update_post_meta($post_id, '_gdhe_public_path', $definition[3]);
        gdhe_a3_update_common_fields(
            $post_id,
            'standard',
            gdhe_a3_fixture_relations(),
            array(gdhe_a3_fixture_module($definition[4], $definition[0]))
        );
        $manifest['posts'][$key] = $post_id;
        update_option(GDHE_TASK014_FIXTURE_OPTION, $manifest, false);
    }

    $term_definitions = array(
        'category' => array('product_category', 'TASK-014 Card Products', 'task-014-card-products'),
        'series' => array('product_series', 'TASK-014 Series', 'task-014-series'),
        'installation' => array('installation_type', 'TASK-014 Installation', 'task-014-installation'),
    );
    foreach ($term_definitions as $key => $term_definition) {
        $term = wp_insert_term($term_definition[1], $term_definition[0], array('slug' => $term_definition[2]));
        if (is_wp_error($term)) {
            gdhe_task014_cleanup_fixtures($manifest);
            return $term;
        }
        $manifest['terms'][$key] = (int) $term['term_id'];
        update_option(GDHE_TASK014_FIXTURE_OPTION, $manifest, false);
    }

    $order = 1;
    foreach (gdhe_task014_fixture_definitions() as $definition) {
        $post_id = gdhe_task014_create_product($definition, $order);
        if (is_wp_error($post_id)) {
            gdhe_task014_cleanup_fixtures($manifest);
            return $post_id;
        }
        $manifest['posts'][$definition['key']] = (int) $post_id;
        update_option(GDHE_TASK014_FIXTURE_OPTION, $manifest, false);
        wp_set_object_terms((int) $post_id, array($manifest['terms']['category']), 'product_category');
        wp_set_object_terms((int) $post_id, array($manifest['terms']['series']), 'product_series');
        wp_set_object_terms((int) $post_id, array($manifest['terms']['installation']), 'installation_type');
        gdhe_a3_update_common_fields(
            (int) $post_id,
            'product',
            gdhe_a3_fixture_relations(),
            array(gdhe_a3_fixture_module(
                sprintf('45000000-0000-4000-8000-%012d', $order + 1),
                'TASK-014 synthetic product'
            ))
        );
        update_field(
            'field_gdhe_product_details',
            gdhe_a3_product_details('task-014-' . $definition['key']),
            (int) $post_id
        );
        $order++;
    }
    return $manifest;
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gdhe task014-fixtures create', function (): void {
        $result = gdhe_task014_create_fixtures();
        if (is_wp_error($result)) {
            WP_CLI::error((string) $result->get_error_message());
        }
        WP_CLI::line(wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe task014-fixtures show', function (): void {
        WP_CLI::line(wp_json_encode(
            get_option(GDHE_TASK014_FIXTURE_OPTION, array()),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ));
    });
    WP_CLI::add_command('gdhe task014-fixtures cleanup', function (): void {
        WP_CLI::line(wp_json_encode(
            gdhe_task014_cleanup_fixtures(),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ));
    });
}
