<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_module_types(): array
{
    $schema = gdhe_load_json_config('config/schema.v3.json');
    return isset($schema['moduleTypes']) && is_array($schema['moduleTypes'])
        ? array_values($schema['moduleTypes'])
        : array();
}

function gdhe_module_field_key(string $layout, string $field): string
{
    $prefixes = array();
    $prefixes['hero'] = 'hero';
    $prefixes['rich_text'] = 'rich';
    $prefixes['card_grid'] = 'cards';
    $prefixes['split_media'] = 'split';
    $prefixes['accordion'] = 'accordion';
    $prefixes['data_table'] = 'table';
    $prefixes['cta_banner'] = 'cta';

    if (!isset($prefixes[$layout])) {
        return $field;
    }
    if ($field === 'module_id') {
        return 'field_gdhe_module_' . $prefixes[$layout] . '_id_v2';
    }
    if ($field === 'module_schema_version') {
        return 'field_gdhe_module_' . $prefixes[$layout] . '_schema_version_v2';
    }
    return $field;
}

function gdhe_module_value(array $module, string $field, string $layout = '')
{
    if (array_key_exists($field, $module)) {
        return $module[$field];
    }
    $key = gdhe_module_field_key($layout, $field);
    return array_key_exists($key, $module) ? $module[$key] : null;
}

function gdhe_module_set_value(array $module, string $field, $value, string $layout): array
{
    $raw = false;
    foreach (array_keys($module) as $existing_key) {
        if (is_string($existing_key) && str_starts_with($existing_key, 'field_')) {
            $raw = true;
            break;
        }
    }
    $key = $raw ? gdhe_module_field_key($layout, $field) : $field;
    $module[$key] = $value;
    return $module;
}

function gdhe_module_layout(array $module): string
{
    $layout = isset($module['acf_fc_layout']) ? $module['acf_fc_layout'] : '';
    return is_scalar($layout) ? sanitize_key((string) $layout) : '';
}

function gdhe_is_uuid_v4($value): bool
{
    return is_string($value)
        && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $value) === 1;
}

function gdhe_public_html_allowlist(): array
{
    $allowed = array();
    foreach (array('p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'blockquote', 'code') as $tag) {
        $allowed[$tag] = array();
    }
    $allowed['a'] = array();
    $allowed['a']['href'] = true;
    $allowed['a']['target'] = true;
    $allowed['a']['rel'] = true;
    return $allowed;
}

function gdhe_sanitize_public_html($value): string
{
    if (!is_scalar($value)) {
        return '';
    }
    return trim(wp_kses(
        (string) $value,
        gdhe_public_html_allowlist(),
        array('http', 'https', 'mailto', 'tel')
    ));
}

function gdhe_normalize_public_link($value)
{
    if (!is_array($value)) {
        return null;
    }
    $title = isset($value['title']) && is_scalar($value['title'])
        ? trim(wp_strip_all_tags((string) $value['title']))
        : '';
    $url = isset($value['url']) && is_scalar($value['url'])
        ? trim((string) $value['url'])
        : '';
    $target = isset($value['target']) && is_scalar($value['target'])
        ? (string) $value['target']
        : '';
    $target = $target === '' ? '_self' : $target;
    if ($title === '' || 120 < strlen($title) || 500 < strlen($url)) {
        return null;
    }
    if (!in_array($target, array('_self', '_blank'), true)) {
        return null;
    }
    if (str_starts_with($url, '/')) {
        if (!function_exists('gdhe_validate_public_path') || !gdhe_validate_public_path($url)) {
            return null;
        }
    } else {
        $scheme = strtolower((string) wp_parse_url($url, PHP_URL_SCHEME));
        if (!in_array($scheme, array('http', 'https', 'mailto', 'tel'), true)) {
            return null;
        }
    }
    $link = array();
    $link['title'] = $title;
    $link['url'] = $url;
    $link['target'] = $target;
    return $link;
}

function gdhe_prepare_modules_for_save($value, $post_id = 0, $field = array())
{
    if (is_array($field)
        && isset($field['key'])
        && $field['key'] !== 'field_gdhe_modules') {
        return $value;
    }
    if (!is_array($value)) {
        return $value;
    }

    $seen = array();
    foreach (array_keys($value) as $index) {
        if (!is_array($value[$index])) {
            continue;
        }
        $layout = gdhe_module_layout($value[$index]);
        $module_id = gdhe_module_value($value[$index], 'module_id', $layout);
        if (!gdhe_is_uuid_v4($module_id) || isset($seen[$module_id])) {
            $module_id = wp_generate_uuid4();
        }
        $seen[$module_id] = true;
        $value[$index] = gdhe_module_set_value($value[$index], 'module_id', $module_id, $layout);
        $value[$index] = gdhe_module_set_value($value[$index], 'module_schema_version', GDHE_MODULE_SCHEMA_VERSION, $layout);
        if ($layout === 'data_table') {
            $value[$index] = gdhe_prepare_table_row_ids($value[$index]);
        }
    }
    return $value;
}

function gdhe_prepare_table_row_ids(array $module): array
{
    $rows_key = array_key_exists('rows', $module) ? 'rows' : 'field_gdhe_module_table_rows_v2';
    $rows = isset($module[$rows_key]) && is_array($module[$rows_key]) ? $module[$rows_key] : array();
    $seen = array();
    foreach (array_keys($rows) as $index) {
        if (!is_array($rows[$index])) {
            continue;
        }
        $raw = false;
        foreach (array_keys($rows[$index]) as $existing_key) {
            if (is_string($existing_key) && str_starts_with($existing_key, 'field_')) {
                $raw = true;
                break;
            }
        }
        $id_key = $raw ? 'field_gdhe_module_table_row_id_v2' : 'row_id';
        $row_id = isset($rows[$index][$id_key]) ? $rows[$index][$id_key] : '';
        if (!gdhe_is_uuid_v4($row_id) || isset($seen[$row_id])) {
            $row_id = wp_generate_uuid4();
        }
        $seen[$row_id] = true;
        $rows[$index][$id_key] = $row_id;
    }
    $module[$rows_key] = $rows;
    return $module;
}

function gdhe_table_value(array $value, string $name)
{
    $keys = array();
    $keys['columns'] = 'field_gdhe_module_table_columns_v2';
    $keys['rows'] = 'field_gdhe_module_table_rows_v2';
    $keys['key'] = 'field_gdhe_module_table_column_key_v2';
    $keys['label'] = 'field_gdhe_module_table_column_label_v2';
    $keys['row_id'] = 'field_gdhe_module_table_row_id_v2';
    $keys['cells'] = 'field_gdhe_module_table_cells_v2';
    $keys['column_key'] = 'field_gdhe_module_table_cell_column_key_v2';
    $keys['value'] = 'field_gdhe_module_table_cell_value_v2';

    if (array_key_exists($name, $value)) {
        return $value[$name];
    }
    if (isset($keys[$name]) && array_key_exists($keys[$name], $value)) {
        return $value[$keys[$name]];
    }
    return null;
}

function gdhe_validate_modules_field($valid, $value, $field, $input)
{
    if ($valid !== true) {
        return $valid;
    }
    $result = gdhe_validate_module_collection($value, true);
    return is_wp_error($result)
        ? call_user_func(array($result, 'get_error_message'))
        : true;
}

function gdhe_validate_module_collection($modules, bool $allow_missing_identity = false)
{
    if (!is_array($modules)) {
        return new WP_Error('gdhe_modules_not_array', 'Modules must be an array.');
    }
    if (20 < count($modules)) {
        return new WP_Error('gdhe_modules_too_many', 'A page may contain at most 20 modules.');
    }

    $allowed = array_fill_keys(gdhe_module_types(), true);
    $seen = array();
    foreach ($modules as $module) {
        if (!is_array($module)) {
            return new WP_Error('gdhe_module_not_object', 'Every module must be an object.');
        }
        $layout = gdhe_module_layout($module);
        if ($layout === '' || !isset($allowed[$layout])) {
            return new WP_Error('gdhe_module_type_invalid', 'Unknown module type.');
        }
        $module_id = gdhe_module_value($module, 'module_id', $layout);
        if (!$allow_missing_identity || ($module_id !== null && $module_id !== '')) {
            if (!gdhe_is_uuid_v4($module_id)) {
                return new WP_Error('gdhe_module_id_invalid', 'Module ID must be a UUID v4.');
            }
            if (isset($seen[$module_id])) {
                return new WP_Error('gdhe_module_id_duplicate', 'Module IDs must be unique within a page.');
            }
            $seen[$module_id] = true;
        }
        $version = gdhe_module_value($module, 'module_schema_version', $layout);
        if (!$allow_missing_identity || ($version !== null && $version !== '')) {
            if ($version !== GDHE_MODULE_SCHEMA_VERSION) {
                return new WP_Error('gdhe_module_version_invalid', 'Unsupported module schema version.');
            }
        }
        if ($layout === 'data_table') {
            $table_result = gdhe_validate_structured_table($module, $allow_missing_identity);
            if (is_wp_error($table_result)) {
                return $table_result;
            }
        }
        $contract_result = gdhe_validate_public_module_contract($module, $layout);
        if (is_wp_error($contract_result)) {
            return $contract_result;
        }
    }
    return true;
}

function gdhe_validate_public_module_contract(array $module, string $layout)
{
    $required_strings = array();
    $required_strings['hero'] = array('heading');
    $required_strings['rich_text'] = array('body');
    $required_strings['cta_banner'] = array('heading');
    $required = isset($required_strings[$layout]) ? $required_strings[$layout] : array();
    foreach ($required as $key) {
        $value = isset($module[$key]) && is_scalar($module[$key]) ? trim((string) $module[$key]) : '';
        if ($value === '') {
            return new WP_Error('gdhe_module_field_required', 'A required module field is empty.');
        }
    }
    $limits = array();
    $limits['heading'] = 120;
    $limits['lead'] = 320;
    $limits['body'] = $layout === 'cta_banner' ? 320 : 20000;
    foreach (array_keys($limits) as $key) {
        $maximum = $limits[$key];
        if (isset($module[$key]) && (!is_scalar($module[$key]) || $maximum < strlen((string) $module[$key]))) {
            return new WP_Error('gdhe_module_field_invalid', 'A module field exceeds the public contract boundary.');
        }
    }
    if ($layout === 'hero') {
        foreach (array('primary_cta', 'secondary_cta') as $key) {
            if (isset($module[$key]) && $module[$key] !== '' && gdhe_normalize_public_link($module[$key]) === null) {
                return new WP_Error('gdhe_module_link_invalid', 'A module link does not satisfy the public contract.');
            }
        }
    }
    if ($layout === 'card_grid') {
        $items = isset($module['items']) && is_array($module['items']) ? $module['items'] : array();
        if ($items === array() || 12 < count($items)) {
            return new WP_Error('gdhe_card_grid_items_invalid', 'Card grid requires 1 to 12 items.');
        }
        foreach ($items as $item) {
            $title = is_array($item) && isset($item['title']) && is_scalar($item['title']) ? trim((string) $item['title']) : '';
            $summary = is_array($item) && isset($item['summary']) && is_scalar($item['summary']) ? (string) $item['summary'] : '';
            if ($title === '' || 100 < strlen($title) || 240 < strlen($summary)) {
                return new WP_Error('gdhe_card_grid_item_invalid', 'Card grid item title is required.');
            }
            if (isset($item['link']) && $item['link'] !== '' && gdhe_normalize_public_link($item['link']) === null) {
                return new WP_Error('gdhe_module_link_invalid', 'A module link does not satisfy the public contract.');
            }
        }
    }
    if ($layout === 'split_media') {
        $position = isset($module['media_position']) ? (string) $module['media_position'] : '';
        if (!in_array($position, array('left', 'right'), true) || empty($module['media_reference'])) {
            return new WP_Error('gdhe_split_media_invalid', 'Split media requires media and a frozen position.');
        }
    }
    if ($layout === 'accordion') {
        $items = isset($module['items']) && is_array($module['items']) ? $module['items'] : array();
        if ($items === array() || 20 < count($items)) {
            return new WP_Error('gdhe_accordion_items_invalid', 'Accordion requires 1 to 20 items.');
        }
        foreach ($items as $item) {
            $question = is_array($item) && isset($item['question']) && is_scalar($item['question']) ? trim((string) $item['question']) : '';
            $answer = is_array($item) && isset($item['answer']) && is_scalar($item['answer']) ? trim((string) $item['answer']) : '';
            if ($question === '' || 180 < strlen($question) || $answer === '' || 20000 < strlen($answer)) {
                return new WP_Error('gdhe_accordion_item_invalid', 'Accordion question and answer are required.');
            }
        }
    }
    $primary_cta = isset($module['primary_cta']) ? $module['primary_cta'] : null;
    if ($layout === 'cta_banner' && gdhe_normalize_public_link($primary_cta) === null) {
        return new WP_Error('gdhe_module_link_invalid', 'CTA banner requires a valid primary CTA.');
    }
    return true;
}

function gdhe_validate_structured_table(array $module, bool $allow_missing_identity = false)
{
    $columns = gdhe_table_value($module, 'columns');
    $rows = gdhe_table_value($module, 'rows');
    if (!is_array($columns) || count($columns) < 1 || 12 < count($columns)) {
        return new WP_Error('gdhe_table_columns_invalid', 'A data table requires 1 to 12 columns.');
    }
    if (!is_array($rows) || count($rows) < 1 || 100 < count($rows)) {
        return new WP_Error('gdhe_table_rows_invalid', 'A data table requires 1 to 100 rows.');
    }

    $column_keys = array();
    foreach ($columns as $column) {
        $key = is_array($column) ? (string) gdhe_table_value($column, 'key') : '';
        $label = is_array($column) ? trim((string) gdhe_table_value($column, 'label')) : '';
        if (preg_match('/^[a-z][a-z0-9_]{0,47}$/', $key) !== 1 || isset($column_keys[$key])) {
            return new WP_Error('gdhe_table_column_key_invalid', 'Table column keys must be unique lowercase identifiers.');
        }
        if ($label === '' || 120 < strlen($label)) {
            return new WP_Error('gdhe_table_column_label_invalid', 'Table column labels are required and limited to 120 bytes.');
        }
        $column_keys[$key] = true;
    }

    $seen_rows = array();
    foreach ($rows as $row) {
        if (!is_array($row)) {
            return new WP_Error('gdhe_table_row_invalid', 'Every table row must be an object.');
        }
        $row_id = gdhe_table_value($row, 'row_id');
        if (!$allow_missing_identity || $row_id !== '') {
            if (!gdhe_is_uuid_v4($row_id) || isset($seen_rows[$row_id])) {
                return new WP_Error('gdhe_table_row_id_invalid', 'Table row IDs must be unique UUID v4 values.');
            }
            $seen_rows[$row_id] = true;
        }
        $cells = gdhe_table_value($row, 'cells');
        $cells = is_array($cells) ? $cells : array();
        $seen_cells = array();
        foreach ($cells as $cell) {
            $key = is_array($cell) ? (string) gdhe_table_value($cell, 'column_key') : '';
            $cell_value = is_array($cell) ? gdhe_table_value($cell, 'value') : '';
            if (!isset($column_keys[$key]) || isset($seen_cells[$key])) {
                return new WP_Error('gdhe_table_cell_key_invalid', 'Every table row must contain each declared column exactly once.');
            }
            if (!is_scalar($cell_value) || 500 < strlen((string) $cell_value)) {
                return new WP_Error('gdhe_table_cell_value_invalid', 'Table cell values must be scalar and limited to 500 bytes.');
            }
            $seen_cells[$key] = true;
        }
        if (array_keys($seen_cells) !== array_keys($column_keys)) {
            return new WP_Error('gdhe_table_cells_incomplete', 'Every table row must contain cells in declared column order.');
        }
    }
    return true;
}

function gdhe_parse_legacy_table(string $legacy)
{
    $lines = preg_split('/\r\n|\r|\n/', trim($legacy));
    if (!is_array($lines) || count($lines) < 2) {
        return new WP_Error('gdhe_legacy_table_too_short', 'Legacy table requires one header row and at least one data row.');
    }
    $headers = array_map('trim', explode('|', array_shift($lines)));
    if (count($headers) < 1 || 12 < count($headers)) {
        return new WP_Error('gdhe_legacy_table_column_count', 'Legacy table must contain 1 to 12 columns.');
    }

    $columns = array();
    $keys = array();
    foreach ($headers as $label) {
        $key = sanitize_key(str_replace(array(' ', '-'), '_', strtolower($label)));
        if ($label === '' || $key === '' || isset($keys[$key])) {
            return new WP_Error('gdhe_legacy_table_ambiguous_header', 'Legacy table contains an empty or duplicate normalized header.');
        }
        $keys[$key] = true;
        $column = array();
        $column['key'] = $key;
        $column['label'] = $label;
        $columns[] = $column;
    }

    $rows = array();
    foreach ($lines as $line) {
        $values = array_map('trim', explode('|', $line));
        if (count($values) !== count($columns)) {
            return new WP_Error('gdhe_legacy_table_ambiguous_row', 'Legacy table row width does not match the header.');
        }
        $cells = array();
        foreach (array_keys($columns) as $index) {
            if (500 < strlen($values[$index])) {
                return new WP_Error('gdhe_legacy_table_cell_too_long', 'Legacy table cell exceeds 500 bytes.');
            }
            $cell = array();
            $cell['column_key'] = $columns[$index]['key'];
            $cell['value'] = $values[$index];
            $cells[] = $cell;
        }
        $row = array();
        $row['row_id'] = wp_generate_uuid4();
        $row['cells'] = $cells;
        $rows[] = $row;
    }

    $result = array();
    $result['columns'] = $columns;
    $result['rows'] = $rows;
    return $result;
}

function gdhe_normalize_public_modules($modules): array
{
    $validation = gdhe_validate_module_collection($modules, false);
    if (is_wp_error($validation)) {
        do_action('gdhe_contract_validation_failed', $validation);
        return array();
    }

    $normalized = array();
    foreach ($modules as $module) {
        $layout = gdhe_module_layout($module);
        $data = $module;
        unset($data['acf_fc_layout'], $data['module_id'], $data['module_schema_version']);
        if (array_key_exists('media_reference', $data)) {
            $data['media_reference'] = gdhe_normalize_media_reference($data['media_reference']);
        }
        if ($layout === 'rich_text' || $layout === 'split_media') {
            if (array_key_exists('body', $data)) {
                $data['safeHtml'] = gdhe_sanitize_public_html($data['body']);
                unset($data['body']);
            }
        }
        if ($layout === 'accordion' && isset($data['items']) && is_array($data['items'])) {
            foreach (array_keys($data['items']) as $index) {
                if (is_array($data['items'][$index]) && array_key_exists('answer', $data['items'][$index])) {
                    $data['items'][$index]['safeHtml'] = gdhe_sanitize_public_html($data['items'][$index]['answer']);
                    unset($data['items'][$index]['answer']);
                }
            }
        }
        foreach (array('primary_cta', 'secondary_cta') as $link_key) {
            if (array_key_exists($link_key, $data)) {
                $link = gdhe_normalize_public_link($data[$link_key]);
                if ($link === null) {
                    unset($data[$link_key]);
                } else {
                    $data[$link_key] = $link;
                }
            }
        }
        if ($layout === 'card_grid' && isset($data['items']) && is_array($data['items'])) {
            foreach (array_keys($data['items']) as $index) {
                if (is_array($data['items'][$index]) && array_key_exists('link', $data['items'][$index])) {
                    $link = gdhe_normalize_public_link($data['items'][$index]['link']);
                    if ($link === null) {
                        unset($data['items'][$index]['link']);
                    } else {
                        $data['items'][$index]['link'] = $link;
                    }
                }
            }
        }
        foreach (array_keys($data) as $data_key) {
            if ($data[$data_key] === null) {
                unset($data[$data_key]);
            }
        }
        if ($layout === 'data_table') {
            foreach (array_keys($data['rows']) as $index) {
                $cells = array();
                foreach ($data['rows'][$index]['cells'] as $cell) {
                    $cells[$cell['column_key']] = $cell['value'];
                }
                $data['rows'][$index]['cells'] = $cells;
                $data['rows'][$index]['id'] = $data['rows'][$index]['row_id'];
                unset($data['rows'][$index]['row_id']);
            }
        }
        $item = array();
        $item['id'] = $module['module_id'];
        $item['type'] = $layout;
        $item['schemaVersion'] = $module['module_schema_version'];
        $item['data'] = $data;
        $normalized[] = $item;
    }
    return $normalized;
}

function gdhe_normalize_media_reference($attachment_id)
{
    $attachment_id = (int) $attachment_id;
    if (!gdhe_is_public_attachment_reference($attachment_id)) {
        return null;
    }
    $public_id = gdhe_public_identifier($attachment_id, '_gdhe_public_media_id');
    if ($public_id === '') {
        return null;
    }

    $metadata = wp_get_attachment_metadata($attachment_id);
    $metadata = is_array($metadata) ? $metadata : array();
    $reference = array();
    $reference['id'] = $public_id;
    $reference['url'] = (string) wp_get_attachment_url($attachment_id);
    $reference['mimeType'] = (string) get_post_mime_type($attachment_id);
    $reference['width'] = isset($metadata['width']) ? (int) $metadata['width'] : 1;
    $reference['height'] = isset($metadata['height']) ? (int) $metadata['height'] : 1;
    $reference['alt'] = (string) get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
    $reference['caption'] = (string) wp_get_attachment_caption($attachment_id);
    $reference['decorative'] = false;
    return $reference;
}
