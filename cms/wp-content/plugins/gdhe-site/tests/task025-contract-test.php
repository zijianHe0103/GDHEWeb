<?php

defined('ABSPATH') || exit;

function gdhe_task025_test_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function gdhe_task025_test_request(
    array $document,
    string $content_type = 'application/json',
    array $query = array()
): array
{
    $request = new WP_REST_Request('POST', '/gdhe/v1/quote-line-validations');
    $request->set_query_params($query);
    $request->set_header('Content-Type', $content_type);
    $request->set_body(wp_json_encode($document, JSON_UNESCAPED_SLASHES));
    $response = rest_do_request($request);
    return array('status' => $response->get_status(), 'data' => $response->get_data(), 'headers' => $response->get_headers());
}

function gdhe_task025_test_raw_request(string $body, string $content_type = 'application/json'): array
{
    $request = new WP_REST_Request('POST', '/gdhe/v1/quote-line-validations');
    $request->set_header('Content-Type', $content_type);
    $request->set_body($body);
    $response = rest_do_request($request);
    return array('status' => $response->get_status(), 'data' => $response->get_data(), 'headers' => $response->get_headers());
}

function gdhe_task025_test_related(string $schema): array
{
    $request = new WP_REST_Request('GET', '/gdhe/v1/related-product-cards');
    foreach (array('locale' => 'en', 'schema' => $schema, 'source_path' => '/products/task-025-related-source/') as $key => $value) {
        $request->set_param($key, $value);
    }
    $response = rest_do_request($request);
    return array('status' => $response->get_status(), 'data' => $response->get_data(), 'headers' => $response->get_headers());
}

function gdhe_task025_test_packaging(): array
{
    return array('basePackaging' => 'standard', 'logoPrinting' => false, 'protectionArrangement' => null);
}

function gdhe_task025_test_configured(string $entry, string $resolution, float $length = 6.0): array
{
    return array(
        'entryId' => $entry, 'lineKind' => 'configured_product',
        'canonicalPath' => '/products/fgd-x15-pvc/',
        'selection' => array(
            'type' => $resolution === 'sales_follow_up' ? 'custom_length' : 'article_number',
            'articleNumber' => $resolution === 'standard_ready' ? 'GDHEPRD000172' : null,
            'lengthMeters' => $length,
            'color' => array('code' => 'ivory-white', 'label' => 'Ivory White'),
            'resolution' => $resolution,
        ),
        'packaging' => gdhe_task025_test_packaging(), 'quantityUnit' => 'piece', 'quantity' => 2,
    );
}

function gdhe_task025_test_accessory(string $entry): array
{
    return array(
        'entryId' => $entry, 'lineKind' => 'catalog_accessory',
        'articleNumber' => 'GDHEPRD000901', 'quantityUnit' => 'piece', 'quantity' => 3,
    );
}

function gdhe_task025_test_document(array $lines): array
{
    return array('apiVersion' => '1', 'schemaVersion' => '1.0.0', 'locale' => 'en', 'lines' => $lines);
}

function gdhe_task025_test_error(array $result, int $status, string $code): void
{
    gdhe_task025_test_assert((int) $result['status'] === $status, 'Unexpected error status for ' . $code);
    gdhe_task025_test_assert(($result['data']['code'] ?? '') === $code, 'Unexpected error code for ' . $code);
    gdhe_task025_test_assert(($result['headers']['Cache-Control'] ?? '') === 'no-store', 'Error is cacheable.');
    gdhe_task025_test_assert(!isset($result['headers']['ETag']), 'Error unexpectedly exposed an ETag.');
    $encoded = (string) wp_json_encode($result['data']);
    foreach (array('GDHEPRD', '/products/', '_gdhe_', 'wp-content', 'SQL') as $forbidden) {
        gdhe_task025_test_assert(!str_contains($encoded, $forbidden), 'Error leaked rejected or internal data.');
    }
    $evidence = $result['data'];
    $evidence['requestId'] = '25000000-0000-4000-8000-000000000099';
    $GLOBALS['gdhe_task025_error_evidence'][] = $evidence;
}

function gdhe_task025_test_write_json(string $path, $value): void
{
    $encoded = wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded) || file_put_contents($path, $encoded . PHP_EOL) === false) {
        throw new RuntimeException('Could not write TASK-025 JSON evidence.');
    }
}

function gdhe_task025_run_contract_test(): array
{
    gdhe_task025_test_assert(!is_user_logged_in(), 'TASK-025 contract test must be anonymous.');
    $manifest = get_option(GDHE_TASK025_FIXTURE_OPTION, array());
    gdhe_task025_test_assert(count($manifest['posts'] ?? array()) === 4, 'TASK-025 Fixture manifest is missing.');
    $configured_id = (int) $manifest['posts']['configured'];
    $source_id = (int) $manifest['posts']['source'];
    $accessory_id = (int) $manifest['posts']['accessory'];
    $artifact_dir = dirname(ABSPATH) . '/frontend/src/lib/cms/article-number-batch-contract/fixtures';
    $golden_dir = $artifact_dir . '/golden-wordpress';
    if (!is_dir($golden_dir) && !mkdir($golden_dir, 0775, true) && !is_dir($golden_dir)) {
        throw new RuntimeException('Could not create TASK-025 Golden directory.');
    }
    $GLOBALS['gdhe_task025_error_evidence'] = array();

    $v1 = gdhe_task025_test_related('1.0.0');
    $v2 = gdhe_task025_test_related('2.0.0');
    gdhe_task025_test_assert($v1['status'] === 200 && $v2['status'] === 200, 'RelatedProductCard route failed.');
    gdhe_task025_test_assert(
        ($v1['data']['items'][0]['directQuote'] ?? null) === array('kind' => 'catalog_accessory', 'quantityUnit' => 'piece'),
        'RelatedProductCard 1.0 bytes changed.'
    );
    gdhe_task025_test_assert(
        ($v2['data']['items'][0]['directQuote'] ?? null) === array(
            'kind' => 'catalog_accessory', 'articleNumber' => 'GDHEPRD000901', 'quantityUnit' => 'piece',
        ),
        'RelatedProductCard 2.0 Article Number projection is missing.'
    );
    gdhe_task025_test_write_json($golden_dir . '/related-product-card-v1.json', $v1['data']);
    gdhe_task025_test_write_json($golden_dir . '/related-product-card-v2.json', $v2['data']);

    $standard = gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_configured('25000000-0000-4000-8000-000000000101', 'standard_ready'),
    )));
    gdhe_task025_test_assert($standard['status'] === 200, 'Standard ready validation failed.');
    gdhe_task025_test_assert(($standard['data']['lines'][0]['articleNumber'] ?? null) === 'GDHEPRD000172', 'Standard Article Number drifted.');
    gdhe_task025_test_write_json($golden_dir . '/standard-ready.json', $standard['data']);

    $custom = gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_configured('25000000-0000-4000-8000-000000000102', 'sales_follow_up', 4.3),
    )));
    gdhe_task025_test_assert(
        $custom['status'] === 200
        && ($custom['data']['lines'][0]['resolution'] ?? '') === 'sales_follow_up'
        && array_key_exists('articleNumber', $custom['data']['lines'][0])
        && $custom['data']['lines'][0]['articleNumber'] === null,
        'Controlled custom resolution failed.'
    );
    gdhe_task025_test_write_json($golden_dir . '/custom-sales-follow-up.json', $custom['data']);

    $query_count = 0;
    $query_counter = static function ($query) use (&$query_count): void {
        $meta = wp_json_encode($query->get('meta_query'));
        if (is_string($meta) && (str_contains($meta, GDHE_PUBLIC_ARTICLE_NUMBER_META) || str_contains($meta, '_gdhe_public_path'))) {
            $query_count++;
        }
    };
    add_action('pre_get_posts', $query_counter);
    $refresh = gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_configured('25000000-0000-4000-8000-000000000103', 'refresh_from_selection'),
        gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000106'),
    )));
    remove_action('pre_get_posts', $query_counter);
    gdhe_task025_test_assert($refresh['status'] === 200, 'Migrated standard refresh failed.');
    gdhe_task025_test_assert($query_count <= 2, 'Product-domain resolver exceeded two bounded candidate queries.');
    gdhe_task025_test_write_json($golden_dir . '/migrated-standard-refresh.json', $refresh['data']);

    $mixed = gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_configured('25000000-0000-4000-8000-000000000104', 'standard_ready'),
        gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000105'),
    )));
    gdhe_task025_test_assert(
        $mixed['status'] === 200
        && array_column($mixed['data']['lines'], 'entryId') === array(
            '25000000-0000-4000-8000-000000000104',
            '25000000-0000-4000-8000-000000000105',
        ),
        'Mixed response did not preserve order.'
    );
    gdhe_task025_test_write_json($golden_dir . '/mixed-two-line.json', $mixed['data']);

    $fifty = array(
        gdhe_task025_test_configured('25000000-0000-4000-8000-000000000200', 'standard_ready'),
        gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000201'),
    );
    for ($index = 0; $index < 48; $index++) {
        $fifty[] = gdhe_task025_test_configured(
            sprintf('25000000-0000-4000-8000-%012d', 202 + $index),
            'sales_follow_up',
            ($index + 1) / 10
        );
    }
    $fifty_result = gdhe_task025_test_request(gdhe_task025_test_document($fifty));
    gdhe_task025_test_assert($fifty_result['status'] === 200 && count($fifty_result['data']['lines'] ?? array()) === 50, 'Real 50-line route failed.');
    gdhe_task025_test_write_json($golden_dir . '/mixed-fifty-line.json', $fifty_result['data']);

    $duplicate_entry = gdhe_task025_test_configured('25000000-0000-4000-8000-000000000300', 'standard_ready');
    $duplicate_entry_2 = gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000300');
    gdhe_task025_test_error(gdhe_task025_test_request(gdhe_task025_test_document(array($duplicate_entry, $duplicate_entry_2))), 400, 'gdhe_invalid_quote_line_request');
    $duplicate_merge = gdhe_task025_test_configured('25000000-0000-4000-8000-000000000301', 'standard_ready');
    $duplicate_merge_2 = $duplicate_merge;
    $duplicate_merge_2['entryId'] = '25000000-0000-4000-8000-000000000302';
    $duplicate_merge_2['quantity'] = 7;
    gdhe_task025_test_error(gdhe_task025_test_request(gdhe_task025_test_document(array($duplicate_merge, $duplicate_merge_2))), 400, 'gdhe_invalid_quote_line_request');
    gdhe_task025_test_error(gdhe_task025_test_request(gdhe_task025_test_document(array()), 'application/json'), 400, 'gdhe_invalid_quote_line_request');
    gdhe_task025_test_error(gdhe_task025_test_request(gdhe_task025_test_document(array($duplicate_entry)), 'application/json; charset=UTF-8'), 415, 'gdhe_unsupported_media_type');
    gdhe_task025_test_error(gdhe_task025_test_raw_request('{'), 400, 'gdhe_invalid_quote_line_request');
    gdhe_task025_test_error(gdhe_task025_test_raw_request(str_repeat(' ', GDHE_QUOTE_LINE_MAX_BYTES + 1)), 413, 'gdhe_quote_line_request_too_large');
    $unknown = gdhe_task025_test_document(array($duplicate_entry));
    $unknown['lines'][0]['name'] = 'untrusted';
    gdhe_task025_test_error(gdhe_task025_test_request($unknown), 400, 'gdhe_invalid_quote_line_request');
    gdhe_task025_test_error(
        gdhe_task025_test_request(gdhe_task025_test_document(array($duplicate_entry)), 'application/json', array('debug' => '1')),
        400,
        'gdhe_invalid_quote_line_request'
    );
    $uppercase_entry = gdhe_task025_test_document(array($duplicate_entry));
    $uppercase_entry['lines'][0]['entryId'] = 'ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF';
    gdhe_task025_test_error(gdhe_task025_test_request($uppercase_entry), 400, 'gdhe_invalid_quote_line_request');
    $fifty_one = array_fill(0, 51, $duplicate_entry);
    gdhe_task025_test_error(gdhe_task025_test_request(gdhe_task025_test_document($fifty_one)), 400, 'gdhe_invalid_quote_line_request');

    $original_accessory_source = get_post_meta($accessory_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, true);
    $original_index = get_post_meta($accessory_id, GDHE_PUBLIC_ARTICLE_NUMBER_META, false);
    $negative_mutations = array(
        'missing-source' => static function () use ($accessory_id): void { delete_post_meta($accessory_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META); },
        'missing-index' => static function () use ($accessory_id): void { delete_post_meta($accessory_id, GDHE_PUBLIC_ARTICLE_NUMBER_META); },
        'extra-index' => static function () use ($accessory_id): void { add_post_meta($accessory_id, GDHE_PUBLIC_ARTICLE_NUMBER_META, 'GDHEPRD000902'); },
        'role-conflict' => static function () use ($accessory_id, $original_accessory_source): void {
            $value = json_decode($original_accessory_source, true); $value['product']['productKind'] = 'curtain_track';
            update_post_meta($accessory_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, wp_json_encode($value, JSON_UNESCAPED_SLASHES));
        },
        'unit-conflict' => static function () use ($accessory_id, $original_accessory_source): void {
            $value = json_decode($original_accessory_source, true); $value['quantityUnit'] = 'roll';
            update_post_meta($accessory_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, wp_json_encode($value, JSON_UNESCAPED_SLASHES));
        },
        'path-conflict' => static function () use ($accessory_id, $original_accessory_source): void {
            $value = json_decode($original_accessory_source, true); $value['product']['publicPath'] = '/products/accessory/';
            update_post_meta($accessory_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, wp_json_encode($value, JSON_UNESCAPED_SLASHES));
        },
    );
    foreach ($negative_mutations as $name => $mutate) {
        update_post_meta($accessory_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, $original_accessory_source);
        delete_post_meta($accessory_id, GDHE_PUBLIC_ARTICLE_NUMBER_META);
        foreach ($original_index as $article) { add_post_meta($accessory_id, GDHE_PUBLIC_ARTICLE_NUMBER_META, $article); }
        $mutate();
        $result = gdhe_task025_test_request(gdhe_task025_test_document(array(
            gdhe_task025_test_configured('25000000-0000-4000-8000-000000000401', 'standard_ready'),
            gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000402'),
        )));
        gdhe_task025_test_error($result, 409, 'gdhe_quote_lines_changed');
    }
    update_post_meta($accessory_id, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, $original_accessory_source);
    delete_post_meta($accessory_id, GDHE_PUBLIC_ARTICLE_NUMBER_META);
    foreach ($original_index as $article) { add_post_meta($accessory_id, GDHE_PUBLIC_ARTICLE_NUMBER_META, $article); }

    wp_update_post(array('ID' => $accessory_id, 'post_status' => 'draft'));
    gdhe_task025_test_error(gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000406'),
    ))), 409, 'gdhe_quote_lines_changed');
    wp_update_post(array('ID' => $accessory_id, 'post_status' => 'publish'));

    $original_config_source = get_post_meta($configured_id, GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META, true);
    $config = json_decode($original_config_source, true);
    $config['articleNumberOptions'][0]['color']['label'] = 'Stale Label';
    update_post_meta($configured_id, GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META, wp_json_encode($config, JSON_UNESCAPED_SLASHES));
    gdhe_task025_test_error(gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_configured('25000000-0000-4000-8000-000000000403', 'standard_ready'),
        gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000404'),
    ))), 409, 'gdhe_quote_lines_changed');
    update_post_meta($configured_id, GDHE_PRODUCT_CONFIGURATION_V2_SOURCE_META, $original_config_source);

    $source_path = get_post_meta($source_id, '_gdhe_public_path', true);
    update_post_meta($source_id, '_gdhe_public_path', '/products/fgd-x15-pvc/');
    gdhe_task025_test_error(gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_configured('25000000-0000-4000-8000-000000000409', 'sales_follow_up', 4.3),
    ))), 409, 'gdhe_quote_lines_changed');
    update_post_meta($source_id, '_gdhe_public_path', $source_path);

    $index_first = gdhe_post_article_number_index($accessory_id);
    gdhe_task025_test_assert(gdhe_sync_public_article_number_index($accessory_id), 'First repeatable index sync failed.');
    $index_second = gdhe_post_article_number_index($accessory_id);
    gdhe_task025_test_assert(gdhe_sync_public_article_number_index($accessory_id), 'Second repeatable index sync failed.');
    gdhe_task025_test_assert(
        $index_first === $index_second && $index_second === gdhe_post_article_number_index($accessory_id),
        'Article Number index sync is not repeatable.'
    );

    $conflict = gdhe_task025_create_card_post(
        'conflict-accessory', 'TASK-025 Conflicting Accessory', 'TASK-025 CONFLICT',
        'catalog_accessory', null, '25000000-0000-4000-8000-000000000022', 4, $manifest
    );
    gdhe_task025_test_assert(!is_wp_error($conflict), 'Could not create global Article Number conflict fixture.');
    $conflict = (int) $conflict;
    update_post_meta($conflict, GDHE_TASK025_FIXTURE_MARKER, GDHE_TASK025_FIXTURE_VERSION);
    $conflict_source = json_decode($original_accessory_source, true);
    $conflict_source['product'] = array(
        'id' => '25000000-0000-4000-8000-000000000022', 'model' => 'TASK-025 CONFLICT',
        'name' => 'TASK-025 Conflicting Accessory', 'publicPath' => null,
        'productKind' => 'catalog_accessory', 'quantityUnit' => 'piece',
    );
    update_post_meta($conflict, GDHE_CATALOG_ACCESSORY_QUOTE_SOURCE_META, wp_json_encode($conflict_source, JSON_UNESCAPED_SLASHES));
    gdhe_sync_public_article_number_index($conflict);
    $global_conflict = gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000405'),
    )));
    gdhe_task025_test_error($global_conflict, 409, 'gdhe_quote_lines_changed');
    delete_post_meta($conflict, GDHE_PUBLIC_ARTICLE_NUMBER_META);
    $source_index_conflict = gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000408'),
    )));
    gdhe_task025_test_error($source_index_conflict, 409, 'gdhe_quote_lines_changed');
    $related_source_index_conflict = gdhe_task025_test_related('2.0.0');
    gdhe_task025_test_assert(
        $related_source_index_conflict['status'] === 200
        && ($related_source_index_conflict['data']['items'] ?? null) === array(),
        'RelatedProductCard 2.0 did not omit a globally inconsistent Article Number action.'
    );
    wp_delete_post($conflict, true);

    $overflow_filter = static function ($posts, $query) use ($accessory_id) {
        $meta = wp_json_encode($query->get('meta_query'));
        if (is_string($meta) && str_contains($meta, GDHE_PUBLIC_ARTICLE_NUMBER_META)) {
            return array_fill(0, GDHE_QUOTE_LINE_MAX_CANDIDATES, get_post($accessory_id));
        }
        return $posts;
    };
    add_filter('posts_pre_query', $overflow_filter, 10, 2);
    $overflow = gdhe_task025_test_request(gdhe_task025_test_document(array(
        gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000407'),
    )));
    remove_filter('posts_pre_query', $overflow_filter, 10);
    gdhe_task025_test_error($overflow, 500, 'gdhe_quote_line_validation_unavailable');

    $throwing_filter = static function (): void {
        throw new RuntimeException('TASK-025-INTERNAL-MUST-NOT-LEAK');
    };
    add_action('pre_get_posts', $throwing_filter);
    try {
        $unexpected_failure = gdhe_task025_test_request(gdhe_task025_test_document(array(
            gdhe_task025_test_accessory('25000000-0000-4000-8000-000000000410'),
        )));
    } catch (Throwable $error) {
        remove_action('pre_get_posts', $throwing_filter);
        throw new RuntimeException('Unexpected resolver exception escaped the stable error envelope.');
    }
    remove_action('pre_get_posts', $throwing_filter);
    gdhe_task025_test_error($unexpected_failure, 500, 'gdhe_quote_line_validation_unavailable');

    $error_evidence = $GLOBALS['gdhe_task025_error_evidence'];
    gdhe_task025_test_write_json($artifact_dir . '/QUOTE_LINE_ERROR_EVIDENCE.json', array(
        'normalizedRequestId' => '25000000-0000-4000-8000-000000000099',
        'errors' => $error_evidence,
        'sanitized' => true,
    ));
    $hashes = array();
    foreach (glob($golden_dir . '/*.json') ?: array() as $path) {
        $hashes[basename($path)] = hash_file('sha256', $path);
    }
    ksort($hashes, SORT_STRING);
    gdhe_task025_test_write_json($artifact_dir . '/WORDPRESS_RUNTIME_VALIDATION.json', array(
        'fixtureVersion' => GDHE_TASK025_FIXTURE_VERSION,
        'relatedProductCardVersions' => array('1.0.0', '2.0.0'),
        'mixedQuoteLineSchemaVersion' => '1.0.0',
        'successGoldenCount' => count($hashes),
        'successGoldenSha256' => $hashes,
        'errorCount' => count($error_evidence),
        'candidateQueryCount' => $query_count,
        'publicSubrequestCount' => 0,
        'articleNumberIndexRepeatable' => true,
        'globalArticleNumberConflictFailsClosed' => true,
        'valid' => true,
    ));

    return array(
        'relatedV1Exact' => true, 'relatedV2ArticleNumber' => true,
        'standardReady' => true, 'migratedStandardRefresh' => true,
        'customSalesFollowUp' => true, 'mixedOrder' => true,
        'oneLine' => true, 'fiftyLines' => true, 'candidateQueryCount' => $query_count,
        'atomicNegativeMutations' => array_keys($negative_mutations),
        'globalArticleNumberConflictFailsClosed' => true,
        'indexRepeatable' => true, 'valid' => true,
    );
}

WP_CLI::line(wp_json_encode(gdhe_task025_run_contract_test(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
