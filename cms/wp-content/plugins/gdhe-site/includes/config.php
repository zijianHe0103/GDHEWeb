<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_load_json_config(string $relative_path): array
{
    $path = GDHE_SITE_PATH . ltrim($relative_path, '/');
    $contents = is_readable($path) ? file_get_contents($path) : false;

    if ($contents === false) {
        return array();
    }

    $decoded = json_decode($contents, true);

    return is_array($decoded) ? $decoded : array();
}
