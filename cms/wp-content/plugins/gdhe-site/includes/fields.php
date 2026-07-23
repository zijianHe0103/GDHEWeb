<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_register_field_groups(): void
{
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    $groups = gdhe_load_json_config('config/field-groups.v1.json');

    foreach ($groups as $group) {
        acf_add_local_field_group($group);
    }
}
