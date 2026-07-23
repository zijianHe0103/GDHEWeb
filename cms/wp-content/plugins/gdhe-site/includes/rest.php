<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_register_rest_api(): void
{
    $route = gdhe_load_json_config('config/rest-route.json');
    register_rest_route('gdhe/v1', '/schema', $route);

    $schema = gdhe_load_json_config('config/schema.v1.json');
    $public_types = isset($schema['publicTypes']) ? $schema['publicTypes'] : array();
    $field = gdhe_load_json_config('config/rest-field.json');

    foreach ($public_types as $post_type) {
        register_rest_field($post_type, 'gdhe', $field);
        add_filter('rest_prepare_' . $post_type, 'gdhe_filter_public_rest_response', 20, 1);
    }
}

function gdhe_rest_schema()
{
    return rest_ensure_response(gdhe_load_json_config('config/schema.v1.json'));
}

function gdhe_rest_content(array $object, string $field_name = '', $request = null): array
{
    $post_id = isset($object['id']) ? (int) $object['id'] : 0;
    if ($post_id === 0 || !function_exists('get_field')) {
        return array();
    }

    $allowlist = array('schema_version', 'template_key', 'summary', 'hero', 'relationships', 'modules');
    $content = array();

    foreach ($allowlist as $field_name) {
        $value = get_field($field_name, $post_id, true);
        if (!gdhe_rest_is_authorized_edit_context($request, $post_id)) {
            $value = gdhe_filter_public_references($field_name, $value);
        }
        $content[$field_name] = gdhe_rest_sanitize_value($value);
    }

    return $content;
}

function gdhe_rest_is_authorized_edit_context($request, int $post_id): bool
{
    if (!is_object($request)) {
        return false;
    }

    $context = call_user_func(array($request, 'get_param'), 'context');

    return $context === 'edit' && current_user_can('edit_post', $post_id);
}

function gdhe_filter_public_references(string $field_name, $value)
{
    if ($field_name === 'relationships') {
        return gdhe_filter_public_relationships($value);
    }

    if ($field_name === 'hero' || $field_name === 'modules') {
        return gdhe_filter_public_media_references($value);
    }

    return $value;
}

function gdhe_filter_public_relationships($value)
{
    if (!is_array($value)) {
        return array();
    }

    $clean = array();

    foreach (array_keys($value) as $relationship_name) {
        $references = is_array($value[$relationship_name]) ? $value[$relationship_name] : array();
        $clean[$relationship_name] = array();

        foreach ($references as $reference_id) {
            $reference_id = (int) $reference_id;
            if (gdhe_is_public_post_reference($reference_id)) {
                $clean[$relationship_name][] = $reference_id;
            }
        }
    }

    return $clean;
}

function gdhe_filter_public_media_references($value)
{
    if (!is_array($value)) {
        return $value;
    }

    $clean = array();

    foreach (array_keys($value) as $key) {
        if ($key === 'media_reference') {
            $reference_id = (int) $value[$key];
            $clean[$key] = gdhe_is_public_attachment_reference($reference_id) ? $reference_id : null;
            continue;
        }

        $clean[$key] = gdhe_filter_public_media_references($value[$key]);
    }

    return $clean;
}

function gdhe_is_public_post_reference(int $post_id): bool
{
    $post = get_post($post_id);
    if ($post === null) {
        return false;
    }

    $post_data = get_object_vars($post);
    if ($post_data['post_type'] === 'attachment' || $post_data['post_status'] !== 'publish') {
        return false;
    }

    $post_type = get_post_type_object($post_data['post_type']);

    return $post_type !== null && is_post_type_viewable($post_type);
}

function gdhe_is_public_attachment_reference(int $attachment_id): bool
{
    $attachment = get_post($attachment_id);
    if ($attachment === null) {
        return false;
    }

    $attachment_data = get_object_vars($attachment);
    if ($attachment_data['post_type'] !== 'attachment') {
        return false;
    }

    if (!in_array($attachment_data['post_status'], array('inherit', 'publish'), true)) {
        return false;
    }

    $parent_id = (int) $attachment_data['post_parent'];
    if ($parent_id === 0 || !gdhe_is_public_post_reference($parent_id)) {
        return false;
    }

    return wp_attachment_is_image($attachment_id) && wp_get_attachment_url($attachment_id) !== false;
}

function gdhe_rest_sanitize_value($value)
{
    if (is_array($value)) {
        $clean = array();
        foreach (array_keys($value) as $key) {
            $clean[$key] = gdhe_rest_sanitize_value($value[$key]);
        }
        return $clean;
    }

    if (is_bool($value) || is_int($value) || is_float($value) || $value === null) {
        return $value;
    }

    return is_scalar($value) ? wp_kses_post((string) $value) : null;
}

function gdhe_filter_public_rest_response($response)
{
    $data = call_user_func(array($response, 'get_data'));

    if (is_array($data)) {
        unset($data['acf'], $data['meta']);
        call_user_func(array($response, 'set_data'), $data);
    }

    return $response;
}
