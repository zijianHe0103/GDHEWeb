<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_TASK019_FIXTURE_VERSION = 'TASK-019-PRODUCT-CONFIGURATION-1';
const GDHE_TASK019_FIXTURE_OPTION = 'gdhe_task019_fixture_manifest';
const GDHE_TASK019_FIXTURE_MARKER = '_gdhe_task019_fixture_marker';

function gdhe_task019_configuration_policy(): array
{
    return array(
        'installationMethods' => array(
            array(
                'method' => 'ceiling',
                'changesTrackArticleNumber' => false,
                'optionalAccessory' => null,
            ),
            array(
                'method' => 'wall',
                'changesTrackArticleNumber' => false,
                'optionalAccessory' => null,
            ),
        ),
        'packaging' => array(
            'scope' => 'curtain_track',
            'basePackaging' => array(
                'required' => true,
                'selectionMode' => 'single',
                'options' => array('standard', 'carton', 'large_shrink_wrap'),
            ),
            'logoPrinting' => array(
                'available' => true,
                'valueType' => 'boolean',
            ),
            'protectionArrangement' => array(
                'required' => false,
                'selectionMode' => 'single',
                'options' => array('single_bag', 'paired'),
            ),
        ),
        'customLength' => array(
            'enabled' => true,
            'articleNumberResolution' => 'sales_follow_up',
            'minimumExclusive' => 0,
            'maximum' => null,
            'decimalPlaces' => 1,
        ),
    );
}

function gdhe_task019_valid_source(): array
{
    return array(
        'version' => GDHE_PRODUCT_CONFIGURATION_SCHEMA_VERSION,
        'sourceClass' => 'test_candidate',
        'websiteEligible' => true,
        'product' => array(
            'id' => '17000000-0000-4000-8000-000000000001',
            'model' => 'FGD X15+PVC',
            'name' => 'FGD X15+PVC Track',
            'publicPath' => '/products/fgd-x15-pvc/',
            'productKind' => 'curtain_track',
            'quantityUnit' => 'piece',
        ),
        'articleNumberOptions' => array(
            array(
                'articleNumber' => 'GDHEPRD000172',
                'lengthMeters' => 6,
                'color' => array(
                    'code' => 'ivory-white',
                    'label' => 'Ivory White',
                ),
            ),
        ),
        'configurationPolicy' => gdhe_task019_configuration_policy(),
    );
}

function gdhe_task019_source_variant(string $variant)
{
    if ($variant === 'malformed_source') {
        return '{not-json';
    }
    $source = gdhe_task019_valid_source();
    if ($variant === 'ineligible') {
        $source['websiteEligible'] = false;
    } elseif ($variant === 'wrong_model') {
        $source['product']['model'] = 'FGD X15';
    } elseif ($variant === 'wrong_path') {
        $source['product']['publicPath'] = '/products/fgd-x15/';
    } elseif ($variant === 'duplicate_article') {
        $source['articleNumberOptions'][] = $source['articleNumberOptions'][0];
    } elseif ($variant === 'duplicate_choice') {
        $choice = $source['articleNumberOptions'][0];
        $choice['articleNumber'] = 'GDHEPRD000173';
        $source['articleNumberOptions'][] = $choice;
    } elseif ($variant === 'extra_length') {
        $choice = $source['articleNumberOptions'][0];
        $choice['articleNumber'] = 'GDHEPRD000174';
        $choice['lengthMeters'] = 4.3;
        $source['articleNumberOptions'][] = $choice;
    } elseif ($variant === 'guessed_accessory') {
        $source['configurationPolicy']['installationMethods'][0]['optionalAccessory'] = array(
            'id' => '19000000-0000-4000-8000-000000000001',
            'model' => 'TASK-019 Guessed Bracket',
            'name' => 'TASK-019 Guessed Bracket',
            'articleNumber' => 'GDHEPRD999999',
        );
    } elseif ($variant === 'invalid_packaging') {
        $source['configurationPolicy']['packaging']['basePackaging']['options'] = array(
            'standard',
            'carton',
        );
    } elseif ($variant === 'custom_article') {
        $source['configurationPolicy']['customLength']['articleNumber'] = 'GDHEPRD000172';
    } elseif ($variant === 'internal_field') {
        $source['purchasePrice'] = 'MUST_NOT_LEAK';
    }
    return $source;
}

function gdhe_task019_fixture_definitions(): array
{
    return array(
        'valid' => array('publish', 'valid'),
        'draft' => array('draft', 'valid'),
        'ineligible' => array('publish', 'ineligible'),
        'wrong_model' => array('publish', 'wrong_model'),
        'wrong_path' => array('publish', 'wrong_path'),
        'duplicate_article' => array('publish', 'duplicate_article'),
        'duplicate_choice' => array('publish', 'duplicate_choice'),
        'extra_length' => array('publish', 'extra_length'),
        'guessed_accessory' => array('publish', 'guessed_accessory'),
        'invalid_packaging' => array('publish', 'invalid_packaging'),
        'custom_article' => array('publish', 'custom_article'),
        'internal_field' => array('publish', 'internal_field'),
        'malformed_source' => array('publish', 'malformed_source'),
    );
}

function gdhe_task019_create_product(string $key, string $status, string $variant, int $order)
{
    $post_id = wp_insert_post(array(
        'post_type' => 'product',
        'post_status' => $status,
        'post_title' => 'FGD X15+PVC Track',
        'post_name' => 'task-019-' . str_replace('_', '-', $key),
        'post_excerpt' => 'Synthetic TASK-019 Product Configuration fixture.',
        'post_date' => '2026-07-31 09:00:00',
        'post_date_gmt' => '2026-07-31 01:00:00',
        'post_modified' => sprintf('2026-07-31 09:%02d:00', $order),
        'post_modified_gmt' => sprintf('2026-07-31 01:%02d:00', $order),
        'menu_order' => $order,
    ), true);
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    update_post_meta($post_id, GDHE_TASK019_FIXTURE_MARKER, GDHE_TASK019_FIXTURE_VERSION);
    update_post_meta($post_id, '_gdhe_public_id', '17000000-0000-4000-8000-000000000001');
    update_post_meta($post_id, '_gdhe_public_path', '/products/fgd-x15-pvc/');
    update_post_meta($post_id, 'product_details', array('model' => 'FGD X15+PVC'));
    $source = gdhe_task019_source_variant($variant);
    update_post_meta(
        $post_id,
        GDHE_PRODUCT_CONFIGURATION_SOURCE_META,
        is_string($source) ? $source : wp_json_encode($source, JSON_UNESCAPED_SLASHES)
    );
    return $post_id;
}

function gdhe_task019_cleanup_fixtures(?array $known_manifest = null): array
{
    $manifest = is_array($known_manifest)
        ? $known_manifest
        : get_option(GDHE_TASK019_FIXTURE_OPTION, array());
    $deleted = array('posts' => 0, 'terms' => 0, 'uploads' => 0);
    foreach (array_values($manifest['posts'] ?? array()) as $post_id) {
        if (get_post((int) $post_id) && wp_delete_post((int) $post_id, true)) {
            $deleted['posts']++;
        }
    }
    $query = new WP_Query(array(
        'post_type' => 'product',
        'post_status' => 'any',
        'posts_per_page' => -1,
        'meta_query' => array(array(
            'key' => GDHE_TASK019_FIXTURE_MARKER,
            'value' => GDHE_TASK019_FIXTURE_VERSION,
        )),
    ));
    foreach ((array) gdhe_object_value($query, 'posts', array()) as $post) {
        $post_id = (int) gdhe_object_value($post, 'ID', 0);
        if (get_post($post_id) && wp_delete_post($post_id, true)) {
            $deleted['posts']++;
        }
    }
    delete_option(GDHE_TASK019_FIXTURE_OPTION);
    return $deleted;
}

function gdhe_task019_create_fixtures()
{
    $existing = get_option(GDHE_TASK019_FIXTURE_OPTION, array());
    if (is_array($existing) && !empty($existing['posts'])) {
        return new WP_Error('gdhe_task019_fixture_exists', 'TASK-019 fixtures already exist.');
    }
    $manifest = array(
        'fixtureVersion' => GDHE_TASK019_FIXTURE_VERSION,
        'posts' => array(),
    );
    update_option(GDHE_TASK019_FIXTURE_OPTION, $manifest, false);
    $order = 1;
    foreach (gdhe_task019_fixture_definitions() as $key => $definition) {
        $post_id = gdhe_task019_create_product($key, $definition[0], $definition[1], $order);
        if (is_wp_error($post_id)) {
            gdhe_task019_cleanup_fixtures($manifest);
            return $post_id;
        }
        $manifest['posts'][$key] = (int) $post_id;
        update_option(GDHE_TASK019_FIXTURE_OPTION, $manifest, false);
        $order++;
    }
    return $manifest;
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gdhe task019-fixtures create', function (): void {
        $result = gdhe_task019_create_fixtures();
        if (is_wp_error($result)) {
            WP_CLI::error((string) $result->get_error_message());
        }
        WP_CLI::line(wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe task019-fixtures show', function (): void {
        WP_CLI::line(wp_json_encode(
            get_option(GDHE_TASK019_FIXTURE_OPTION, array()),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ));
    });
    WP_CLI::add_command('gdhe task019-fixtures cleanup', function (): void {
        WP_CLI::line(wp_json_encode(
            gdhe_task019_cleanup_fixtures(),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ));
    });
}
