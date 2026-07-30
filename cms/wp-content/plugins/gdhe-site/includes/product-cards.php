<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_PRODUCT_CARD_SCHEMA_VERSION = '1.0.0';
const GDHE_PRODUCT_CARD_SOURCE_META = '_gdhe_product_card_v1_source';

function gdhe_product_card_exact_keys(array $value, array $expected): bool
{
    $keys = array_keys($value);
    sort($keys, SORT_STRING);
    sort($expected, SORT_STRING);
    return $keys === $expected;
}

function gdhe_product_card_text($value, int $maximum): string
{
    $text = trim(wp_strip_all_tags(is_scalar($value) ? (string) $value : ''));
    return $text !== '' && strlen($text) <= $maximum ? $text : '';
}

function gdhe_product_card_reference_path_matches_role(string $path, string $role): bool
{
    $slug = '[a-z0-9]+(?:-[a-z0-9]+)*';
    if ($role === 'primaryCategory') {
        return preg_match(
            '#^/products/(?:curtain-track-systems|accessories)(?:/' . $slug . ')?/$#D',
            $path
        ) === 1;
    }
    if ($role === 'series') {
        return preg_match('#^/series(?:/' . $slug . ')?/$#D', $path) === 1;
    }
    if ($role === 'applications') {
        return preg_match('#^/applications(?:/' . $slug . ')?/$#D', $path) === 1;
    }
    return false;
}

function gdhe_product_card_public_reference($value, bool $with_filter, string $role)
{
    if (!is_array($value)) {
        return null;
    }
    $expected = array('id', 'label', 'publicPath');
    if ($with_filter) {
        $expected[] = 'filterSlug';
    }
    if (!gdhe_product_card_exact_keys($value, $expected)) {
        return null;
    }
    $id = strtolower((string) $value['id']);
    $label = gdhe_product_card_text($value['label'], 200);
    $path = (string) $value['publicPath'];
    if (!gdhe_is_uuid_v4($id)
        || $label === ''
        || !gdhe_validate_public_path($path)
        || !gdhe_product_card_reference_path_matches_role($path, $role)) {
        return null;
    }
    $matches = gdhe_find_public_posts_by_path($path);
    if (count($matches) !== 1
        || gdhe_public_identifier((int) gdhe_object_value($matches[0], 'ID', 0)) !== $id
        || is_wp_error(gdhe_build_content_envelope($matches[0]))) {
        return null;
    }
    $reference = array();
    $reference['id'] = $id;
    $reference['label'] = $label;
    $reference['publicPath'] = $path;
    if ($with_filter) {
        $filter = (string) $value['filterSlug'];
        if ($filter === '' || sanitize_title($filter) !== $filter) {
            return null;
        }
        $reference['filterSlug'] = $filter;
    }
    return $reference;
}

function gdhe_product_card_reference_list($value, string $role)
{
    if (!is_array($value) || count($value) > 20) {
        return null;
    }
    $references = array();
    foreach ($value as $candidate) {
        $reference = gdhe_product_card_public_reference($candidate, false, $role);
        if (!is_array($reference)) {
            return null;
        }
        $references[] = $reference;
    }
    return $references;
}

function gdhe_product_card_image($value)
{
    if (!is_array($value)
        || !gdhe_product_card_exact_keys($value, array('id', 'url', 'width', 'height', 'alt', 'protected'))
        || $value['protected'] !== true) {
        return null;
    }
    $id = strtolower((string) $value['id']);
    $url = (string) $value['url'];
    $alt = gdhe_product_card_text($value['alt'], 500);
    $width = is_int($value['width']) ? $value['width'] : 0;
    $height = is_int($value['height']) ? $value['height'] : 0;
    if (!gdhe_is_uuid_v4($id)
        || parse_url($url, PHP_URL_SCHEME) !== 'https'
        || esc_url_raw($url, array('https')) !== $url
        || $width < 1
        || $height < 1
        || $alt === '') {
        return null;
    }
    return array(
        'id' => $id,
        'url' => $url,
        'width' => $width,
        'height' => $height,
        'alt' => $alt,
    );
}

function gdhe_product_card_attributes($value)
{
    if (!is_array($value) || count($value) > 3) {
        return null;
    }
    $allowed = array(
        'system_type',
        'cross_section',
        'length',
        'staple_material',
        'available_widths',
        'spacing_roll_length',
        'bead_type',
        'spacing',
        'roll_length',
        'motor_type',
        'control_method',
        'compatible_system',
        'accessory_category',
        'material_color',
        'compatible_track',
    );
    $attributes = array();
    foreach ($value as $candidate) {
        if (!is_array($candidate)
            || !gdhe_product_card_exact_keys($candidate, array('key', 'label', 'value', 'unit'))) {
            return null;
        }
        $key = (string) $candidate['key'];
        $label = gdhe_product_card_text($candidate['label'], 100);
        $attribute_value = gdhe_product_card_text($candidate['value'], 200);
        $unit = $candidate['unit'] === null ? null : gdhe_product_card_text($candidate['unit'], 40);
        if (!in_array($key, $allowed, true)
            || $label === ''
            || $attribute_value === ''
            || ($candidate['unit'] !== null && $unit === '')) {
            return null;
        }
        $attributes[] = array(
            'key' => $key,
            'label' => $label,
            'value' => $attribute_value,
            'unit' => $unit,
        );
    }
    return $attributes;
}

function gdhe_product_card_action(string $kind, string $lifecycle, ?string $path): array
{
    if ($kind === 'detail_product') {
        return array(
            'mode' => 'view_product',
            'label' => 'View Product',
            'targetPath' => (string) $path,
        );
    }
    if ($lifecycle === 'active') {
        return array(
            'mode' => 'direct_rfq',
            'label' => 'Request a Quote',
            'targetPath' => '/request-a-quote/',
        );
    }
    return array(
        'mode' => 'replacement_contact',
        'label' => 'Contact Us for Replacement',
        'targetPath' => '/contact/',
    );
}

function gdhe_product_card_for_post($post)
{
    if (!is_object($post)
        || (string) gdhe_object_value($post, 'post_type', '') !== 'product'
        || (string) gdhe_object_value($post, 'post_status', '') !== 'publish'
        || !function_exists('get_field')) {
        return null;
    }
    $post_id = (int) gdhe_object_value($post, 'ID', 0);
    $public_id = gdhe_public_identifier($post_id);
    $name = gdhe_product_card_text(get_the_title($post_id), 300);
    $details = gdhe_normalize_type_details('product', $post_id);
    $modified = get_post_modified_time(DATE_RFC3339, true, $post);
    $raw_source = get_post_meta($post_id, GDHE_PRODUCT_CARD_SOURCE_META, true);
    $source = is_string($raw_source) ? json_decode($raw_source, true) : null;
    if ($public_id === ''
        || $name === ''
        || !is_array($details)
        || !is_string($modified)
        || $modified === ''
        || !is_array($source)
        || !gdhe_product_card_exact_keys(
            $source,
            array(
                'version',
                'sourceClass',
                'websiteEligible',
                'kind',
                'lifecycle',
                'image',
                'primaryCategory',
                'series',
                'applications',
                'keyAttributes',
            )
        )
        || $source['version'] !== GDHE_PRODUCT_CARD_SCHEMA_VERSION
        || $source['websiteEligible'] !== true
        || !in_array($source['sourceClass'], array('test_candidate', 'production'), true)
        || ($source['sourceClass'] === 'test_candidate' && wp_get_environment_type() !== 'local')
        || !in_array($source['kind'], array('detail_product', 'catalog_accessory'), true)
        || !in_array($source['lifecycle'], array('active', 'discontinued'), true)) {
        return null;
    }

    $kind = (string) $source['kind'];
    $path = null;
    if ($kind === 'detail_product') {
        $candidate_path = (string) get_post_meta($post_id, '_gdhe_public_path', true);
        $matches = gdhe_find_public_posts_by_path($candidate_path);
        if (!gdhe_validate_public_path($candidate_path)
            || count($matches) !== 1
            || (int) gdhe_object_value($matches[0], 'ID', 0) !== $post_id) {
            return null;
        }
        $path = $candidate_path;
    } elseif ((string) get_post_meta($post_id, '_gdhe_public_path', true) !== '') {
        return null;
    }

    $image = gdhe_product_card_image($source['image']);
    $primary = gdhe_product_card_public_reference($source['primaryCategory'], true, 'primaryCategory');
    $series = gdhe_product_card_reference_list($source['series'], 'series');
    $applications = gdhe_product_card_reference_list($source['applications'], 'applications');
    $attributes = gdhe_product_card_attributes($source['keyAttributes']);
    if (!is_array($image)
        || !is_array($primary)
        || !is_array($series)
        || !is_array($applications)
        || !is_array($attributes)
        || !in_array($primary['filterSlug'], gdhe_public_term_slugs($post_id, 'product_category'), true)) {
        return null;
    }

    $summary = gdhe_product_card_text(get_field('summary', $post_id, true), 500);
    $card = array();
    $card['id'] = $public_id;
    $card['kind'] = $kind;
    $card['model'] = (string) $details['model'];
    $card['name'] = $name;
    $card['publicPath'] = $path;
    $card['image'] = $image;
    unset($primary['filterSlug']);
    $card['primaryCategory'] = $primary;
    $card['series'] = $series;
    $card['applications'] = $applications;
    $card['summary'] = $summary === '' ? null : $summary;
    $card['keyAttributes'] = $attributes;
    $card['lifecycle'] = (string) $source['lifecycle'];
    $card['action'] = gdhe_product_card_action($kind, $card['lifecycle'], $path);
    $card['modifiedAt'] = $modified;
    $card['_filterSlug'] = (string) $source['primaryCategory']['filterSlug'];
    return $card;
}

function gdhe_product_card_compare_modified(array $left, array $right): int
{
    $modified = strcmp($right['modifiedAt'], $left['modifiedAt']);
    if ($modified !== 0) {
        return $modified;
    }
    $name = strcmp($left['name'], $right['name']);
    return $name !== 0 ? $name : strcmp($left['id'], $right['id']);
}

function gdhe_product_card_compare_title(array $left, array $right): int
{
    $name = strcmp($left['name'], $right['name']);
    return $name !== 0 ? $name : strcmp($left['id'], $right['id']);
}

function gdhe_product_card_integer_param($request, string $name, int $default)
{
    $value = gdhe_request_param($request, $name, (string) $default);
    $text = is_scalar($value) ? (string) $value : '';
    if (preg_match('/^[0-9]+$/', $text) !== 1) {
        return null;
    }
    $normalized = ltrim($text, '0');
    $normalized = $normalized === '' ? '0' : $normalized;
    $maximum = (string) PHP_INT_MAX;
    if (strlen($normalized) > strlen($maximum)
        || (strlen($normalized) === strlen($maximum) && strcmp($normalized, $maximum) > 0)) {
        return null;
    }
    return (int) $normalized;
}

function gdhe_validate_product_card_request($request)
{
    if (is_object($request)) {
        $params = call_user_func(array($request, 'get_params'));
        $allowed = array('locale', 'schema', 'page', 'per_page', 'sort', 'filter');
        foreach (array_keys(is_array($params) ? $params : array()) as $key) {
            if (!in_array((string) $key, $allowed, true)) {
                return gdhe_rest_error('gdhe_invalid_parameter', 'Query parameter is not allowed.', 400, (string) $key);
            }
        }
    }
    if ((string) gdhe_request_param($request, 'locale', 'en') !== 'en') {
        return gdhe_rest_error('gdhe_invalid_locale', 'Only the English locale is available.', 400, 'locale');
    }
    if ((string) gdhe_request_param($request, 'schema', GDHE_PRODUCT_CARD_SCHEMA_VERSION) !== GDHE_PRODUCT_CARD_SCHEMA_VERSION) {
        return gdhe_rest_error('gdhe_invalid_schema', 'Unsupported ProductCard schema version.', 400, 'schema');
    }
    return true;
}

function gdhe_rest_product_cards($request)
{
    $contract = gdhe_validate_product_card_request($request);
    if ($contract !== true) {
        return $contract;
    }
    $page = gdhe_product_card_integer_param($request, 'page', 1);
    $per_page = gdhe_product_card_integer_param($request, 'per_page', 10);
    if (!is_int($page) || !is_int($per_page) || $page < 1 || $per_page < 1 || $per_page > 100) {
        return gdhe_rest_error('gdhe_invalid_pagination', 'Pagination is outside the allowed range.', 400, 'page');
    }
    if (($page - 1) > intdiv(PHP_INT_MAX, $per_page)) {
        return gdhe_rest_error('gdhe_invalid_pagination', 'Pagination is outside the allowed range.', 400, 'page');
    }
    $offset = ($page - 1) * $per_page;
    $sort = (string) gdhe_request_param($request, 'sort', 'modified_desc');
    if (!in_array($sort, array('modified_desc', 'title_asc'), true)) {
        return gdhe_rest_error('gdhe_invalid_sort', 'Sort value is not allowed.', 400, 'sort');
    }
    $filter = (string) gdhe_request_param($request, 'filter', '');
    $filter_slug = '';
    if ($filter !== '') {
        $parts = explode(':', $filter, 2);
        if (count($parts) !== 2
            || $parts[0] !== 'product_category'
            || $parts[1] === ''
            || sanitize_title($parts[1]) !== $parts[1]) {
            return gdhe_rest_error('gdhe_invalid_filter', 'Filter value is not allowed.', 400, 'filter');
        }
        $filter_slug = $parts[1];
    }

    $query = new WP_Query(array(
        'post_type' => 'product',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'no_found_rows' => true,
        'orderby' => 'ID',
        'order' => 'ASC',
    ));
    $cards = array();
    $posts = gdhe_object_value($query, 'posts', array());
    foreach (is_array($posts) ? $posts : array() as $post) {
        $card = gdhe_product_card_for_post($post);
        if (!is_array($card) || ($filter_slug !== '' && $card['_filterSlug'] !== $filter_slug)) {
            continue;
        }
        unset($card['_filterSlug']);
        $cards[] = $card;
    }
    usort(
        $cards,
        $sort === 'title_asc' ? 'gdhe_product_card_compare_title' : 'gdhe_product_card_compare_modified'
    );
    $total = count($cards);
    $data = array();
    $data['apiVersion'] = '1';
    $data['schemaVersion'] = GDHE_PRODUCT_CARD_SCHEMA_VERSION;
    $data['locale'] = 'en';
    $data['type'] = 'product_card';
    $data['sort'] = $sort;
    $data['filter'] = $filter === '' ? null : $filter;
    $data['page'] = $page;
    $data['perPage'] = $per_page;
    $data['total'] = $total;
    $data['totalPages'] = $total === 0 ? 0 : (int) ceil($total / $per_page);
    $data['items'] = array_slice($cards, $offset, $per_page);
    return gdhe_response_with_cache_headers($data, $request);
}
