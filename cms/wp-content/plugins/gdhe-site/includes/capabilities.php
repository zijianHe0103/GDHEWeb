<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_site_activate(): void
{
    gdhe_register_content_model();
    gdhe_apply_role_capabilities('add_cap');
    flush_rewrite_rules();
}

function gdhe_site_deactivate(): void
{
    gdhe_apply_role_capabilities('remove_cap');
    flush_rewrite_rules();
}

function gdhe_apply_role_capabilities(string $method): void
{
    $capabilities = gdhe_load_json_config('config/capabilities.json');

    foreach (array_keys($capabilities) as $role_name) {
        $role = get_role($role_name);
        if ($role === null) {
            continue;
        }

        foreach ($capabilities[$role_name] as $capability) {
            call_user_func(array($role, $method), $capability);
        }
    }
}
