<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_register_field_groups(): void
{
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    $groups = gdhe_load_json_config('config/field-groups.v3.json');

    foreach ($groups as $group) {
        acf_add_local_field_group($group);
    }
}

add_filter('acf/update_value/type=flexible_content', 'gdhe_prepare_modules_for_save', 5, 3);
add_filter('acf/validate_value/name=modules', 'gdhe_validate_modules_field', 20, 4);
