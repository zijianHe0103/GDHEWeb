<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_MIXED_QUOTE_LINE_SCHEMA_VERSION = '1.0.0';
const GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META = '_gdhe_catalog_accessory_quote_v1_source';
const GDHE_PUBLIC_ARTICLE_NUMBER_META = '_gdhe_public_article_number_v1';
const GDHE_QUOTE_LINE_MAX_BYTES = 163840;
const GDHE_QUOTE_LINE_MAX_CANDIDATES = 101;

function gdhe_quote_line_error(string $code, string $message, int $status)
{
    return gdhe_rest_error($code, $message, $status);
}

function gdhe_quote_line_success(array $lines)
{
    $response = rest_ensure_response(array(
        'apiVersion' => '1',
        'schemaVersion' => GDHE_MIXED_QUOTE_LINE_SCHEMA_VERSION,
        'locale' => 'en',
        'type' => 'mixed_quote_line_validation',
        'lines' => $lines,
    ));
    $response->header('Cache-Control', 'no-store');
    $response->header('Content-Type', 'application/json; charset=UTF-8');
    $response->header('X-GDHE-Request-ID', wp_generate_uuid4());
    return $response;
}

function gdhe_article_number_valid($value): bool
{
    return is_string($value) && preg_match('/^GDHEPRD[0-9]{6}$/D', $value) === 1;
}

function gdhe_post_article_number_index(int $post_id): array
{
    $values = get_post_meta($post_id, GDHE_PUBLIC_ARTICLE_NUMBER_META, false);
    $normalized = array();
    foreach ($values as $value) {
        if (!gdhe_article_number_valid($value) || isset($normalized[$value])) {
            return array();
        }
        $normalized[$value] = true;
    }
    return array_keys($normalized);
}

function gdhe_sync_public_article_number_index(int $post_id): bool
{
    $post = get_post($post_id);
    $articles = array();
    $configuration = gdhe_product_configuration_v2_for_post($post);
    if (is_array($configuration)) {
        $articles = array_column($configuration['articleNumberOptions'], 'articleNumber');
    } else {
        $accessory = gdhe_validate_catalog_accessory_quote_source($post);
        if (is_array($accessory)) {
            $articles = array($accessory['articleNumber']);
        }
    }
    delete_post_meta($post_id, GDHE_PUBLIC_ARTICLE_NUMBER_META);
    sort($articles, SORT_STRING);
    foreach ($articles as $article) {
        if (!add_post_meta($post_id, GDHE_PUBLIC_ARTICLE_NUMBER_META, $article, false)) {
            return false;
        }
    }
    return $articles !== array();
}

function gdhe_validate_catalog_accessory_quote_source($post)
{
    if (!is_object($post)
        || (string) gdhe_object_value($post, 'post_type', '') !== 'product'
        || (string) gdhe_object_value($post, 'post_status', '') !== 'publish') {
        return null;
    }
    $post_id = (int) gdhe_object_value($post, 'ID', 0);
    $raw = get_post_meta($post_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, true);
    $source = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($source)
        || !gdhe_product_configuration_exact_keys(
            $source,
            array('version', 'sourceClass', 'websiteEligible', 'product', 'articleNumber', 'quantityUnit')
        )
        || $source['version'] !== '1.0.0'
        || !in_array($source['sourceClass'], array('test_candidate', 'production'), true)
        || ($source['sourceClass'] === 'test_candidate' && wp_get_environment_type() !== 'local')
        || $source['websiteEligible'] !== true
        || !is_array($source['product'])
        || !gdhe_product_configuration_exact_keys(
            $source['product'],
            array('id', 'model', 'name', 'publicPath', 'productKind', 'quantityUnit')
        )
        || $source['quantityUnit'] !== 'piece'
        || !gdhe_article_number_valid($source['articleNumber'])) {
        return null;
    }
    $product = $source['product'];
    $card = gdhe_product_card_for_post($post);
    if (!is_array($card)
        || $card['kind'] !== 'catalog_accessory'
        || $card['lifecycle'] !== 'active'
        || $card['publicPath'] !== null
        || $card['action']['mode'] !== 'direct_rfq'
        || $product !== array(
            'id' => $card['id'],
            'model' => $card['model'],
            'name' => $card['name'],
            'publicPath' => null,
            'productKind' => 'catalog_accessory',
            'quantityUnit' => 'piece',
        )) {
        return null;
    }
    return array(
        'product' => $product,
        'articleNumber' => $source['articleNumber'],
        'quantityUnit' => 'piece',
    );
}

function gdhe_claimed_article_numbers_for_post($post): array
{
    if (!is_object($post)) {
        return array();
    }
    $post_id = (int) gdhe_object_value($post, 'ID', 0);
    $claimed = array();
    foreach (get_post_meta($post_id, GDHE_PUBLIC_ARTICLE_NUMBER_META, false) as $article) {
        if (gdhe_article_number_valid($article)) {
            $claimed[$article] = true;
        }
    }
    $configuration_raw = get_post_meta($post_id, GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META, true);
    $configuration = is_string($configuration_raw) ? json_decode($configuration_raw, true) : null;
    foreach (is_array($configuration['articleNumberOptions'] ?? null) ? $configuration['articleNumberOptions'] : array() as $option) {
        $article = is_array($option) ? ($option['articleNumber'] ?? null) : null;
        if (gdhe_article_number_valid($article)) {
            $claimed[$article] = true;
        }
    }
    $accessory_raw = get_post_meta($post_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, true);
    $accessory = is_string($accessory_raw) ? json_decode($accessory_raw, true) : null;
    $article = is_array($accessory) ? ($accessory['articleNumber'] ?? null) : null;
    if (gdhe_article_number_valid($article)) {
        $claimed[$article] = true;
    }
    return array_keys($claimed);
}

function gdhe_quote_source_for_post($post)
{
    $configuration = gdhe_product_configuration_v2_for_post($post);
    if (is_array($configuration)) {
        $expected = array_column($configuration['articleNumberOptions'], 'articleNumber');
        sort($expected, SORT_STRING);
        $indexed = gdhe_post_article_number_index((int) gdhe_object_value($post, 'ID', 0));
        sort($indexed, SORT_STRING);
        return $indexed === $expected ? array('kind' => 'configured_product', 'document' => $configuration) : null;
    }
    $accessory = gdhe_validate_catalog_accessory_quote_source($post);
    if (!is_array($accessory)) {
        return null;
    }
    return gdhe_post_article_number_index((int) gdhe_object_value($post, 'ID', 0)) === array($accessory['articleNumber'])
        ? array('kind' => 'catalog_accessory', 'document' => $accessory)
        : null;
}

function gdhe_quote_line_candidate_query(array $paths, array $articles): array
{
    $path_posts = array();
    if ($paths !== array()) {
        $query = new WP_Query(array(
            'post_type' => 'product', 'post_status' => 'publish',
            'posts_per_page' => GDHE_QUOTE_LINE_MAX_CANDIDATES, 'no_found_rows' => true,
            'orderby' => 'ID', 'order' => 'ASC',
            'meta_query' => array(array('key' => '_gdhe_public_path', 'value' => $paths, 'compare' => 'IN')),
        ));
        $path_posts = (array) $query->posts;
        if (count($path_posts) >= GDHE_QUOTE_LINE_MAX_CANDIDATES) {
            return array('overflow' => true, 'path' => array(), 'article' => array());
        }
    }
    $article_posts = array();
    if ($articles !== array()) {
        $meta = array('relation' => 'OR', array(
            'key' => GDHE_PUBLIC_ARTICLE_NUMBER_META,
            'value' => $articles,
            'compare' => 'IN',
        ));
        foreach ($articles as $article) {
            $meta[] = array('key' => GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META, 'value' => $article, 'compare' => 'LIKE');
            $meta[] = array('key' => GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, 'value' => $article, 'compare' => 'LIKE');
        }
        $query = new WP_Query(array(
            'post_type' => 'product', 'post_status' => 'publish',
            'posts_per_page' => GDHE_QUOTE_LINE_MAX_CANDIDATES, 'no_found_rows' => true,
            'orderby' => 'ID', 'order' => 'ASC', 'meta_query' => $meta,
        ));
        $article_posts = (array) $query->posts;
        if (count($article_posts) >= GDHE_QUOTE_LINE_MAX_CANDIDATES) {
            return array('overflow' => true, 'path' => array(), 'article' => array());
        }
    }
    return array('overflow' => false, 'path' => $path_posts, 'article' => $article_posts);
}

function gdhe_quote_line_color($value)
{
    if (!is_array($value)
        || !gdhe_product_configuration_exact_keys($value, array('code', 'label'))
        || preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', (string) $value['code']) !== 1
        || strlen((string) $value['code']) > 80
        || gdhe_product_configuration_text($value['label'], 120) === '') {
        return null;
    }
    return array('code' => (string) $value['code'], 'label' => (string) $value['label']);
}

function gdhe_quote_line_packaging($value)
{
    if (!is_array($value)
        || !gdhe_product_configuration_exact_keys($value, array('basePackaging', 'logoPrinting', 'protectionArrangement'))
        || !in_array($value['basePackaging'] ?? null, array('standard', 'carton', 'large_shrink_wrap'), true)
        || !is_bool($value['logoPrinting'] ?? null)
        || !in_array($value['protectionArrangement'] ?? null, array(null, 'single_bag', 'paired'), true)) {
        return null;
    }
    return $value;
}

function gdhe_quote_line_selection($value)
{
    if (!is_array($value)
        || !gdhe_product_configuration_exact_keys($value, array('type', 'articleNumber', 'lengthMeters', 'color', 'resolution'))
        || gdhe_product_configuration_decimal($value['lengthMeters'] ?? null) === null) {
        return null;
    }
    $color = gdhe_quote_line_color($value['color'] ?? null);
    if (!is_array($color)) {
        return null;
    }
    $type = $value['type'] ?? null;
    $resolution = $value['resolution'] ?? null;
    $article = $value['articleNumber'] ?? null;
    if (($resolution === 'standard_ready' && ($type !== 'article_number' || !gdhe_article_number_valid($article)))
        || ($resolution === 'refresh_from_selection' && ($type !== 'article_number' || $article !== null))
        || ($resolution === 'sales_follow_up' && ($type !== 'custom_length' || $article !== null))
        || !in_array($resolution, array('standard_ready', 'refresh_from_selection', 'sales_follow_up'), true)) {
        return null;
    }
    return array(
        'type' => $type,
        'articleNumber' => $article,
        'lengthMeters' => gdhe_product_configuration_decimal($value['lengthMeters']),
        'color' => $color,
        'resolution' => $resolution,
    );
}

function gdhe_quote_line_request_document($request)
{
    if ($request->get_query_params() !== array()) {
        return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request is invalid.', 400);
    }
    if ((string) $request->get_header('content-type') !== 'application/json') {
        return gdhe_quote_line_error('gdhe_unsupported_media_type', 'Content-Type must be application/json.', 415);
    }
    $body = (string) $request->get_body();
    if (strlen($body) > GDHE_QUOTE_LINE_MAX_BYTES) {
        return gdhe_quote_line_error('gdhe_quote_line_request_too_large', 'Request body is too large.', 413);
    }
    $document = json_decode($body, true);
    if (!is_array($document)
        || json_last_error() !== JSON_ERROR_NONE
        || !gdhe_product_configuration_exact_keys($document, array('apiVersion', 'schemaVersion', 'locale', 'lines'))
        || $document['apiVersion'] !== '1'
        || $document['schemaVersion'] !== GDHE_MIXED_QUOTE_LINE_SCHEMA_VERSION
        || $document['locale'] !== 'en'
        || !is_array($document['lines'])
        || count($document['lines']) < 1
        || count($document['lines']) > 50) {
        return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request is invalid.', 400);
    }
    $normalized = array();
    $entry_ids = array();
    $merge_ids = array();
    foreach ($document['lines'] as $line) {
        if (!is_array($line)) {
            return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request is invalid.', 400);
        }
        $raw_entry_id = (string) ($line['entryId'] ?? '');
        if ($raw_entry_id !== strtolower($raw_entry_id)
            || !gdhe_is_uuid_v4($raw_entry_id)
            || !is_int($line['quantity'] ?? null)
            || $line['quantity'] < 1
            || $line['quantity'] > 9007199254740991
            || ($line['quantityUnit'] ?? null) !== 'piece') {
            return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request is invalid.', 400);
        }
        $entry_id = $raw_entry_id;
        if (($line['lineKind'] ?? null) === 'configured_product') {
            if (!gdhe_product_configuration_exact_keys($line, array('entryId', 'lineKind', 'canonicalPath', 'selection', 'packaging', 'quantityUnit', 'quantity'))
                || !gdhe_validate_public_path((string) ($line['canonicalPath'] ?? ''))) {
                return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request is invalid.', 400);
            }
            $selection = gdhe_quote_line_selection($line['selection']);
            $packaging = gdhe_quote_line_packaging($line['packaging']);
            if (!is_array($selection) || !is_array($packaging)) {
                return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request is invalid.', 400);
            }
            $candidate = array(
                'entryId' => $entry_id, 'lineKind' => 'configured_product',
                'canonicalPath' => (string) $line['canonicalPath'], 'selection' => $selection,
                'packaging' => $packaging, 'quantityUnit' => 'piece', 'quantity' => $line['quantity'],
            );
            $merge = wp_json_encode(array($candidate['lineKind'], $candidate['canonicalPath'], $selection, $packaging, 'piece'), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        } elseif (($line['lineKind'] ?? null) === 'catalog_accessory') {
            if (!gdhe_product_configuration_exact_keys($line, array('entryId', 'lineKind', 'articleNumber', 'quantityUnit', 'quantity'))
                || !gdhe_article_number_valid($line['articleNumber'] ?? null)) {
                return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request is invalid.', 400);
            }
            $candidate = array(
                'entryId' => $entry_id, 'lineKind' => 'catalog_accessory',
                'articleNumber' => $line['articleNumber'], 'quantityUnit' => 'piece', 'quantity' => $line['quantity'],
            );
            $merge = wp_json_encode(array($candidate['lineKind'], $candidate['articleNumber'], 'piece'));
        } else {
            return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request is invalid.', 400);
        }
        if (isset($entry_ids[$entry_id]) || isset($merge_ids[$merge])) {
            return gdhe_quote_line_error('gdhe_invalid_quote_line_request', 'Quote-line request contains duplicate identity.', 400);
        }
        $entry_ids[$entry_id] = true;
        $merge_ids[$merge] = true;
        $normalized[] = $candidate;
    }
    return $normalized;
}

function gdhe_quote_line_changed()
{
    return gdhe_quote_line_error('gdhe_quote_lines_changed', 'One or more quote lines changed.', 409);
}

function gdhe_rest_quote_line_validations_internal($request)
{
    $lines = gdhe_quote_line_request_document($request);
    if (!is_array($lines)) {
        return $lines;
    }
    $paths = array();
    $submitted_articles = array();
    foreach ($lines as $line) {
        if ($line['lineKind'] === 'configured_product') {
            $paths[$line['canonicalPath']] = true;
            if (is_string($line['selection']['articleNumber'])) {
                $submitted_articles[$line['selection']['articleNumber']] = true;
            }
        } else {
            $submitted_articles[$line['articleNumber']] = true;
        }
    }
    $first = gdhe_quote_line_candidate_query(array_keys($paths), array());
    if ($first['overflow']) {
        return gdhe_quote_line_error('gdhe_quote_line_validation_unavailable', 'Quote-line validation is unavailable.', 500);
    }
    $path_documents = array();
    $path_conflicts = array();
    $requested_paths = array_fill_keys(array_keys($paths), true);
    foreach ($first['path'] as $post) {
        $source = gdhe_quote_source_for_post($post);
        if (is_array($source) && $source['kind'] === 'configured_product') {
            $path_documents[$source['document']['product']['publicPath']][] = $source['document'];
            continue;
        }
        $candidate_path = (string) get_post_meta((int) gdhe_object_value($post, 'ID', 0), '_gdhe_public_path', true);
        if (isset($requested_paths[$candidate_path])) {
            $path_conflicts[$candidate_path] = true;
        }
    }
    $recovered_articles = $submitted_articles;
    foreach ($lines as $line) {
        if ($line['lineKind'] !== 'configured_product' || $line['selection']['resolution'] !== 'refresh_from_selection') {
            continue;
        }
        $documents = $path_documents[$line['canonicalPath']] ?? array();
        if (isset($path_conflicts[$line['canonicalPath']]) || count($documents) !== 1) {
            return gdhe_quote_line_changed();
        }
        foreach ($documents[0]['articleNumberOptions'] as $option) {
            if ($option['lengthMeters'] === $line['selection']['lengthMeters'] && $option['color'] === $line['selection']['color']) {
                $recovered_articles[$option['articleNumber']] = true;
            }
        }
    }
    $second = gdhe_quote_line_candidate_query(array(), array_keys($recovered_articles));
    if ($second['overflow']) {
        return gdhe_quote_line_error('gdhe_quote_line_validation_unavailable', 'Quote-line validation is unavailable.', 500);
    }
    $first['article'] = $second['article'];
    $article_sources = array();
    $article_conflicts = array();
    $requested_articles = array_fill_keys(array_keys($recovered_articles), true);
    foreach ($first['article'] as $post) {
        $source = gdhe_quote_source_for_post($post);
        $claims = array_values(array_filter(
            gdhe_claimed_article_numbers_for_post($post),
            static fn(string $article): bool => isset($requested_articles[$article])
        ));
        if (!is_array($source)) {
            foreach ($claims as $article) {
                $article_conflicts[$article] = true;
            }
            continue;
        }
        if ($source['kind'] === 'configured_product') {
            foreach ($source['document']['articleNumberOptions'] as $option) {
                $article_sources[$option['articleNumber']][] = array('kind' => 'configured_product', 'document' => $source['document'], 'option' => $option);
            }
        } else {
            $article_sources[$source['document']['articleNumber']][] = array('kind' => 'catalog_accessory', 'document' => $source['document']);
        }
    }
    $resolved = array();
    foreach ($lines as $line) {
        if ($line['lineKind'] === 'catalog_accessory') {
            $owners = $article_sources[$line['articleNumber']] ?? array();
            if (isset($article_conflicts[$line['articleNumber']])
                || count($owners) !== 1
                || $owners[0]['kind'] !== 'catalog_accessory') {
                return gdhe_quote_line_changed();
            }
            $document = $owners[0]['document'];
            $resolved[] = array(
                'entryId' => $line['entryId'], 'lineKind' => 'catalog_accessory',
                'resolution' => 'resolved_article_number', 'model' => $document['product']['model'],
                'publicPath' => null, 'articleNumber' => $document['articleNumber'],
                'quantityUnit' => 'piece', 'quantity' => $line['quantity'],
            );
            continue;
        }
        $documents = $path_documents[$line['canonicalPath']] ?? array();
        if (isset($path_conflicts[$line['canonicalPath']]) || count($documents) !== 1) {
            return gdhe_quote_line_changed();
        }
        $document = $documents[0];
        $selection = $line['selection'];
        if ($selection['resolution'] === 'sales_follow_up') {
            $color_match = array_values(array_filter($document['articleNumberOptions'], static fn(array $option): bool => $option['color'] === $selection['color']));
            if ($color_match === array() || $document['configurationPolicy']['customLength']['enabled'] !== true) {
                return gdhe_quote_line_changed();
            }
            $response_selection = $selection;
            unset($response_selection['resolution']);
            $resolved[] = array(
                'entryId' => $line['entryId'], 'lineKind' => 'configured_product', 'resolution' => 'sales_follow_up',
                'model' => $document['product']['model'], 'publicPath' => $document['product']['publicPath'],
                'articleNumber' => null, 'selection' => $response_selection, 'packaging' => $line['packaging'],
                'quantityUnit' => 'piece', 'quantity' => $line['quantity'],
            );
            continue;
        }
        $article = $selection['articleNumber'];
        if ($selection['resolution'] === 'refresh_from_selection') {
            $matches = array_values(array_filter($document['articleNumberOptions'], static fn(array $option): bool => $option['lengthMeters'] === $selection['lengthMeters'] && $option['color'] === $selection['color']));
            if (count($matches) !== 1) {
                return gdhe_quote_line_changed();
            }
            $article = $matches[0]['articleNumber'];
        }
        $owners = $article_sources[$article] ?? array();
        if (isset($article_conflicts[$article])
            || count($owners) !== 1
            || $owners[0]['kind'] !== 'configured_product'
            || $owners[0]['document']['product']['publicPath'] !== $line['canonicalPath']
            || $owners[0]['option']['lengthMeters'] !== $selection['lengthMeters']
            || $owners[0]['option']['color'] !== $selection['color']) {
            return gdhe_quote_line_changed();
        }
        $response_selection = $owners[0]['option'];
        unset($response_selection['resolution']);
        $resolved[] = array(
            'entryId' => $line['entryId'], 'lineKind' => 'configured_product', 'resolution' => 'resolved_article_number',
            'model' => $document['product']['model'], 'publicPath' => $document['product']['publicPath'],
            'articleNumber' => $article, 'selection' => array(
                'type' => 'article_number', 'articleNumber' => $article,
                'lengthMeters' => $response_selection['lengthMeters'], 'color' => $response_selection['color'],
            ), 'packaging' => $line['packaging'], 'quantityUnit' => 'piece', 'quantity' => $line['quantity'],
        );
    }
    return gdhe_quote_line_success($resolved);
}

function gdhe_rest_quote_line_validations($request)
{
    try {
        return gdhe_rest_quote_line_validations_internal($request);
    } catch (Throwable $error) {
        return gdhe_quote_line_error(
            'gdhe_quote_line_validation_unavailable',
            'Quote-line validation is unavailable.',
            500
        );
    }
}

function gdhe_register_quote_line_validation_route(): void
{
    register_rest_route('gdhe/v1', '/quote-line-validations', array(
        'methods' => 'POST', 'callback' => 'gdhe_rest_quote_line_validations',
        'permission_callback' => '__return_true',
    ));
}

function gdhe_quote_line_validation_pre_dispatch($result, $server, $request)
{
    if ($result !== null
        || !is_object($request)
        || $request->get_method() !== 'POST'
        || $request->get_route() !== '/gdhe/v1/quote-line-validations') {
        return $result;
    }
    return gdhe_rest_quote_line_validations($request);
}
