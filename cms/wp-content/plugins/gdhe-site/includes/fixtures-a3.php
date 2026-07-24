<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

const GDHE_A3_FIXTURE_VERSION = 'TASK-007-A3-REVIEW-R1';
const GDHE_A3_FIXTURE_OPTION = 'gdhe_a3_fixture_manifest';
const GDHE_A3_FIXTURE_MARKER = '_gdhe_a3_fixture_marker';

function gdhe_a3_fixture_post(array $definition)
{
    $post = array();
    $post['post_type'] = $definition['type'];
    $post['post_status'] = $definition['status'];
    $post['post_title'] = $definition['title'];
    $post['post_name'] = $definition['slug'];
    $post['post_excerpt'] = $definition['excerpt'];
    $post['post_date'] = '2026-07-24 09:30:00';
    $post['post_date_gmt'] = '2026-07-24 01:30:00';
    $post['post_modified'] = '2026-07-24 09:30:00';
    $post['post_modified_gmt'] = '2026-07-24 01:30:00';
    $post['menu_order'] = $definition['order'];
    $post_id = wp_insert_post($post, true);
    if (is_wp_error($post_id)) {
        return $post_id;
    }
    $post_id = (int) $post_id;
    update_post_meta($post_id, GDHE_A3_FIXTURE_MARKER, GDHE_A3_FIXTURE_VERSION);
    update_post_meta($post_id, '_gdhe_public_id', $definition['id']);
    update_post_meta($post_id, '_gdhe_public_path', $definition['path']);
    return $post_id;
}

function gdhe_a3_fixture_module(string $id, string $heading): array
{
    $module = array();
    $module['acf_fc_layout'] = 'rich_text';
    $module['module_id'] = $id;
    $module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    $module['heading'] = $heading;
    $module['body'] = '<p>Structured synthetic GDHE-domain fixture content.</p>';
    return $module;
}

function gdhe_a3_fixture_relations(array $values = array()): array
{
    $relations = array();
    foreach (array('products', 'markets', 'references', 'support_articles', 'downloads') as $key) {
        $relations[$key] = $values[$key] ?? array();
    }
    return $relations;
}

function gdhe_a3_fixture_definition(
    string $type,
    string $status,
    string $title,
    string $slug,
    string $path,
    string $excerpt,
    int $order,
    string $id
): array {
    $definition = array();
    $definition['type'] = $type;
    $definition['status'] = $status;
    $definition['title'] = $title;
    $definition['slug'] = $slug;
    $definition['path'] = $path;
    $definition['excerpt'] = $excerpt;
    $definition['order'] = $order;
    $definition['id'] = $id;
    return $definition;
}

function gdhe_a3_fixture_definitions(): array
{
    $definitions = array();
    $definitions['home'] = gdhe_a3_fixture_definition(
        'page', 'publish', 'TASK-007 A3 Home', 'task-007-a3-home', '/',
        'Synthetic product portfolio home.', 0, '31000000-0000-4000-8000-000000000001'
    );
    $definitions['company'] = gdhe_a3_fixture_definition(
        'page', 'publish', 'TASK-007 A3 Company', 'task-007-a3-company', '/company/',
        'Synthetic non-root company page.', 5, '31000000-0000-4000-8000-000000000011'
    );
    $definitions['news'] = gdhe_a3_fixture_definition(
        'post', 'publish', 'TASK-007 A3 Product Update', 'task-007-a3-product-update',
        '/news/task-007-a3-product-update/', 'Synthetic native news post.',
        6, '31000000-0000-4000-8000-000000000012'
    );
    $definitions['product_alpha'] = gdhe_a3_fixture_definition(
        'product', 'publish', 'GDHE Flow Control Alpha', 'task-007-a3-flow-control-alpha',
        '/products/task-007-a3-flow-control-alpha/', 'Synthetic flow-control product alpha.',
        10, '31000000-0000-4000-8000-000000000002'
    );
    $definitions['product_beta'] = gdhe_a3_fixture_definition(
        'product', 'publish', 'GDHE Flow Control Beta', 'task-007-a3-flow-control-beta',
        '/products/task-007-a3-flow-control-beta/', 'Synthetic flow-control product beta.',
        20, '31000000-0000-4000-8000-000000000003'
    );
    $definitions['product_gamma'] = gdhe_a3_fixture_definition(
        'product', 'publish', 'GDHE Flow Control Gamma', 'task-007-a3-flow-control-gamma',
        '/products/task-007-a3-flow-control-gamma/', 'Synthetic flow-control product gamma.',
        30, '31000000-0000-4000-8000-000000000004'
    );
    $definitions['market'] = gdhe_a3_fixture_definition(
        'market', 'publish', 'Controlled Water Systems', 'task-007-a3-controlled-water-systems',
        '/markets/task-007-a3-controlled-water-systems/', 'Synthetic market fixture.',
        40, '31000000-0000-4000-8000-000000000005'
    );
    $definitions['reference'] = gdhe_a3_fixture_definition(
        'reference', 'publish', 'Coastal Research Facility', 'task-007-a3-coastal-research-facility',
        '/references/task-007-a3-coastal-research-facility/', 'Synthetic reference fixture.',
        50, '31000000-0000-4000-8000-000000000006'
    );
    $definitions['support'] = gdhe_a3_fixture_definition(
        'support_article', 'publish', 'Configure Flow Control', 'task-007-a3-configure-flow-control',
        '/support/configuration/task-007-a3-configure-flow-control/', 'Synthetic support fixture.',
        60, '31000000-0000-4000-8000-000000000007'
    );
    $definitions['download'] = gdhe_a3_fixture_definition(
        'download', 'publish', 'Flow Control Data Sheet', 'task-007-a3-flow-control-data-sheet',
        '/downloads/task-007-a3-flow-control-data-sheet/', 'Synthetic download fixture.',
        70, '31000000-0000-4000-8000-000000000008'
    );
    $definitions['draft'] = gdhe_a3_fixture_definition(
        'product', 'draft', 'TASK-007 A3 Draft Product', 'task-007-a3-draft-product',
        '/products/task-007-a3-draft-product/', 'Unpublished negative.',
        80, '31000000-0000-4000-8000-000000000009'
    );
    $definitions['private'] = gdhe_a3_fixture_definition(
        'product', 'private', 'TASK-007 A3 Private Product', 'task-007-a3-private-product',
        '/products/task-007-a3-private-product/', 'Private negative.',
        90, '31000000-0000-4000-8000-00000000000a'
    );
    $definitions['pending'] = gdhe_a3_fixture_definition(
        'product', 'pending', 'TASK-007 A3 Pending Product', 'task-007-a3-pending-product',
        '/products/task-007-a3-pending-product/', 'Pending negative.',
        100, '31000000-0000-4000-8000-00000000000b'
    );
    $definitions['trash'] = gdhe_a3_fixture_definition(
        'product', 'draft', 'TASK-007 A3 Trashed Product', 'task-007-a3-trashed-product',
        '/products/task-007-a3-trashed-product/', 'Trash negative.',
        110, '31000000-0000-4000-8000-00000000000c'
    );
    $definitions['invalid_template'] = gdhe_a3_fixture_definition(
        'product', 'publish', 'TASK-007 A3 Invalid Template', 'task-007-a3-invalid-template',
        '/products/task-007-a3-invalid-template/', 'Contract-invalid negative.',
        120, '31000000-0000-4000-8000-00000000000d'
    );
    $definitions['mismatched_template'] = gdhe_a3_fixture_definition(
        'product', 'publish', 'TASK-007 A3 Mismatched Template', 'task-007-a3-mismatched-template',
        '/products/task-007-a3-mismatched-template/', 'Known-template mismatch negative.',
        125, '31000000-0000-4000-8000-000000000010'
    );
    $definitions['invalid_module'] = gdhe_a3_fixture_definition(
        'product', 'publish', 'TASK-007 A3 Invalid Module', 'task-007-a3-invalid-module',
        '/products/task-007-a3-invalid-module/', 'Contract-invalid negative.',
        130, '31000000-0000-4000-8000-00000000000e'
    );
    $definitions['invalid_path'] = gdhe_a3_fixture_definition(
        'product', 'publish', 'TASK-007 A3 Invalid Path', 'task-007-a3-invalid-path',
        '/Products/invalid', 'Contract-invalid negative.',
        140, '31000000-0000-4000-8000-00000000000f'
    );
    return $definitions;
}

function gdhe_a3_product_details(string $suffix): array
{
    $feature = array();
    $feature['value'] = 'Stable synthetic flow control for ' . $suffix;
    $specification = array();
    $specification['key'] = 'nominal_flow';
    $specification['label'] = 'Nominal flow';
    $specification['value'] = '12';
    $specification['unit'] = 'L/min';
    $article_number = array();
    $article_number['number'] = 'GDHE-A3-' . strtoupper($suffix);
    $article_number['region'] = 'Global';
    $finish = array();
    $finish['code'] = 'SF-01';
    $finish['label'] = 'Synthetic silver';
    $finish['color'] = 'silver';
    $compatibility = array();
    $compatibility['value'] = 'GDHE synthetic control interface';
    $cta = array();
    $cta['title'] = 'Request product information';
    $cta['url'] = '/contact/';
    $cta['target'] = '_self';
    $details = array();
    $details['model'] = 'Flow Control ' . ucfirst($suffix);
    $details['product_code'] = 'FC-' . strtoupper($suffix);
    $details['positioning'] = 'Synthetic GDHE-domain product used only for contract validation.';
    $details['features'] = array($feature);
    $details['specifications'] = array($specification);
    $details['article_numbers'] = array($article_number);
    $details['finishes'] = array($finish);
    $details['installation'] = 'Install on a synthetic controlled-water test assembly.';
    $details['control'] = 'Manual synthetic control.';
    $details['compatibility'] = array($compatibility);
    $details['gallery'] = array();
    $details['video_url'] = 'https://media.gdhe.example/fixtures/product-' . rawurlencode($suffix) . '.mp4';
    $details['inquiry_cta'] = $cta;
    return $details;
}

function gdhe_a3_market_details(): array
{
    $benefit = array();
    $benefit['value'] = 'Repeatable controlled-water operation.';
    $requirement = array();
    $requirement['value'] = 'Use the documented synthetic interface.';
    $details = array();
    $details['benefits'] = array($benefit);
    $details['requirements'] = array($requirement);
    $details['cta'] = null;
    return $details;
}

function gdhe_a3_reference_details(): array
{
    $result = array();
    $result['value'] = 'Repeatable synthetic validation result.';
    $details = array();
    $details['location'] = 'Synthetic coastal test location';
    $details['challenge'] = 'Validate structured product relations without real business content.';
    $details['solution'] = '<p onclick="alert(1)">Use a <strong>controlled</strong> synthetic fixture.<script>alert(2)</script></p>';
    $details['results'] = array($result);
    $details['gallery'] = array();
    $details['cta'] = null;
    return $details;
}

function gdhe_a3_support_details(): array
{
    $details = array();
    $details['problem_or_goal'] = 'Configure the synthetic flow-control fixture.';
    $details['instructions'] = '<ol><li>Confirm the synthetic interface.</li><li>Apply the test setting.</li></ol>';
    $details['video_url'] = 'https://media.gdhe.example/fixtures/support-configuration.mp4';
    return $details;
}

function gdhe_a3_download_details(int $attachment_id): array
{
    $details = array();
    $details['version'] = '1.0.0';
    $details['date'] = '2026-07-24';
    $details['locale'] = 'en';
    $details['file'] = $attachment_id;
    $details['description'] = 'Synthetic product data sheet for contract validation.';
    return $details;
}

function gdhe_a3_update_common_fields(int $post_id, string $template, array $relations, array $modules): void
{
    update_field('field_gdhe_schema_version', GDHE_SCHEMA_VERSION, $post_id);
    update_field('field_gdhe_template_key', $template, $post_id);
    update_field('field_gdhe_summary', 'Synthetic ' . GDHE_A3_FIXTURE_VERSION . ' summary.', $post_id);
    update_field('field_gdhe_relationships', $relations, $post_id);
    update_field('field_gdhe_modules', $modules, $post_id);
}

function gdhe_a3_fixture_file(int $parent_id)
{
    $uploads = wp_upload_dir();
    if (!is_array($uploads) || !empty($uploads['error'])) {
        return new WP_Error('gdhe_a3_upload_unavailable', 'A3 fixture upload directory is unavailable.');
    }
    $path = trailingslashit((string) $uploads['path']) . 'task-007-a3-flow-control-data-sheet.pdf';
    $payload = "%PDF-1.4\n% Synthetic GDHE TASK-007 A3 fixture only.\n%%EOF\n";
    if (file_put_contents($path, $payload) === false) {
        return new WP_Error('gdhe_a3_upload_failed', 'A3 fixture file could not be written.');
    }
    $attachment = array();
    $attachment['post_mime_type'] = 'application/pdf';
    $attachment['post_title'] = 'TASK-007 A3 Synthetic Data Sheet';
    $attachment['post_status'] = 'inherit';
    $attachment_id = wp_insert_attachment($attachment, $path, $parent_id, true);
    if (is_wp_error($attachment_id)) {
        wp_delete_file($path);
        return $attachment_id;
    }
    $attachment_id = (int) $attachment_id;
    update_post_meta($attachment_id, GDHE_A3_FIXTURE_MARKER, GDHE_A3_FIXTURE_VERSION);
    update_post_meta($attachment_id, '_gdhe_public_media_id', '32000000-0000-4000-8000-000000000001');
    return $attachment_id;
}

function gdhe_a3_fixture_term(string $taxonomy, string $name, string $slug)
{
    $args = array();
    $args['slug'] = $slug;
    $term = wp_insert_term($name, $taxonomy, $args);
    return is_wp_error($term) ? $term : (int) $term['term_id'];
}

function gdhe_a3_create_fixtures()
{
    $existing = get_option(GDHE_A3_FIXTURE_OPTION, array());
    if (is_array($existing) && !empty($existing['posts'])) {
        return new WP_Error('gdhe_a3_fixture_exists', 'TASK-007 A3 fixtures already exist.');
    }
    $manifest = array();
    $manifest['fixtureVersion'] = GDHE_A3_FIXTURE_VERSION;
    $manifest['posts'] = array();
    $manifest['attachments'] = array();
    $manifest['terms'] = array();
    update_option(GDHE_A3_FIXTURE_OPTION, $manifest, false);

    $definitions = gdhe_a3_fixture_definitions();
    foreach (array_keys($definitions) as $key) {
        $post_id = gdhe_a3_fixture_post($definitions[$key]);
        if (is_wp_error($post_id)) {
            gdhe_a3_cleanup_fixtures($manifest);
            return $post_id;
        }
        $manifest['posts'][$key] = (int) $post_id;
        update_option(GDHE_A3_FIXTURE_OPTION, $manifest, false);
    }
    if (!wp_trash_post((int) $manifest['posts']['trash'])) {
        gdhe_a3_cleanup_fixtures($manifest);
        return new WP_Error('gdhe_a3_trash_failed', 'A3 trash fixture could not be created.');
    }
    $term_definitions = array();
    $term_definitions['category'] = array('product_category', 'Flow Control', 'flow-control');
    $term_definitions['series'] = array('product_series', 'Synthetic Series', 'synthetic-series');
    $term_definitions['installation'] = array('installation_type', 'Deck Mounted', 'deck-mounted');
    $term_definitions['support'] = array('support_topic', 'Configuration', 'configuration');
    $term_definitions['document'] = array('document_type', 'Data Sheet', 'data-sheet');
    foreach (array_keys($term_definitions) as $key) {
        $definition = $term_definitions[$key];
        $term_id = gdhe_a3_fixture_term($definition[0], $definition[1], $definition[2]);
        if (is_wp_error($term_id)) {
            gdhe_a3_cleanup_fixtures($manifest);
            return $term_id;
        }
        $manifest['terms'][$key] = (int) $term_id;
        update_option(GDHE_A3_FIXTURE_OPTION, $manifest, false);
    }
    $product_keys = array(
        'product_alpha',
        'product_beta',
        'product_gamma',
        'invalid_template',
        'mismatched_template',
        'invalid_module',
        'invalid_path',
    );
    foreach ($product_keys as $key) {
        $product_id = (int) $manifest['posts'][$key];
        wp_set_object_terms($product_id, array((int) $manifest['terms']['category']), 'product_category');
        wp_set_object_terms($product_id, array((int) $manifest['terms']['series']), 'product_series');
        wp_set_object_terms($product_id, array((int) $manifest['terms']['installation']), 'installation_type');
    }
    wp_set_object_terms(
        (int) $manifest['posts']['support'],
        array((int) $manifest['terms']['support']),
        'support_topic'
    );
    wp_set_object_terms(
        (int) $manifest['posts']['download'],
        array((int) $manifest['terms']['document']),
        'document_type'
    );

    $attachment_id = gdhe_a3_fixture_file((int) $manifest['posts']['download']);
    if (is_wp_error($attachment_id)) {
        gdhe_a3_cleanup_fixtures($manifest);
        return $attachment_id;
    }
    $manifest['attachments']['download'] = (int) $attachment_id;
    update_option(GDHE_A3_FIXTURE_OPTION, $manifest, false);

    $products = array(
        (int) $manifest['posts']['product_alpha'],
        (int) $manifest['posts']['product_beta'],
        (int) $manifest['posts']['product_gamma'],
    );
    $home_relations = array();
    $home_relations['products'] = $products;
    $home_relations['markets'] = array((int) $manifest['posts']['market']);
    $home_relations['references'] = array((int) $manifest['posts']['reference']);
    $home_relations['support_articles'] = array((int) $manifest['posts']['support']);
    $home_relations['downloads'] = array((int) $manifest['posts']['download']);
    $home_module = gdhe_a3_fixture_module('33000000-0000-4000-8000-000000000001', 'Synthetic product portfolio');
    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['home'],
        'standard',
        gdhe_a3_fixture_relations($home_relations),
        array($home_module)
    );
    update_post_meta((int) $manifest['posts']['home'], '_gdhe_navigation_item', '1');

    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['company'],
        'standard',
        gdhe_a3_fixture_relations(),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-00000000000e', 'Synthetic company'))
    );
    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['news'],
        'standard',
        gdhe_a3_fixture_relations(),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-00000000000f', 'Synthetic product update'))
    );

    $product_suffixes = array();
    $product_suffixes['product_alpha'] = 'alpha';
    $product_suffixes['product_beta'] = 'beta';
    $product_suffixes['product_gamma'] = 'gamma';
    $module_index = 2;
    foreach (array_keys($product_suffixes) as $key) {
        $relations = array();
        $relations['markets'] = array((int) $manifest['posts']['market']);
        $relations['references'] = array((int) $manifest['posts']['reference']);
        $relations['support_articles'] = array((int) $manifest['posts']['support']);
        $relations['downloads'] = array((int) $manifest['posts']['download']);
        $module_id = sprintf('33000000-0000-4000-8000-%012d', $module_index);
        gdhe_a3_update_common_fields(
            (int) $manifest['posts'][$key],
            'product',
            gdhe_a3_fixture_relations($relations),
            array(gdhe_a3_fixture_module($module_id, 'Synthetic product details'))
        );
        update_field(
            'field_gdhe_product_details',
            gdhe_a3_product_details($product_suffixes[$key]),
            (int) $manifest['posts'][$key]
        );
        update_post_meta((int) $manifest['posts'][$key], '_gdhe_navigation_item', '1');
        $module_index++;
    }
    $market_relations = array();
    $market_relations['products'] = $products;
    $market_relations['references'] = array((int) $manifest['posts']['reference']);
    $market_relations['downloads'] = array((int) $manifest['posts']['download']);
    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['market'],
        'market',
        gdhe_a3_fixture_relations($market_relations),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-000000000005', 'Synthetic market'))
    );
    update_field('field_gdhe_market_details', gdhe_a3_market_details(), (int) $manifest['posts']['market']);

    $reference_relations = array();
    $reference_relations['products'] = $products;
    $reference_relations['markets'] = array((int) $manifest['posts']['market']);
    $reference_relations['downloads'] = array((int) $manifest['posts']['download']);
    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['reference'],
        'reference',
        gdhe_a3_fixture_relations($reference_relations),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-000000000006', 'Synthetic reference'))
    );
    update_field(
        'field_gdhe_reference_details',
        gdhe_a3_reference_details(),
        (int) $manifest['posts']['reference']
    );

    $support_relations = array();
    $support_relations['products'] = $products;
    $support_relations['downloads'] = array((int) $manifest['posts']['download']);
    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['support'],
        'support_article',
        gdhe_a3_fixture_relations($support_relations),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-000000000007', 'Synthetic support'))
    );
    update_field('field_gdhe_support_details', gdhe_a3_support_details(), (int) $manifest['posts']['support']);

    $download_relations = array();
    $download_relations['products'] = $products;
    $download_relations['markets'] = array((int) $manifest['posts']['market']);
    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['download'],
        'download',
        gdhe_a3_fixture_relations($download_relations),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-000000000008', 'Synthetic download'))
    );
    update_field(
        'field_gdhe_download_details',
        gdhe_a3_download_details((int) $attachment_id),
        (int) $manifest['posts']['download']
    );

    foreach (array('draft', 'private', 'pending', 'trash') as $key) {
        gdhe_a3_update_common_fields(
            (int) $manifest['posts'][$key],
            'product',
            gdhe_a3_fixture_relations(),
            array(gdhe_a3_fixture_module('33000000-0000-4000-8000-000000000009', 'Unpublished product'))
        );
        update_field(
            'field_gdhe_product_details',
            gdhe_a3_product_details('unpublished'),
            (int) $manifest['posts'][$key]
        );
    }

    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['invalid_template'],
        'unknown_template',
        gdhe_a3_fixture_relations(),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-00000000000a', 'Invalid template'))
    );
    update_field(
        'field_gdhe_product_details',
        gdhe_a3_product_details('invalid-template'),
        (int) $manifest['posts']['invalid_template']
    );

    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['mismatched_template'],
        'market',
        gdhe_a3_fixture_relations(),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-00000000000d', 'Mismatched template'))
    );
    update_field(
        'field_gdhe_product_details',
        gdhe_a3_product_details('mismatched-template'),
        (int) $manifest['posts']['mismatched_template']
    );
    update_post_meta((int) $manifest['posts']['mismatched_template'], '_gdhe_navigation_item', '1');

    $invalid_module = array();
    $invalid_module['acf_fc_layout'] = 'unknown_layout';
    $invalid_module['module_id'] = '33000000-0000-4000-8000-00000000000b';
    $invalid_module['module_schema_version'] = GDHE_MODULE_SCHEMA_VERSION;
    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['invalid_module'],
        'product',
        gdhe_a3_fixture_relations(),
        array($invalid_module)
    );
    update_field(
        'field_gdhe_product_details',
        gdhe_a3_product_details('invalid-module'),
        (int) $manifest['posts']['invalid_module']
    );

    gdhe_a3_update_common_fields(
        (int) $manifest['posts']['invalid_path'],
        'product',
        gdhe_a3_fixture_relations(),
        array(gdhe_a3_fixture_module('33000000-0000-4000-8000-00000000000c', 'Invalid path'))
    );
    update_field(
        'field_gdhe_product_details',
        gdhe_a3_product_details('invalid-path'),
        (int) $manifest['posts']['invalid_path']
    );
    update_option(GDHE_A3_FIXTURE_OPTION, $manifest, false);
    return $manifest;
}

function gdhe_a3_cleanup_fixtures(?array $known_manifest = null): array
{
    $manifest = is_array($known_manifest)
        ? $known_manifest
        : get_option(GDHE_A3_FIXTURE_OPTION, array());
    $deleted = array();
    $deleted['posts'] = 0;
    $deleted['attachments'] = 0;
    $deleted['terms'] = 0;
    $deleted['uploads'] = 0;
    foreach (array_values($manifest['attachments'] ?? array()) as $attachment_id) {
        if (get_post((int) $attachment_id) && wp_delete_attachment((int) $attachment_id, true)) {
            $deleted['attachments']++;
        }
    }
    foreach (array_values($manifest['posts'] ?? array()) as $post_id) {
        if (get_post((int) $post_id) && wp_delete_post((int) $post_id, true)) {
            $deleted['posts']++;
        }
    }

    $query_args = array();
    $query_args['post_type'] = array_merge(gdhe_public_post_types(), array('attachment'));
    $query_args['post_status'] = 'any';
    $query_args['posts_per_page'] = -1;
    $condition = array();
    $condition['key'] = GDHE_A3_FIXTURE_MARKER;
    $condition['value'] = GDHE_A3_FIXTURE_VERSION;
    $query_args['meta_query'] = array($condition);
    $query = new WP_Query($query_args);
    $marker_posts = gdhe_object_value($query, 'posts', array());
    foreach (is_array($marker_posts) ? $marker_posts : array() as $post) {
        $post_id = (int) gdhe_object_value($post, 'ID', 0);
        if ((string) gdhe_object_value($post, 'post_type', '') === 'attachment') {
            if (wp_delete_attachment($post_id, true)) {
                $deleted['attachments']++;
            }
        } elseif (wp_delete_post($post_id, true)) {
            $deleted['posts']++;
        }
    }
    $taxonomy_map = array();
    $taxonomy_map['category'] = 'product_category';
    $taxonomy_map['series'] = 'product_series';
    $taxonomy_map['installation'] = 'installation_type';
    $taxonomy_map['support'] = 'support_topic';
    $taxonomy_map['document'] = 'document_type';
    foreach (array_keys($taxonomy_map) as $key) {
        $term_id = (int) ($manifest['terms'][$key] ?? 0);
        if ($term_id !== 0 && term_exists($term_id, $taxonomy_map[$key])) {
            $result = wp_delete_term($term_id, $taxonomy_map[$key]);
            if ($result && !is_wp_error($result)) {
                $deleted['terms']++;
            }
        }
    }
    $uploads = wp_upload_dir();
    if (is_array($uploads) && empty($uploads['error'])) {
        $pattern = trailingslashit((string) $uploads['basedir']) . '*/*/task-007-a3-*';
        $files = glob($pattern);
        foreach (is_array($files) ? $files : array() as $file) {
            if (is_file($file) && wp_delete_file($file)) {
                $deleted['uploads']++;
            }
        }
    }
    delete_option(GDHE_A3_FIXTURE_OPTION);
    return $deleted;
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gdhe a3-fixtures create', function (): void {
        $result = gdhe_a3_create_fixtures();
        if (is_wp_error($result)) {
            WP_CLI::error((string) call_user_func(array($result, 'get_error_message')));
        }
        WP_CLI::line(wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe a3-fixtures show', function (): void {
        WP_CLI::line(wp_json_encode(get_option(GDHE_A3_FIXTURE_OPTION, array()), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
    WP_CLI::add_command('gdhe a3-fixtures cleanup', function (): void {
        WP_CLI::line(wp_json_encode(gdhe_a3_cleanup_fixtures(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    });
}
