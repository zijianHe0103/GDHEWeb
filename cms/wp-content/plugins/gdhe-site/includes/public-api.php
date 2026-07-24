<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_register_public_api_routes(): void
{
    $permission = '__return_true';

    $resolve = array();
    $resolve['methods'] = 'GET';
    $resolve['callback'] = 'gdhe_rest_resolve';
    $resolve['permission_callback'] = $permission;
    register_rest_route('gdhe/v1', '/resolve', $resolve);

    $collection = array();
    $collection['methods'] = 'GET';
    $collection['callback'] = 'gdhe_rest_collection';
    $collection['permission_callback'] = $permission;
    $collection_route = '/collection/(?P' . chr(60) . 'type' . chr(62) . '[a-z_]+)';
    register_rest_route('gdhe/v1', $collection_route, $collection);

    $navigation = array();
    $navigation['methods'] = 'GET';
    $navigation['callback'] = 'gdhe_rest_navigation';
    $navigation['permission_callback'] = $permission;
    register_rest_route('gdhe/v1', '/navigation', $navigation);

    $manifest = array();
    $manifest['methods'] = 'GET';
    $manifest['callback'] = 'gdhe_rest_route_manifest';
    $manifest['permission_callback'] = $permission;
    register_rest_route('gdhe/v1', '/route-manifest', $manifest);
}

function gdhe_request_param($request, string $name, $default = '')
{
    $value = is_object($request)
        ? call_user_func(array($request, 'get_param'), $name)
        : null;
    return $value === null ? $default : $value;
}

function gdhe_request_header($request, string $name): string
{
    if (!is_object($request)) {
        return '';
    }
    return (string) call_user_func(array($request, 'get_header'), $name);
}

function gdhe_object_value($object, string $key, $default = null)
{
    if (!is_object($object)) {
        return $default;
    }
    $values = get_object_vars($object);
    return array_key_exists($key, $values) ? $values[$key] : $default;
}

function gdhe_public_identifier(int $post_id, string $meta_key = '_gdhe_public_id'): string
{
    $identifier = (string) get_post_meta($post_id, $meta_key, true);
    return gdhe_is_uuid_v4($identifier) ? strtolower($identifier) : '';
}

function gdhe_assign_public_identifier(int $post_id, $post, bool $update): void
{
    if (!is_object($post) || wp_is_post_revision($post_id)) {
        return;
    }
    $post_type = (string) gdhe_object_value($post, 'post_type', '');
    if ($post_type === 'attachment') {
        $meta_key = '_gdhe_public_media_id';
    } elseif (in_array($post_type, gdhe_public_post_types(), true)) {
        $meta_key = '_gdhe_public_id';
    } else {
        return;
    }
    $current = (string) get_post_meta($post_id, $meta_key, true);
    if ($current === '') {
        update_post_meta($post_id, $meta_key, wp_generate_uuid4());
    }
}

function gdhe_rest_error(string $code, string $message, int $status, string $field = '')
{
    $request_id = wp_generate_uuid4();
    $body = array();
    $body['apiVersion'] = '1';
    $body['code'] = $code;
    $body['message'] = $message;
    $body['status'] = $status;
    $body['requestId'] = $request_id;
    if ($field !== '') {
        $detail = array();
        $detail['field'] = $field;
        $detail['code'] = $code;
        $body['details'] = array($detail);
    }
    $response = rest_ensure_response($body);
    call_user_func(array($response, 'set_status'), $status);
    call_user_func(array($response, 'header'), 'Cache-Control', 'no-store');
    call_user_func(array($response, 'header'), 'Content-Type', 'application/json; charset=UTF-8');
    call_user_func(array($response, 'header'), 'X-GDHE-Request-ID', $request_id);
    return $response;
}

function gdhe_validate_contract_request($request)
{
    $locale = (string) gdhe_request_param($request, 'locale', 'en');
    if ($locale !== 'en') {
        return gdhe_rest_error('gdhe_invalid_locale', 'Only the English locale is available.', 400, 'locale');
    }
    $schema = (string) gdhe_request_param($request, 'schema', GDHE_SCHEMA_VERSION);
    if ($schema !== GDHE_SCHEMA_VERSION) {
        return gdhe_rest_error('gdhe_invalid_schema', 'Unsupported content schema version.', 400, 'schema');
    }
    return true;
}

function gdhe_public_post_types(): array
{
    $schema = gdhe_load_json_config('config/schema.v3.json');
    $types = isset($schema['publicTypes']) && is_array($schema['publicTypes'])
        ? $schema['publicTypes']
        : array();
    return array_merge(array('page', 'post'), $types);
}

function gdhe_collection_post_types(): array
{
    return array('post', 'product', 'market', 'reference', 'support_article', 'download');
}

function gdhe_public_path_for_post($post): string
{
    if (!is_object($post)) {
        return '';
    }
    $post_id = (int) gdhe_object_value($post, 'ID', 0);
    $post_type = (string) gdhe_object_value($post, 'post_type', '');
    $slug = (string) gdhe_object_value($post, 'post_name', '');
    $explicit = (string) get_post_meta($post_id, '_gdhe_public_path', true);
    if ($explicit !== '') {
        return gdhe_validate_public_path($explicit) ? $explicit : '';
    }

    $prefixes = array();
    $prefixes['post'] = 'news';
    $prefixes['product'] = 'products';
    $prefixes['market'] = 'markets';
    $prefixes['reference'] = 'references';
    $prefixes['download'] = 'downloads';
    if ($post_type === 'page') {
        $path = '/' . $slug . '/';
        return gdhe_validate_public_path($path) ? $path : '';
    }
    if (!isset($prefixes[$post_type])) {
        if ($post_type === 'support_article') {
            $topics = get_the_terms($post_id, 'support_topic');
            if (!is_array($topics) || count($topics) !== 1) {
                return '';
            }
            $topic_slug = (string) gdhe_object_value($topics[0], 'slug', '');
            $support_path = '/support/' . $topic_slug . '/' . $slug . '/';
            return gdhe_validate_public_path($support_path) ? $support_path : '';
        }
        return '';
    }
    $path = '/' . $prefixes[$post_type] . '/' . $slug . '/';
    return gdhe_validate_public_path($path) ? $path : '';
}

function gdhe_validate_public_path(string $path): bool
{
    if ($path === '/') {
        return true;
    }
    if ($path === '' || 500 < strlen($path)) {
        return false;
    }
    if ($path[0] !== '/' || substr($path, -1) !== '/') {
        return false;
    }
    if (str_contains($path, '//') || str_contains($path, '..') || str_contains($path, '%')) {
        return false;
    }
    return preg_match('#^/(?:[a-z0-9](?:[a-z0-9-]{0,62})/)+$#', $path) === 1;
}

function gdhe_template_keys(): array
{
    return array('standard', 'product', 'market', 'reference', 'support_article', 'download');
}

function gdhe_template_matches_public_type(string $type, string $template): bool
{
    $expected = array();
    $expected['page'] = 'standard';
    $expected['post'] = 'standard';
    $expected['product'] = 'product';
    $expected['market'] = 'market';
    $expected['reference'] = 'reference';
    $expected['support_article'] = 'support_article';
    $expected['download'] = 'download';
    return isset($expected[$type]) && $expected[$type] === $template;
}

function gdhe_all_published_public_posts(): array
{
    $args = array();
    $args['post_type'] = gdhe_public_post_types();
    $args['post_status'] = 'publish';
    $args['numberposts'] = -1;
    $args['orderby'] = 'ID';
    $args['order'] = 'ASC';
    $posts = get_posts($args);
    return is_array($posts) ? $posts : array();
}

function gdhe_find_public_posts_by_path(string $path): array
{
    $matches = array();
    foreach (gdhe_all_published_public_posts() as $post) {
        if (gdhe_public_path_for_post($post) === $path) {
            $matches[] = $post;
        }
    }
    return $matches;
}

function gdhe_content_reference(int $post_id)
{
    if (!gdhe_is_public_post_reference($post_id)) {
        return null;
    }
    $public_id = gdhe_public_identifier($post_id);
    if ($public_id === '') {
        return null;
    }
    $post = get_post($post_id);
    $public_path = gdhe_public_path_for_post($post);
    if ($public_path === '') {
        return null;
    }
    $reference = array();
    $reference['id'] = $public_id;
    $reference['type'] = (string) gdhe_object_value($post, 'post_type', '');
    $reference['title'] = wp_strip_all_tags(get_the_title($post_id));
    $reference['publicPath'] = $public_path;
    return $reference;
}

function gdhe_normalize_public_relations($value): array
{
    $filtered = gdhe_filter_public_relationships($value);
    $relations = array();
    $allowed = array('products', 'markets', 'references', 'support_articles', 'downloads');
    foreach ($allowed as $name) {
        $relations[$name] = array();
        $references = isset($filtered[$name]) && is_array($filtered[$name]) ? $filtered[$name] : array();
        foreach (array_slice($references, 0, 20) as $post_id) {
            $reference = gdhe_content_reference((int) $post_id);
            if (is_array($reference)) {
                $relations[$name][] = $reference;
            }
        }
    }
    return $relations;
}

function gdhe_build_content_envelope($post)
{
    if (!is_object($post)) {
        return new WP_Error('gdhe_not_found', 'Content was not found.');
    }
    $post_id = (int) gdhe_object_value($post, 'ID', 0);
    $status = (string) gdhe_object_value($post, 'post_status', '');
    $type = (string) gdhe_object_value($post, 'post_type', '');
    if ($status !== 'publish' || !in_array($type, gdhe_public_post_types(), true)) {
        return new WP_Error('gdhe_not_found', 'Content was not found.');
    }
    if (!function_exists('get_field')) {
        return new WP_Error('gdhe_contract_invariant', 'Content normalization is unavailable.');
    }

    $schema_version = get_field('schema_version', $post_id, true);
    $public_id = gdhe_public_identifier($post_id);
    $modules = get_field('modules', $post_id, true);
    $modules = is_array($modules) ? $modules : array();
    $module_validation = gdhe_validate_module_collection($modules, false);
    $details = gdhe_normalize_type_details($type, $post_id);
    $public_path = gdhe_public_path_for_post($post);
    $template = (string) get_field('template_key', $post_id, true);
    if ($template === '') {
        $template = 'standard';
    }
    if ($schema_version !== GDHE_SCHEMA_VERSION
        || $public_id === ''
        || $public_path === ''
        || !gdhe_template_matches_public_type($type, $template)
        || is_wp_error($module_validation)
        || (!is_array($details) && !is_object($details))) {
        return new WP_Error('gdhe_contract_invariant', 'Content does not satisfy the public contract.');
    }

    $envelope = array();
    $envelope['apiVersion'] = '1';
    $envelope['schemaVersion'] = GDHE_SCHEMA_VERSION;
    $envelope['id'] = $public_id;
    $envelope['type'] = $type;
    $envelope['templateKey'] = $template;
    $envelope['locale'] = 'en';
    $envelope['publicPath'] = $public_path;
    $envelope['title'] = wp_strip_all_tags(get_the_title($post_id));
    $excerpt = trim(wp_strip_all_tags((string) gdhe_object_value($post, 'post_excerpt', '')));
    if ($excerpt !== '') {
        $envelope['excerpt'] = $excerpt;
    }
    $envelope['publishedAt'] = get_post_time(DATE_RFC3339, true, $post);
    $envelope['modifiedAt'] = get_post_modified_time(DATE_RFC3339, true, $post);
    $thumbnail_id = (int) get_post_thumbnail_id($post_id);
    if ($thumbnail_id !== 0) {
        $media = gdhe_normalize_media_reference($thumbnail_id);
        if (is_array($media)) {
            $envelope['featuredMedia'] = $media;
        }
    }
    $envelope['modules'] = gdhe_normalize_public_modules($modules);
    $envelope['relations'] = gdhe_normalize_public_relations(get_field('relationships', $post_id, true));
    $envelope['details'] = $details;
    return $envelope;
}

function gdhe_response_with_cache_headers(array $data, $request)
{
    $encoded = wp_json_encode($data);
    $etag = '"' . hash('sha256', (string) $encoded) . '"';
    $request_id = wp_generate_uuid4();
    $last_modified = '';
    if (isset($data['modifiedAt'])) {
        $timestamp = strtotime((string) $data['modifiedAt']);
        if ($timestamp !== false) {
            $last_modified = gmdate('D, d M Y H:i:s', $timestamp) . ' GMT';
        }
    }
    if (gdhe_request_header($request, 'if-none-match') === $etag) {
        $response = rest_ensure_response(null);
        call_user_func(array($response, 'set_status'), 304);
        call_user_func(array($response, 'header'), 'ETag', $etag);
        call_user_func(array($response, 'header'), 'Cache-Control', 'public, max-age=60');
        call_user_func(array($response, 'header'), 'X-GDHE-Request-ID', $request_id);
        if ($last_modified !== '') {
            call_user_func(array($response, 'header'), 'Last-Modified', $last_modified);
        }
        return $response;
    }
    $response = rest_ensure_response($data);
    call_user_func(array($response, 'header'), 'ETag', $etag);
    call_user_func(array($response, 'header'), 'Cache-Control', 'public, max-age=60');
    call_user_func(array($response, 'header'), 'Content-Type', 'application/json; charset=UTF-8');
    call_user_func(array($response, 'header'), 'X-GDHE-Request-ID', $request_id);
    if ($last_modified !== '') {
        call_user_func(array($response, 'header'), 'Last-Modified', $last_modified);
    }
    return $response;
}

function gdhe_rest_resolve($request)
{
    $contract = gdhe_validate_contract_request($request);
    if ($contract !== true) {
        return $contract;
    }
    $path = (string) gdhe_request_param($request, 'path');
    if (!gdhe_validate_public_path($path)) {
        return gdhe_rest_error('gdhe_invalid_path', 'Path must be a canonical English public path.', 400, 'path');
    }
    $matches = gdhe_find_public_posts_by_path($path);
    if ($matches === array()) {
        return gdhe_rest_error('gdhe_not_found', 'Content was not found.', 404, 'path');
    }
    if (1 < count($matches)) {
        return gdhe_rest_error('gdhe_route_conflict', 'The canonical path is not unique.', 409, 'path');
    }
    $envelope = gdhe_build_content_envelope($matches[0]);
    if (is_wp_error($envelope)) {
        return gdhe_rest_error('gdhe_contract_invariant', 'Content does not satisfy the public contract.', 500);
    }
    return gdhe_response_with_cache_headers($envelope, $request);
}

function gdhe_collection_filter_map(): array
{
    $map = array();
    $map['product'] = 'product_category';
    $map['support_article'] = 'support_topic';
    $map['download'] = 'document_type';
    return $map;
}

function gdhe_collection_eligible_references(array $posts): array
{
    $path_counts = array();
    foreach (gdhe_all_published_public_posts() as $published_post) {
        $published_path = gdhe_public_path_for_post($published_post);
        if ($published_path !== '') {
            $path_counts[$published_path] = isset($path_counts[$published_path]) ? $path_counts[$published_path] + 1 : 1;
        }
    }
    $items = array();
    foreach ($posts as $post) {
        $envelope = gdhe_build_content_envelope($post);
        if (is_wp_error($envelope)) {
            continue;
        }
        if (($path_counts[$envelope['publicPath']] ?? 0) !== 1) {
            continue;
        }
        $reference = array();
        $reference['id'] = $envelope['id'];
        $reference['type'] = $envelope['type'];
        $reference['title'] = $envelope['title'];
        $reference['publicPath'] = $envelope['publicPath'];
        $items[] = $reference;
    }
    return $items;
}

function gdhe_rest_collection($request)
{
    $contract = gdhe_validate_contract_request($request);
    if ($contract !== true) {
        return $contract;
    }
    $type = sanitize_key((string) gdhe_request_param($request, 'type'));
    if (!in_array($type, gdhe_collection_post_types(), true)) {
        return gdhe_rest_error('gdhe_invalid_collection_type', 'Collection type is not allowed.', 400, 'type');
    }
    $page = (int) gdhe_request_param($request, 'page', 1);
    $per_page = (int) gdhe_request_param($request, 'per_page', 10);
    if ($page < 1 || $per_page < 1 || 100 < $per_page) {
        return gdhe_rest_error('gdhe_invalid_pagination', 'Pagination is outside the allowed range.', 400, 'page');
    }
    $sort = (string) gdhe_request_param($request, 'sort', 'modified_desc');
    if (!in_array($sort, array('modified_desc', 'title_asc'), true)) {
        return gdhe_rest_error('gdhe_invalid_sort', 'Sort value is not allowed.', 400, 'sort');
    }

    $args = array();
    $args['post_type'] = $type;
    $args['post_status'] = 'publish';
    $schema_condition = array();
    $schema_condition['key'] = 'schema_version';
    $schema_condition['value'] = GDHE_SCHEMA_VERSION;
    $schema_condition['compare'] = '=';
    $identifier_condition = array();
    $identifier_condition['key'] = '_gdhe_public_id';
    $identifier_condition['value'] = '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
    $identifier_condition['compare'] = 'REGEXP';
    $args['meta_query'] = array($schema_condition, $identifier_condition);
    $args['posts_per_page'] = -1;
    $args['no_found_rows'] = true;
    $ordering = array();
    if ($sort === 'title_asc') {
        $ordering['title'] = 'ASC';
        $ordering['name'] = 'ASC';
    } else {
        $ordering['modified'] = 'DESC';
        $ordering['name'] = 'ASC';
    }
    $args['orderby'] = $ordering;

    $filter = (string) gdhe_request_param($request, 'filter');
    if ($filter !== '') {
        $parts = explode(':', $filter, 2);
        $filter_map = gdhe_collection_filter_map();
        if (count($parts) !== 2 || !isset($filter_map[$type]) || $parts[0] !== $filter_map[$type] || sanitize_title($parts[1]) !== $parts[1]) {
            return gdhe_rest_error('gdhe_invalid_filter', 'Filter value is not allowed.', 400, 'filter');
        }
        $tax_query = array();
        $tax_item = array();
        $tax_item['taxonomy'] = $parts[0];
        $tax_item['field'] = 'slug';
        $tax_item['terms'] = array($parts[1]);
        $tax_query[] = $tax_item;
        $args['tax_query'] = $tax_query;
    }

    $query = new WP_Query($args);
    $query_posts = gdhe_object_value($query, 'posts', array());
    $eligible = gdhe_collection_eligible_references(is_array($query_posts) ? $query_posts : array());
    $total = count($eligible);
    $items = array_slice($eligible, ($page - 1) * $per_page, $per_page);
    $data = array();
    $data['apiVersion'] = '1';
    $data['schemaVersion'] = GDHE_SCHEMA_VERSION;
    $data['locale'] = 'en';
    $data['type'] = $type;
    $data['sort'] = $sort;
    $data['filter'] = $filter === '' ? null : $filter;
    $data['page'] = $page;
    $data['perPage'] = $per_page;
    $data['total'] = $total;
    $data['items'] = $items;
    return gdhe_response_with_cache_headers($data, $request);
}

function gdhe_rest_navigation($request)
{
    $contract = gdhe_validate_contract_request($request);
    if ($contract !== true) {
        return $contract;
    }
    $args = array();
    $args['post_type'] = gdhe_public_post_types();
    $args['post_status'] = 'publish';
    $args['numberposts'] = -1;
    $args['meta_key'] = '_gdhe_navigation_item';
    $args['meta_value'] = '1';
    $ordering = array();
    $ordering['menu_order'] = 'ASC';
    $ordering['title'] = 'ASC';
    $ordering['name'] = 'ASC';
    $args['orderby'] = $ordering;
    $posts = get_posts($args);
    $items = array();
    foreach ($posts as $post) {
        if (is_wp_error(gdhe_build_content_envelope($post))) {
            continue;
        }
        $item = array();
        $item['id'] = gdhe_public_identifier((int) gdhe_object_value($post, 'ID', 0));
        $item['label'] = wp_strip_all_tags(get_the_title($post));
        $item['publicPath'] = gdhe_public_path_for_post($post);
        $item['children'] = array();
        $items[] = $item;
    }
    if (100 < count($items)) {
        return gdhe_rest_error('gdhe_contract_invariant', 'Navigation exceeds the public contract boundary.', 500);
    }
    $data = array();
    $data['apiVersion'] = '1';
    $data['schemaVersion'] = GDHE_SCHEMA_VERSION;
    $data['locale'] = 'en';
    $data['items'] = $items;
    return gdhe_response_with_cache_headers($data, $request);
}

function gdhe_rest_route_manifest($request)
{
    $contract = gdhe_validate_contract_request($request);
    if ($contract !== true) {
        return $contract;
    }
    $routes = array();
    $seen = array();
    foreach (gdhe_all_published_public_posts() as $post) {
        if (is_wp_error(gdhe_build_content_envelope($post))) {
            continue;
        }
        $path = gdhe_public_path_for_post($post);
        if (!gdhe_validate_public_path($path)) {
            continue;
        }
        if (isset($seen[$path])) {
            return gdhe_rest_error('gdhe_route_conflict', 'The route manifest contains a canonical conflict.', 409);
        }
        $seen[$path] = true;
        $route = array();
        $route['id'] = gdhe_public_identifier((int) gdhe_object_value($post, 'ID', 0));
        $route['type'] = (string) gdhe_object_value($post, 'post_type', '');
        $route['publicPath'] = $path;
        $route['modifiedAt'] = get_post_modified_time(DATE_RFC3339, true, $post);
        $routes[] = $route;
    }
    if (5000 < count($routes)) {
        return gdhe_rest_error('gdhe_contract_invariant', 'Route manifest exceeds the public contract boundary.', 500);
    }
    usort($routes, 'gdhe_compare_routes');
    $data = array();
    $data['apiVersion'] = '1';
    $data['schemaVersion'] = GDHE_SCHEMA_VERSION;
    $data['locale'] = 'en';
    $data['routes'] = $routes;
    return gdhe_response_with_cache_headers($data, $request);
}

function gdhe_compare_routes(array $left, array $right): int
{
    return strcmp($left['publicPath'], $right['publicPath']);
}
