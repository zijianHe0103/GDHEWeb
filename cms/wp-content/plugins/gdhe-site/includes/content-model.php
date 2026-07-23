<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_register_content_model(): void
{
    $model = gdhe_load_json_config('config/content-model.json');
    $post_types = isset($model['postTypes']) && is_array($model['postTypes']) ? $model['postTypes'] : array();
    $taxonomies = isset($model['taxonomies']) && is_array($model['taxonomies']) ? $model['taxonomies'] : array();

    foreach (array_keys($post_types) as $post_type) {
        register_post_type($post_type, $post_types[$post_type]);
    }

    foreach (array_keys($taxonomies) as $taxonomy) {
        $definition = $taxonomies[$taxonomy];
        $object_types = isset($definition['object_type']) ? $definition['object_type'] : array();
        $args = isset($definition['args']) ? $definition['args'] : array();
        register_taxonomy($taxonomy, $object_types, $args);
    }
}
