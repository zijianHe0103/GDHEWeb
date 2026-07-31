<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_PRODUCT_CONFIGURATION_SCHEMA_VERSION = '1.0.0';
const GDHE_PRODUCT_CONFIGURATION_SOURCE_META = '_gdhe_product_configuration_v1_source';

function gdhe_product_configuration_exact_keys(array $value, array $expected): bool
{
    $keys = array_keys($value);
    sort($keys, SORT_STRING);
    sort($expected, SORT_STRING);
    return $keys === $expected;
}

function gdhe_product_configuration_text($value, int $maximum): string
{
    if (!is_scalar($value)) {
        return '';
    }
    $raw = trim((string) $value);
    $clean = trim(wp_strip_all_tags($raw));
    return $raw === $clean && $clean !== '' && strlen($clean) <= $maximum ? $clean : '';
}

function gdhe_product_configuration_decimal($value)
{
    if (!is_int($value) && !is_float($value)) {
        return null;
    }
    $number = (float) $value;
    if (!is_finite($number) || $number <= 0 || abs(($number * 10) - round($number * 10)) > 0.0000001) {
        return null;
    }
    return $number === (float) (int) $number ? (int) $number : $number;
}

function gdhe_product_configuration_option($value)
{
    if (!is_array($value)
        || !gdhe_product_configuration_exact_keys(
            $value,
            array('articleNumber', 'lengthMeters', 'color')
        )
        || !is_array($value['color'])
        || !gdhe_product_configuration_exact_keys($value['color'], array('code', 'label'))) {
        return null;
    }
    $article_number = (string) $value['articleNumber'];
    $length = gdhe_product_configuration_decimal($value['lengthMeters']);
    $color_code = (string) $value['color']['code'];
    $color_label = gdhe_product_configuration_text($value['color']['label'], 200);
    if (preg_match('/^GDHEPRD[0-9]{6}$/D', $article_number) !== 1
        || $length === null
        || preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $color_code) !== 1
        || strlen($color_code) > 100
        || $color_label === '') {
        return null;
    }
    return array(
        'articleNumber' => $article_number,
        'lengthMeters' => $length,
        'color' => array(
            'code' => $color_code,
            'label' => $color_label,
        ),
    );
}

function gdhe_product_configuration_accessory($value)
{
    if ($value === null) {
        return null;
    }
    if (!is_array($value)
        || !gdhe_product_configuration_exact_keys(
            $value,
            array('id', 'model', 'name', 'articleNumber')
        )) {
        return false;
    }
    $id = strtolower((string) $value['id']);
    $model = gdhe_product_configuration_text($value['model'], 200);
    $name = gdhe_product_configuration_text($value['name'], 300);
    $article_number = (string) $value['articleNumber'];
    if (!gdhe_is_uuid_v4($id)
        || $model === ''
        || $name === ''
        || preg_match('/^GDHEPRD[0-9]{6}$/D', $article_number) !== 1) {
        return false;
    }
    return array(
        'id' => $id,
        'model' => $model,
        'name' => $name,
        'articleNumber' => $article_number,
    );
}

function gdhe_product_configuration_policy($value)
{
    if (!is_array($value)
        || !gdhe_product_configuration_exact_keys(
            $value,
            array('installationMethods', 'packaging', 'customLength')
        )
        || !is_array($value['installationMethods'])
        || count($value['installationMethods']) !== 2) {
        return null;
    }
    $methods = array();
    foreach (array('ceiling', 'wall') as $index => $expected_method) {
        $candidate = $value['installationMethods'][$index] ?? null;
        if (!is_array($candidate)
            || !gdhe_product_configuration_exact_keys(
                $candidate,
                array('method', 'changesTrackArticleNumber', 'optionalAccessory')
            )
            || $candidate['method'] !== $expected_method
            || $candidate['changesTrackArticleNumber'] !== false) {
            return null;
        }
        $accessory = gdhe_product_configuration_accessory($candidate['optionalAccessory']);
        if ($accessory === false) {
            return null;
        }
        $methods[] = array(
            'method' => $expected_method,
            'changesTrackArticleNumber' => false,
            'optionalAccessory' => $accessory,
        );
    }

    $packaging = $value['packaging'];
    if (!is_array($packaging)
        || !gdhe_product_configuration_exact_keys(
            $packaging,
            array('scope', 'basePackaging', 'logoPrinting', 'protectionArrangement')
        )
        || $packaging['scope'] !== 'curtain_track') {
        return null;
    }
    $base = $packaging['basePackaging'];
    $logo = $packaging['logoPrinting'];
    $protection = $packaging['protectionArrangement'];
    if (!is_array($base)
        || !gdhe_product_configuration_exact_keys(
            $base,
            array('required', 'selectionMode', 'options')
        )
        || $base !== array(
            'required' => true,
            'selectionMode' => 'single',
            'options' => array('standard', 'carton', 'large_shrink_wrap'),
        )
        || !is_array($logo)
        || !gdhe_product_configuration_exact_keys($logo, array('available', 'valueType'))
        || $logo !== array('available' => true, 'valueType' => 'boolean')
        || !is_array($protection)
        || !gdhe_product_configuration_exact_keys(
            $protection,
            array('required', 'selectionMode', 'options')
        )
        || $protection !== array(
            'required' => false,
            'selectionMode' => 'single',
            'options' => array('single_bag', 'paired'),
        )) {
        return null;
    }

    $custom = $value['customLength'];
    if (!is_array($custom)
        || !gdhe_product_configuration_exact_keys(
            $custom,
            array(
                'enabled',
                'articleNumberResolution',
                'minimumExclusive',
                'maximum',
                'decimalPlaces',
            )
        )
        || $custom !== array(
            'enabled' => true,
            'articleNumberResolution' => 'sales_follow_up',
            'minimumExclusive' => 0,
            'maximum' => null,
            'decimalPlaces' => 1,
        )) {
        return null;
    }
    return array(
        'installationMethods' => $methods,
        'packaging' => $packaging,
        'customLength' => $custom,
    );
}

function gdhe_product_configuration_is_fgd_fixture_truth(array $document): bool
{
    return $document['product'] === array(
        'id' => '17000000-0000-4000-8000-000000000001',
        'model' => 'FGD X15+PVC',
        'name' => 'FGD X15+PVC Track',
        'publicPath' => '/products/fgd-x15-pvc/',
        'productKind' => 'curtain_track',
        'quantityUnit' => 'piece',
    )
        && $document['articleNumberOptions'] === array(array(
            'articleNumber' => 'GDHEPRD000172',
            'lengthMeters' => 6,
            'color' => array('code' => 'ivory-white', 'label' => 'Ivory White'),
        ))
        && $document['configurationPolicy']['installationMethods'][0]['optionalAccessory'] === null
        && $document['configurationPolicy']['installationMethods'][1]['optionalAccessory'] === null;
}

function gdhe_product_configuration_for_post($post)
{
    if (!is_object($post)
        || (string) gdhe_object_value($post, 'post_type', '') !== 'product'
        || (string) gdhe_object_value($post, 'post_status', '') !== 'publish'
        || !function_exists('get_field')) {
        return null;
    }
    $post_id = (int) gdhe_object_value($post, 'ID', 0);
    $raw_source = get_post_meta($post_id, GDHE_PRODUCT_CONFIGURATION_SOURCE_META, true);
    $source = is_string($raw_source) ? json_decode($raw_source, true) : null;
    if (!is_array($source)
        || !gdhe_product_configuration_exact_keys(
            $source,
            array(
                'version',
                'sourceClass',
                'websiteEligible',
                'product',
                'articleNumberOptions',
                'configurationPolicy',
            )
        )
        || $source['version'] !== GDHE_PRODUCT_CONFIGURATION_SCHEMA_VERSION
        || $source['websiteEligible'] !== true
        || !in_array($source['sourceClass'], array('test_candidate', 'production'), true)
        || ($source['sourceClass'] === 'test_candidate' && wp_get_environment_type() !== 'local')
        || !is_array($source['product'])
        || !gdhe_product_configuration_exact_keys(
            $source['product'],
            array('id', 'model', 'name', 'publicPath', 'productKind', 'quantityUnit')
        )
        || !is_array($source['articleNumberOptions'])
        || count($source['articleNumberOptions']) < 1
        || count($source['articleNumberOptions']) > 100) {
        return null;
    }

    $product = $source['product'];
    $id = strtolower((string) $product['id']);
    $model = gdhe_product_configuration_text($product['model'], 200);
    $name = gdhe_product_configuration_text($product['name'], 300);
    $path = (string) $product['publicPath'];
    $details = get_field('product_details', $post_id, true);
    $stored_model = is_array($details)
        ? gdhe_product_configuration_text($details['model'] ?? '', 200)
        : '';
    if (!gdhe_is_uuid_v4($id)
        || $model === ''
        || $name === ''
        || !gdhe_validate_public_path($path)
        || $product['productKind'] !== 'curtain_track'
        || $product['quantityUnit'] !== 'piece'
        || gdhe_public_identifier($post_id) !== $id
        || gdhe_product_configuration_text(get_the_title($post_id), 300) !== $name
        || (string) get_post_meta($post_id, '_gdhe_public_path', true) !== $path
        || $stored_model !== $model) {
        return null;
    }

    $options = array();
    $article_numbers = array();
    $public_choices = array();
    foreach ($source['articleNumberOptions'] as $candidate) {
        $option = gdhe_product_configuration_option($candidate);
        if (!is_array($option)) {
            return null;
        }
        $choice = number_format((float) $option['lengthMeters'], 1, '.', '')
            . '|' . $option['color']['code'];
        if (isset($article_numbers[$option['articleNumber']]) || isset($public_choices[$choice])) {
            return null;
        }
        $article_numbers[$option['articleNumber']] = true;
        $public_choices[$choice] = true;
        $options[] = $option;
    }
    usort($options, function (array $left, array $right): int {
        $length = $left['lengthMeters'] <=> $right['lengthMeters'];
        if ($length !== 0) {
            return $length;
        }
        $color = strcmp($left['color']['code'], $right['color']['code']);
        return $color !== 0 ? $color : strcmp($left['articleNumber'], $right['articleNumber']);
    });

    $policy = gdhe_product_configuration_policy($source['configurationPolicy']);
    $modified = get_post_modified_time(DATE_RFC3339, true, $post);
    if (!is_array($policy) || !is_string($modified) || $modified === '') {
        return null;
    }
    $document = array(
        'apiVersion' => '1',
        'schemaVersion' => GDHE_PRODUCT_CONFIGURATION_SCHEMA_VERSION,
        'locale' => 'en',
        'type' => 'product_configuration',
        'product' => array(
            'id' => $id,
            'model' => $model,
            'name' => $name,
            'publicPath' => $path,
            'productKind' => 'curtain_track',
            'quantityUnit' => 'piece',
        ),
        'articleNumberOptions' => $options,
        'configurationPolicy' => $policy,
        'modifiedAt' => $modified,
    );
    if ($source['sourceClass'] === 'test_candidate'
        && !gdhe_product_configuration_is_fgd_fixture_truth($document)) {
        return null;
    }
    return $document;
}

function gdhe_product_configuration_documents(): array
{
    $query = new WP_Query(array(
        'post_type' => 'product',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'no_found_rows' => true,
        'orderby' => 'ID',
        'order' => 'ASC',
        'meta_query' => array(array(
            'key' => GDHE_PRODUCT_CONFIGURATION_SOURCE_META,
            'compare' => 'EXISTS',
        )),
    ));
    $documents = array();
    foreach ((array) gdhe_object_value($query, 'posts', array()) as $post) {
        $document = gdhe_product_configuration_for_post($post);
        if (is_array($document)) {
            $documents[] = $document;
        }
    }
    $article_counts = array();
    $choice_counts = array();
    $product_identities = array();
    $conflicting_product_ids = array();
    foreach ($documents as $document) {
        $product = $document['product'];
        $product_id = $product['id'];
        $identity = wp_json_encode(array(
            $product['model'],
            $product['name'],
            $product['publicPath'],
            $product['productKind'],
            $product['quantityUnit'],
        ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (isset($product_identities[$product_id])
            && $product_identities[$product_id] !== $identity) {
            $conflicting_product_ids[$product_id] = true;
        } else {
            $product_identities[$product_id] = $identity;
        }
        foreach ($document['articleNumberOptions'] as $option) {
            $article = $option['articleNumber'];
            $choice = $product_id . '|'
                . number_format((float) $option['lengthMeters'], 1, '.', '')
                . '|' . $option['color']['code'];
            $article_counts[$article] = ($article_counts[$article] ?? 0) + 1;
            $choice_counts[$choice] = ($choice_counts[$choice] ?? 0) + 1;
        }
    }
    return array_values(array_filter(
        $documents,
        function (array $document) use (
            $article_counts,
            $choice_counts,
            $conflicting_product_ids
        ): bool {
            if (isset($conflicting_product_ids[$document['product']['id']])) {
                return false;
            }
            foreach ($document['articleNumberOptions'] as $option) {
                $choice = $document['product']['id'] . '|'
                    . number_format((float) $option['lengthMeters'], 1, '.', '')
                    . '|' . $option['color']['code'];
                if (($article_counts[$option['articleNumber']] ?? 0) !== 1
                    || ($choice_counts[$choice] ?? 0) !== 1) {
                    return false;
                }
            }
            return true;
        }
    ));
}

function gdhe_validate_product_configuration_request($request)
{
    if (is_object($request)) {
        $params = call_user_func(array($request, 'get_params'));
        $allowed = array('locale', 'schema', 'path');
        foreach (array_keys(is_array($params) ? $params : array()) as $key) {
            if (!in_array((string) $key, $allowed, true)) {
                return gdhe_rest_error(
                    'gdhe_invalid_parameter',
                    'Query parameter is not allowed.',
                    400,
                    (string) $key
                );
            }
        }
    }
    if ((string) gdhe_request_param($request, 'locale', 'en') !== 'en') {
        return gdhe_rest_error(
            'gdhe_invalid_locale',
            'Only the English locale is available.',
            400,
            'locale'
        );
    }
    if ((string) gdhe_request_param(
        $request,
        'schema',
        GDHE_PRODUCT_CONFIGURATION_SCHEMA_VERSION
    ) !== GDHE_PRODUCT_CONFIGURATION_SCHEMA_VERSION) {
        return gdhe_rest_error(
            'gdhe_invalid_schema',
            'Unsupported Product Configuration schema version.',
            400,
            'schema'
        );
    }
    $path = (string) gdhe_request_param($request, 'path', '');
    if (!gdhe_validate_public_path($path)) {
        return gdhe_rest_error(
            'gdhe_invalid_path',
            'Path must be a canonical English public path.',
            400,
            'path'
        );
    }
    return $path;
}

function gdhe_rest_product_configurations($request)
{
    $path = gdhe_validate_product_configuration_request($request);
    if (!is_string($path)) {
        return $path;
    }
    $matches = array_values(array_filter(
        gdhe_product_configuration_documents(),
        static fn(array $document): bool => $document['product']['publicPath'] === $path
    ));
    if (count($matches) !== 1) {
        return gdhe_rest_error(
            'gdhe_not_found',
            'Product configuration was not found.',
            404,
            'path'
        );
    }
    return gdhe_response_with_cache_headers($matches[0], $request);
}
