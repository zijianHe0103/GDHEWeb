<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_A2_FIXTURE_REVISION = 'TASK-007-A2-R3';
const GDHE_A2_FIXTURE_OPTION = 'gdhe_a2_fixture_manifest';

function gdhe_a2_fixture_post(string $type, string $status, string $title, string $slug, string $excerpt, string $path, int $menu_order = 0, string $public_id = '')
{
    $post_data = array();
    $post_data['post_type'] = $type;
    $post_data['post_status'] = $status;
    $post_data['post_title'] = $title;
    $post_data['post_name'] = $slug;
    $post_data['post_excerpt'] = $excerpt;
    $post_data['post_date'] = '2026-07-23 14:55:00';
    $post_data['post_date_gmt'] = '2026-07-23 06:55:00';
    $post_data['menu_order'] = $menu_order;
    $post_id = wp_insert_post($post_data, true);
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    if (!gdhe_is_uuid_v4($public_id)) {
        wp_delete_post($post_id, true);
        return new WP_Error('gdhe_a2_public_id_invalid', 'Fixture public identifier must be a UUID v4.');
    }
    update_post_meta($post_id, '_gdhe_a2_marker', GDHE_A2_FIXTURE_REVISION);
    update_post_meta($post_id, '_gdhe_public_path', $path);
    update_post_meta($post_id, '_gdhe_public_id', strtolower($public_id));
    return $post_id;
}

function gdhe_a2_fixture_media(int $parent_id, string $key)
{
    $uploads = wp_upload_dir();
    if (!is_array($uploads) || !empty($uploads['error'])) {
        return new WP_Error('gdhe_a2_upload_error', 'Fixture upload directory is unavailable.');
    }
    $filename = 'task-007-a2-' . sanitize_key($key) . '.png';
    $path = trailingslashit((string) $uploads['path']) . $filename;
    $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZlN8AAAAASUVORK5CYII=', true);
    if (!is_string($png) || file_put_contents($path, $png) === false) {
        return new WP_Error('gdhe_a2_upload_write', 'Synthetic fixture media could not be written.');
    }

    $attachment = array();
    $attachment['post_mime_type'] = 'image/png';
    $attachment['post_title'] = GDHE_A2_FIXTURE_REVISION . ' ' . $key . ' media';
    $attachment['post_status'] = 'inherit';
    $attachment_id = wp_insert_attachment($attachment, $path, $parent_id, true);
    if (is_wp_error($attachment_id)) {
        wp_delete_file($path);
        return $attachment_id;
    }
    $attachment_id = (int) $attachment_id;
    $public_ids = array();
    $public_ids['home'] = '20000000-0000-4000-8000-000000000001';
    $public_ids['service'] = '20000000-0000-4000-8000-000000000002';
    $public_ids['case'] = '20000000-0000-4000-8000-000000000003';
    $public_ids['material'] = '20000000-0000-4000-8000-000000000004';
    if (!isset($public_ids[$key])) {
        wp_delete_attachment($attachment_id, true);
        return new WP_Error('gdhe_a2_media_public_id_missing', 'Fixture media public identifier is missing.');
    }
    $metadata = array();
    $metadata['width'] = 1;
    $metadata['height'] = 1;
    $metadata['file'] = ltrim(str_replace((string) $uploads['basedir'], '', $path), '/');
    wp_update_attachment_metadata($attachment_id, $metadata);
    update_post_meta($attachment_id, '_wp_attachment_image_alt', 'Synthetic TASK-007 fixture pixel');
    update_post_meta($attachment_id, '_gdhe_a2_marker', GDHE_A2_FIXTURE_REVISION);
    update_post_meta($attachment_id, '_gdhe_public_media_id', $public_ids[$key]);
    set_post_thumbnail($parent_id, $attachment_id);
    return $attachment_id;
}

function gdhe_a2_rich_module(string $heading, string $body): array
{
    $module = array();
    $module['acf_fc_layout'] = 'rich_text';
    $module['module_id'] = '00000000-0000-4000-8000-000000000002';
    $module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    $module['heading'] = $heading;
    $module['body'] = $body;
    return $module;
}

function gdhe_a2_table_module(string $caption, string $first_value, string $second_value): array
{
    $column_one = array();
    $column_one['key'] = 'grade';
    $column_one['label'] = 'Grade';
    $column_two = array();
    $column_two['key'] = 'tolerance';
    $column_two['label'] = 'Tolerance';
    $cell_one = array();
    $cell_one['column_key'] = 'grade';
    $cell_one['value'] = $first_value;
    $cell_two = array();
    $cell_two['column_key'] = 'tolerance';
    $cell_two['value'] = $second_value;
    $row = array();
    $row['row_id'] = '00000000-0000-4000-8000-000000000004';
    $row['cells'] = array($cell_one, $cell_two);
    $module = array();
    $module['acf_fc_layout'] = 'data_table';
    $module['module_id'] = '00000000-0000-4000-8000-000000000003';
    $module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    $module['caption'] = $caption;
    $module['columns'] = array($column_one, $column_two);
    $module['rows'] = array($row);
    return $module;
}

function gdhe_a2_hero_module(string $heading, int $media_id, string $path): array
{
    $cta = array();
    $cta['title'] = 'View details';
    $cta['url'] = $path;
    $cta['target'] = '';
    $module = array();
    $module['acf_fc_layout'] = 'hero';
    $module['module_id'] = '00000000-0000-4000-8000-000000000001';
    $module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    $module['heading'] = $heading;
    $module['lead'] = 'Deterministic English TASK-007 fixture content.';
    $module['media_reference'] = $media_id;
    $module['primary_cta'] = $cta;
    return $module;
}

function gdhe_a2_card_grid_module(): array
{
    $internal_link = array();
    $internal_link['title'] = 'View service';
    $internal_link['url'] = '/services/task-007-a2-precision-machining/';
    $internal_link['target'] = '_self';
    $internal = array();
    $internal['title'] = 'Precision machining';
    $internal['summary'] = 'Canonical internal route.';
    $internal['link'] = $internal_link;
    $external_link = array();
    $external_link['title'] = 'Open policy';
    $external_link['url'] = 'https://example.com/policy';
    $external_link['target'] = '_blank';
    $external = array();
    $external['title'] = 'External policy';
    $external['summary'] = 'Allowlisted HTTPS route.';
    $external['link'] = $external_link;
    $module = array();
    $module['acf_fc_layout'] = 'card_grid';
    $module['module_id'] = '00000000-0000-4000-8000-000000000005';
    $module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    $module['heading'] = 'Contract cards';
    $module['items'] = array($internal, $external);
    return $module;
}

function gdhe_a2_split_media_module(int $media_id): array
{
    $module = array();
    $module['acf_fc_layout'] = 'split_media';
    $module['module_id'] = '00000000-0000-4000-8000-000000000006';
    $module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    $module['heading'] = 'Sanitized split media';
    $module['body'] = '<p onclick="alert(1)">Allowed <strong>copy</strong><script>alert(2)</script><a href="javascript:alert(3)">unsafe</a></p><iframe src="https://example.com"></iframe>';
    $module['media_reference'] = $media_id;
    $module['media_position'] = 'right';
    return $module;
}

function gdhe_a2_accordion_module(): array
{
    $item = array();
    $item['question'] = 'Is the answer safe?';
    $item['answer'] = '<p onmouseover="alert(1)">Yes <em>after CMS sanitization</em>.</p><style>body{display:none}</style>';
    $module = array();
    $module['acf_fc_layout'] = 'accordion';
    $module['module_id'] = '00000000-0000-4000-8000-000000000007';
    $module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    $module['heading'] = 'Contract questions';
    $module['items'] = array($item);
    return $module;
}

function gdhe_a2_cta_banner_module(): array
{
    $cta = array();
    $cta['title'] = 'Contact GDHE';
    $cta['url'] = 'mailto:sales@example.com';
    $cta['target'] = '_self';
    $module = array();
    $module['acf_fc_layout'] = 'cta_banner';
    $module['module_id'] = '00000000-0000-4000-8000-000000000008';
    $module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    $module['heading'] = 'Start a controlled request';
    $module['body'] = 'Plain-text CTA supporting copy.';
    $module['primary_cta'] = $cta;
    return $module;
}

function gdhe_a2_update_content_fields(int $post_id, string $template, array $modules, array $relationships): void
{
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, $post_id);
    update_field('field_gdhe_template_key', $template, $post_id);
    update_field('field_gdhe_summary', 'Deterministic English ' . GDHE_A2_FIXTURE_REVISION . ' summary.', $post_id);
    update_field('field_gdhe_modules', $modules, $post_id);
    update_field('field_gdhe_relationships', $relationships, $post_id);
    wp_save_post_revision($post_id);
}

function gdhe_a2_create_term(string $taxonomy, string $name, string $slug)
{
    $args = array();
    $args['slug'] = $slug;
    $term = wp_insert_term($name, $taxonomy, $args);
    if (is_wp_error($term)) {
        return $term;
    }
    return (int) $term['term_id'];
}

function gdhe_a2_store_manifest(array $manifest): void
{
    update_option(GDHE_A2_FIXTURE_OPTION, $manifest, false);
}

function gdhe_a2_fixture_relationships(array $values = array()): array
{
    $relationships = array();
    $relationships['services'] = isset($values['services']) ? $values['services'] : array();
    $relationships['industries'] = array();
    $relationships['materials'] = isset($values['materials']) ? $values['materials'] : array();
    $relationships['surface_finishes'] = array();
    $relationships['case_studies'] = isset($values['case_studies']) ? $values['case_studies'] : array();
    return $relationships;
}

function gdhe_a2_create_fixtures()
{
    $existing = get_option(GDHE_A2_FIXTURE_OPTION, array());
    if (is_array($existing) && !empty($existing['posts'])) {
        return new WP_Error('gdhe_a2_fixture_exists', 'TASK-007 A2 fixtures already exist.');
    }

    $manifest = array();
    $manifest['fixtureVersion'] = GDHE_A2_FIXTURE_REVISION;
    $manifest['createdAt'] = gmdate('c');
    $manifest['posts'] = array();
    $manifest['attachments'] = array();
    $manifest['terms'] = array();
    gdhe_a2_store_manifest($manifest);

    $definitions = array();
    $definitions[] = array('home', 'page', 'publish', 'TASK-007 A2 Home', 'task-007-a2-home', '/', 'Deterministic home fixture.', 0, '10000000-0000-4000-8000-000000000001');
    $definitions[] = array('service', 'service', 'publish', 'TASK-007 A2 Precision Machining', 'task-007-a2-precision-machining', '/services/task-007-a2-precision-machining/', 'Deterministic service fixture.', 10, '10000000-0000-4000-8000-000000000002');
    $definitions[] = array('case', 'case_study', 'publish', 'TASK-007 A2 Aerospace Bracket', 'task-007-a2-aerospace-bracket', '/case-studies/task-007-a2-aerospace-bracket/', 'Deterministic case study fixture.', 20, '10000000-0000-4000-8000-000000000003');
    $definitions[] = array('material', 'material', 'publish', 'TASK-007 A2 Aluminum 6061', 'task-007-a2-aluminum-6061', '/materials/task-007-a2-aluminum-6061/', 'Deterministic material fixture.', 30, '10000000-0000-4000-8000-000000000004');
    $definitions[] = array('service_alpha', 'service', 'publish', 'TASK-007 A2 Shared Service', 'task-007-a2-shared-alpha', '/services/task-007-a2-shared-alpha/', 'Deterministic collection fixture alpha.', 31, '10000000-0000-4000-8000-000000000009');
    $definitions[] = array('service_beta', 'service', 'publish', 'TASK-007 A2 Shared Service', 'task-007-a2-shared-beta', '/services/task-007-a2-shared-beta/', 'Deterministic collection fixture beta.', 32, '10000000-0000-4000-8000-00000000000a');
    $definitions[] = array('draft', 'service', 'draft', 'TASK-007 A2 Draft Service', 'task-007-a2-draft-service', '/services/task-007-a2-draft-service/', 'Unpublished negative fixture.', 40, '10000000-0000-4000-8000-000000000005');
    $definitions[] = array('private', 'service', 'private', 'TASK-007 A2 Private Service', 'task-007-a2-private-service', '/services/task-007-a2-private-service/', 'Private negative fixture.', 50, '10000000-0000-4000-8000-000000000006');
    $definitions[] = array('pending', 'service', 'pending', 'TASK-007 A2 Pending Service', 'task-007-a2-pending-service', '/services/task-007-a2-pending-service/', 'Pending negative fixture.', 60, '10000000-0000-4000-8000-000000000007');
    $definitions[] = array('trash', 'service', 'draft', 'TASK-007 A2 Trashed Service', 'task-007-a2-trashed-service', '/services/task-007-a2-trashed-service/', 'Trash negative fixture.', 70, '10000000-0000-4000-8000-000000000008');

    foreach ($definitions as $definition) {
        $post_id = gdhe_a2_fixture_post(
            (string) $definition[1],
            (string) $definition[2],
            (string) $definition[3],
            (string) $definition[4],
            (string) $definition[6],
            (string) $definition[5],
            (int) $definition[7],
            (string) $definition[8]
        );
        if (is_wp_error($post_id)) {
            gdhe_a2_cleanup_fixtures($manifest);
            return $post_id;
        }
        $manifest['posts'][(string) $definition[0]] = (int) $post_id;
        gdhe_a2_store_manifest($manifest);
    }

    $trash_id = (int) $manifest['posts']['trash'];
    if (!wp_trash_post($trash_id)) {
        gdhe_a2_cleanup_fixtures($manifest);
        return new WP_Error('gdhe_a2_trash_failed', 'Trash negative fixture could not be moved to Trash.');
    }

    $term_definitions = array();
    $term_definitions[] = array('serviceFamily', 'service_family', 'TASK-007 A2 CNC', 'task-007-a2-cnc');
    $term_definitions[] = array('materialFamily', 'material_family', 'TASK-007 A2 Aluminum', 'task-007-a2-aluminum');
    $term_definitions[] = array('process', 'manufacturing_process', 'TASK-007 A2 Milling', 'task-007-a2-milling');
    foreach ($term_definitions as $definition) {
        $term_id = gdhe_a2_create_term((string) $definition[1], (string) $definition[2], (string) $definition[3]);
        if (is_wp_error($term_id)) {
            gdhe_a2_cleanup_fixtures($manifest);
            return $term_id;
        }
        $manifest['terms'][(string) $definition[0]] = (int) $term_id;
        gdhe_a2_store_manifest($manifest);
    }

    wp_set_object_terms((int) $manifest['posts']['service'], array((int) $manifest['terms']['serviceFamily']), 'service_family');
    wp_set_object_terms((int) $manifest['posts']['service_alpha'], array((int) $manifest['terms']['serviceFamily']), 'service_family');
    wp_set_object_terms((int) $manifest['posts']['service_beta'], array((int) $manifest['terms']['serviceFamily']), 'service_family');
    wp_set_object_terms((int) $manifest['posts']['service'], array((int) $manifest['terms']['process']), 'manufacturing_process');
    wp_set_object_terms((int) $manifest['posts']['material'], array((int) $manifest['terms']['materialFamily']), 'material_family');
    wp_set_object_terms((int) $manifest['posts']['material'], array((int) $manifest['terms']['process']), 'manufacturing_process');
    wp_set_object_terms((int) $manifest['posts']['case'], array((int) $manifest['terms']['process']), 'manufacturing_process');

    foreach (array('home', 'service', 'case', 'material') as $key) {
        $media_id = gdhe_a2_fixture_media((int) $manifest['posts'][$key], $key);
        if (is_wp_error($media_id)) {
            gdhe_a2_cleanup_fixtures($manifest);
            return $media_id;
        }
        $manifest['attachments'][$key] = (int) $media_id;
        gdhe_a2_store_manifest($manifest);
    }

    $home_modules = array();
    $home_modules[] = gdhe_a2_hero_module('Manufacturing capability in one contract', (int) $manifest['attachments']['home'], '/services/task-007-a2-precision-machining/');
    $home_modules[] = gdhe_a2_rich_module('Controlled content', '<p onclick="alert(1)">One <strong>stable</strong> English API boundary.<script>alert(2)</script><a href="javascript:alert(3)">unsafe link</a></p><img src="x" onerror="alert(4)">');
    $home_modules[] = gdhe_a2_table_module('Fixture table', '6061-T6', '0.01 mm');
    $home_modules[] = gdhe_a2_card_grid_module();
    $home_modules[] = gdhe_a2_split_media_module((int) $manifest['attachments']['home']);
    $home_modules[] = gdhe_a2_accordion_module();
    $home_modules[] = gdhe_a2_cta_banner_module();
    $home_relations = array();
    $home_relations['services'] = array((int) $manifest['posts']['service']);
    $home_relations['materials'] = array((int) $manifest['posts']['material']);
    gdhe_a2_update_content_fields((int) $manifest['posts']['home'], 'standard', $home_modules, gdhe_a2_fixture_relationships($home_relations));

    $service_modules = array();
    $service_modules[] = gdhe_a2_hero_module('Precision machining service', (int) $manifest['attachments']['service'], '/case-studies/task-007-a2-aerospace-bracket/');
    $service_modules[] = gdhe_a2_rich_module('Service evidence', '<p>Deterministic machining scope.</p>');
    $service_relations = array();
    $service_relations['materials'] = array((int) $manifest['posts']['material']);
    $service_relations['case_studies'] = array((int) $manifest['posts']['case']);
    gdhe_a2_update_content_fields((int) $manifest['posts']['service'], 'service', $service_modules, gdhe_a2_fixture_relationships($service_relations));

    $case_modules = array();
    $case_modules[] = gdhe_a2_hero_module('Aerospace bracket case study', (int) $manifest['attachments']['case'], '/services/task-007-a2-precision-machining/');
    $case_modules[] = gdhe_a2_rich_module('Case outcome', '<p>Fixture outcome with controlled references.</p>');
    $case_relations = array();
    $case_relations['services'] = array((int) $manifest['posts']['service']);
    $case_relations['materials'] = array((int) $manifest['posts']['material']);
    gdhe_a2_update_content_fields((int) $manifest['posts']['case'], 'case_study', $case_modules, gdhe_a2_fixture_relationships($case_relations));

    $material_modules = array();
    $material_modules[] = gdhe_a2_hero_module('Aluminum 6061 material', (int) $manifest['attachments']['material'], '/services/task-007-a2-precision-machining/');
    $material_modules[] = gdhe_a2_table_module('Material data', '6061-T6', '0.01 mm');
    $material_relations = array();
    $material_relations['services'] = array((int) $manifest['posts']['service']);
    gdhe_a2_update_content_fields((int) $manifest['posts']['material'], 'material', $material_modules, gdhe_a2_fixture_relationships($material_relations));

    foreach (array('service_alpha', 'service_beta') as $key) {
        $modules = array();
        $modules[] = gdhe_a2_rich_module('Collection evidence', '<p>Deterministic collection item.</p>');
        gdhe_a2_update_content_fields((int) $manifest['posts'][$key], 'service', $modules, gdhe_a2_fixture_relationships());
    }

    foreach (array('home', 'service', 'case', 'material') as $key) {
        update_post_meta((int) $manifest['posts'][$key], '_gdhe_navigation_item', '1');
    }

    gdhe_a2_store_manifest($manifest);
    return $manifest;
}

function gdhe_a2_cleanup_fixtures(?array $known_manifest = null): array
{
    $manifest = is_array($known_manifest) ? $known_manifest : get_option(GDHE_A2_FIXTURE_OPTION, array());
    $deleted = array();
    $deleted['posts'] = 0;
    $deleted['attachments'] = 0;
    $deleted['terms'] = 0;
    $deleted['uploads'] = 0;

    $attachment_ids = isset($manifest['attachments']) && is_array($manifest['attachments']) ? array_values($manifest['attachments']) : array();
    foreach ($attachment_ids as $attachment_id) {
        if (get_post((int) $attachment_id) && wp_delete_attachment((int) $attachment_id, true)) {
            $deleted['attachments']++;
        }
    }

    $post_ids = isset($manifest['posts']) && is_array($manifest['posts']) ? array_values($manifest['posts']) : array();
    foreach ($post_ids as $post_id) {
        if (get_post((int) $post_id) && wp_delete_post((int) $post_id, true)) {
            $deleted['posts']++;
        }
    }

    $query_args = array();
    $query_args['post_type'] = array_merge(gdhe_public_post_types(), array('attachment'));
    $query_args['post_status'] = 'any';
    $query_args['posts_per_page'] = -1;
    $meta_condition = array();
    $meta_condition['key'] = '_gdhe_a2_marker';
    $meta_condition['value'] = GDHE_A2_FIXTURE_REVISION;
    $query_args['meta_query'] = array($meta_condition);
    $query = new WP_Query($query_args);
    $marker_posts = gdhe_object_value($query, 'posts', array());
    if (is_array($marker_posts)) {
        foreach ($marker_posts as $marker_post) {
            $marker_id = (int) gdhe_object_value($marker_post, 'ID', 0);
            $marker_type = (string) gdhe_object_value($marker_post, 'post_type', '');
            if ($marker_type === 'attachment') {
                if (wp_delete_attachment($marker_id, true)) {
                    $deleted['attachments']++;
                }
            } elseif (wp_delete_post($marker_id, true)) {
                $deleted['posts']++;
            }
        }
    }

    $term_taxonomies = array();
    $term_taxonomies['serviceFamily'] = 'service_family';
    $term_taxonomies['materialFamily'] = 'material_family';
    $term_taxonomies['process'] = 'manufacturing_process';
    $term_ids = isset($manifest['terms']) && is_array($manifest['terms']) ? $manifest['terms'] : array();
    foreach (array_keys($term_taxonomies) as $term_key) {
        if (isset($term_ids[$term_key]) && term_exists((int) $term_ids[$term_key], $term_taxonomies[$term_key])) {
            $result = wp_delete_term((int) $term_ids[$term_key], $term_taxonomies[$term_key]);
            if ($result && !is_wp_error($result)) {
                $deleted['terms']++;
            }
        }
    }

    $uploads = wp_upload_dir();
    if (is_array($uploads) && empty($uploads['error'])) {
        $pattern = trailingslashit((string) $uploads['basedir']) . '*/*/task-007-a2-*';
        $files = glob($pattern);
        if (is_array($files)) {
            foreach ($files as $file) {
                if (is_file($file) && wp_delete_file($file)) {
                    $deleted['uploads']++;
                }
            }
        }
    }

    delete_option(GDHE_A2_FIXTURE_OPTION);
    return $deleted;
}

function gdhe_a2_cli_error_message($result): string
{
    return (string) call_user_func(array($result, 'get_error_message'));
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gdhe a2-fixtures create', function (): void {
        $result = gdhe_a2_create_fixtures();
        if (is_wp_error($result)) {
            WP_CLI::error(gdhe_a2_cli_error_message($result));
        }
        WP_CLI::line(wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe a2-fixtures show', function (): void {
        WP_CLI::line(wp_json_encode(get_option(GDHE_A2_FIXTURE_OPTION, array()), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe a2-fixtures cleanup', function (): void {
        WP_CLI::line(wp_json_encode(gdhe_a2_cleanup_fixtures(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
}
