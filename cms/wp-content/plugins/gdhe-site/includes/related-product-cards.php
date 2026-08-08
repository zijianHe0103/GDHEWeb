<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_RELATED_PRODUCT_CARD_SCHEMA_VERSION = '1.0.0';
const GDHE_RELATED_PRODUCT_CARD_SOURCE_META = '_gdhe_related_product_card_v1_source';

function gdhe_register_related_product_card_route(): void
{
    $route = array();
    $route['methods'] = 'GET';
    $route['callback'] = 'gdhe_rest_related_product_cards';
    $route['permission_callback'] = '__return_true';
    register_rest_route('gdhe/v1', '/related-product-cards', $route);
}

function gdhe_validate_related_product_card_request($request)
{
    if (is_object($request)) {
        $params = call_user_func(array($request, 'get_params'));
        foreach (array_keys(is_array($params) ? $params : array()) as $key) {
            if (!in_array((string) $key, array('locale', 'schema', 'source_path'), true)) {
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
        GDHE_RELATED_PRODUCT_CARD_SCHEMA_VERSION
    ) !== GDHE_RELATED_PRODUCT_CARD_SCHEMA_VERSION) {
        return gdhe_rest_error(
            'gdhe_invalid_schema',
            'Unsupported RelatedProductCard schema version.',
            400,
            'schema'
        );
    }
    $source_path = (string) gdhe_request_param($request, 'source_path');
    if (!gdhe_validate_public_path($source_path)) {
        return gdhe_rest_error(
            'gdhe_invalid_path',
            'Source path must be a canonical English public path.',
            400,
            'source_path'
        );
    }
    return true;
}

function gdhe_related_product_card_direct_quote(array $card, int $post_id)
{
    $mode = (string) ($card['action']['mode'] ?? '');
    if ($mode === 'view_product'
        && ($card['kind'] ?? '') === 'detail_product'
        && is_string($card['publicPath'] ?? null)) {
        return null;
    }
    if ($mode !== 'direct_rfq'
        || ($card['kind'] ?? '') !== 'catalog_accessory'
        || ($card['lifecycle'] ?? '') !== 'active') {
        return false;
    }
    $raw = get_post_meta($post_id, GDHE_RELATED_PRODUCT_CARD_SOURCE_META, true);
    $source = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($source)
        || !gdhe_product_card_exact_keys($source, array('version', 'directQuote'))
        || $source['version'] !== GDHE_RELATED_PRODUCT_CARD_SCHEMA_VERSION
        || !is_array($source['directQuote'])
        || !gdhe_product_card_exact_keys($source['directQuote'], array('quantityUnit'))
        || $source['directQuote']['quantityUnit'] !== 'piece') {
        return false;
    }
    return array(
        'kind' => 'catalog_accessory',
        'quantityUnit' => 'piece',
    );
}

function gdhe_related_product_card_item($post)
{
    $card = gdhe_product_card_for_post($post);
    if (!is_array($card)) {
        return null;
    }
    $post_id = (int) gdhe_object_value($post, 'ID', 0);
    $direct_quote = gdhe_related_product_card_direct_quote($card, $post_id);
    if ($direct_quote === false) {
        return null;
    }
    unset($card['_filterSlug']);
    return array(
        'card' => $card,
        'directQuote' => $direct_quote,
    );
}

function gdhe_rest_related_product_cards($request)
{
    $contract = gdhe_validate_related_product_card_request($request);
    if ($contract !== true) {
        return $contract;
    }
    $source_path = (string) gdhe_request_param($request, 'source_path');
    $matches = gdhe_find_public_posts_by_path($source_path);
    if ($matches === array()) {
        return gdhe_rest_error(
            'gdhe_not_found',
            'Related-product source was not found.',
            404,
            'source_path'
        );
    }
    if (count($matches) !== 1) {
        return gdhe_rest_error(
            'gdhe_route_conflict',
            'Related-product source path is not unique.',
            409,
            'source_path'
        );
    }
    $source = $matches[0];
    $source_envelope = gdhe_build_content_envelope($source);
    if (is_wp_error($source_envelope) || ($source_envelope['type'] ?? '') !== 'product') {
        return gdhe_rest_error(
            'gdhe_contract_invariant',
            'Related-product source does not satisfy the public contract.',
            500
        );
    }
    $source_id = (int) gdhe_object_value($source, 'ID', 0);
    $relationships = get_field('relationships', $source_id, true);
    $products = is_array($relationships) ? ($relationships['products'] ?? null) : null;
    if (!is_array($products) || count($products) > 20) {
        return gdhe_rest_error(
            'gdhe_contract_invariant',
            'Related-product relationships do not satisfy the public contract.',
            500
        );
    }
    $projected = array();
    $public_id_owners = array(
        (string) $source_envelope['id'] => array($source_id => true),
    );
    $seen_posts = array($source_id => true);
    foreach ($products as $candidate_id) {
        if (!is_int($candidate_id) && !(is_string($candidate_id) && ctype_digit($candidate_id))) {
            return gdhe_rest_error(
                'gdhe_contract_invariant',
                'Related-product relationships do not satisfy the public contract.',
                500
            );
        }
        $candidate_id = (int) $candidate_id;
        if ($candidate_id < 1) {
            return gdhe_rest_error(
                'gdhe_contract_invariant',
                'Related-product relationships do not satisfy the public contract.',
                500
            );
        }
        if (isset($seen_posts[$candidate_id])) {
            continue;
        }
        $seen_posts[$candidate_id] = true;
        $item = gdhe_related_product_card_item(get_post($candidate_id));
        if (!is_array($item)) {
            continue;
        }
        $public_id = (string) ($item['card']['id'] ?? '');
        if ($public_id === '') {
            continue;
        }
        if (!isset($public_id_owners[$public_id])) {
            $public_id_owners[$public_id] = array();
        }
        $public_id_owners[$public_id][$candidate_id] = true;
        $projected[] = array(
            'publicId' => $public_id,
            'item' => $item,
        );
    }
    $items = array();
    foreach ($projected as $candidate) {
        if (count($public_id_owners[$candidate['publicId']]) !== 1) {
            continue;
        }
        $items[] = $candidate['item'];
    }
    $data = array(
        'apiVersion' => '1',
        'schemaVersion' => GDHE_RELATED_PRODUCT_CARD_SCHEMA_VERSION,
        'locale' => 'en',
        'type' => 'related_product_card',
        'sourcePath' => $source_path,
        'items' => $items,
    );
    return gdhe_response_with_cache_headers($data, $request);
}
