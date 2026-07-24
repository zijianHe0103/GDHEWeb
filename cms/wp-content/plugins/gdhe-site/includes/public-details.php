<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

function gdhe_detail_string_list($value, int $maximum = 50): array
{
    if (!is_array($value) || count(array_slice($value, 0, $maximum + 1)) !== count($value)) {
        return array();
    }
    $items = array();
    foreach ($value as $item) {
        $text = is_array($item) ? (string) ($item['value'] ?? '') : (string) $item;
        $text = trim(wp_strip_all_tags($text));
        if ($text === '' || min(strlen($text), 500) !== strlen($text)) {
            return array();
        }
        $items[] = $text;
    }
    return $items;
}

function gdhe_detail_rows($value, array $required_keys, int $maximum = 50)
{
    if (!is_array($value)
        || $value === array()
        || count(array_slice($value, 0, $maximum + 1)) !== count($value)) {
        return null;
    }
    $rows = array();
    foreach ($value as $row) {
        if (!is_array($row)) {
            return null;
        }
        $clean = array();
        foreach ($required_keys as $key) {
            $text = trim(wp_strip_all_tags((string) ($row[$key] ?? '')));
            if ($text === '' || min(strlen($text), 500) !== strlen($text)) {
                return null;
            }
            $clean[$key] = $text;
        }
        foreach (array('unit', 'color') as $optional_key) {
            $optional_value = trim(wp_strip_all_tags((string) ($row[$optional_key] ?? '')));
            if ($optional_value !== '') {
                $clean[$optional_key] = $optional_value;
            }
        }
        $rows[] = $clean;
    }
    return $rows;
}

function gdhe_normalize_public_file($value)
{
    $attachment_id = (int) $value;
    $attachment = get_post($attachment_id);
    $parent_id = (int) gdhe_object_value($attachment, 'post_parent', 0);
    $status = (string) gdhe_object_value($attachment, 'post_status', '');
    if (!is_object($attachment)
        || (string) gdhe_object_value($attachment, 'post_type', '') !== 'attachment'
        || !in_array($status, array('inherit', 'publish'), true)
        || !gdhe_is_public_post_reference($parent_id)) {
        return null;
    }
    $public_id = gdhe_public_identifier($attachment_id, '_gdhe_public_media_id');
    $url = wp_get_attachment_url($attachment_id);
    $path = get_attached_file($attachment_id);
    if ($public_id === '' || !is_string($url) || $url === '' || !is_string($path) || !is_file($path)) {
        return null;
    }
    $file = array();
    $file['id'] = $public_id;
    $file['url'] = $url;
    $file['filename'] = wp_basename($path);
    $file['mimeType'] = (string) get_post_mime_type($attachment_id);
    $file['bytes'] = (int) filesize($path);
    return $file;
}

function gdhe_public_term_slugs(int $post_id, string $taxonomy, int $maximum = 20): array
{
    $terms = get_the_terms($post_id, $taxonomy);
    if (!is_array($terms) || count(array_slice($terms, 0, $maximum + 1)) !== count($terms)) {
        return array();
    }
    $slugs = array();
    foreach ($terms as $term) {
        $slug = (string) gdhe_object_value($term, 'slug', '');
        if ($slug === '' || sanitize_title($slug) !== $slug) {
            return array();
        }
        $slugs[] = $slug;
    }
    sort($slugs, SORT_STRING);
    return $slugs;
}

function gdhe_product_public_details(array $raw, int $post_id)
{
    $model = trim(wp_strip_all_tags((string) ($raw['model'] ?? '')));
    $code = trim(wp_strip_all_tags((string) ($raw['product_code'] ?? '')));
    $features = gdhe_detail_string_list($raw['features'] ?? array(), 20);
    $specifications = gdhe_detail_rows(
        $raw['specifications'] ?? array(),
        array('key', 'label', 'value')
    );
    $article_numbers = gdhe_detail_rows(
        $raw['article_numbers'] ?? array(),
        array('number', 'region'),
        30
    );
    $installation = trim(wp_strip_all_tags((string) ($raw['installation'] ?? '')));
    if ($model === ''
        || $code === ''
        || $features === array()
        || !is_array($specifications)
        || !is_array($article_numbers)
        || $installation === '') {
        return null;
    }
    $details = array();
    $details['model'] = $model;
    $details['productCode'] = $code;
    $details['categories'] = gdhe_public_term_slugs($post_id, 'product_category');
    $details['series'] = gdhe_public_term_slugs($post_id, 'product_series');
    $details['installationTypes'] = gdhe_public_term_slugs($post_id, 'installation_type');
    if ($details['categories'] === array()
        || $details['series'] === array()
        || $details['installationTypes'] === array()) {
        return null;
    }
    $details['positioning'] = trim(wp_strip_all_tags((string) ($raw['positioning'] ?? '')));
    $details['features'] = $features;
    $details['specifications'] = $specifications;
    $details['articleNumbers'] = $article_numbers;
    $finishes = gdhe_detail_rows($raw['finishes'] ?? array(), array('code', 'label'), 30);
    $details['finishes'] = is_array($finishes) ? $finishes : array();
    $details['installation'] = $installation;
    $details['control'] = trim(wp_strip_all_tags((string) ($raw['control'] ?? '')));
    $details['compatibility'] = gdhe_detail_string_list($raw['compatibility'] ?? array(), 30);
    $gallery = array();
    $gallery_source = is_array($raw['gallery'] ?? null) ? $raw['gallery'] : array();
    foreach (array_slice($gallery_source, 0, 20) as $attachment_id) {
        $media = gdhe_normalize_media_reference($attachment_id);
        if (!is_array($media)) {
            return null;
        }
        $gallery[] = $media;
    }
    $details['gallery'] = $gallery;
    $video_url = esc_url_raw((string) ($raw['video_url'] ?? ''), array('https'));
    $details['videoUrl'] = $video_url === '' ? null : $video_url;
    $details['inquiryCta'] = gdhe_normalize_public_link($raw['inquiry_cta'] ?? null);
    return $details;
}

function gdhe_market_public_details(array $raw)
{
    $benefits = gdhe_detail_string_list($raw['benefits'] ?? array(), 20);
    if ($benefits === array()) {
        return null;
    }
    $details = array();
    $details['benefits'] = $benefits;
    $details['requirements'] = gdhe_detail_string_list($raw['requirements'] ?? array(), 20);
    $details['cta'] = gdhe_normalize_public_link($raw['cta'] ?? null);
    return $details;
}

function gdhe_reference_public_details(array $raw)
{
    $location = trim(wp_strip_all_tags((string) ($raw['location'] ?? '')));
    $challenge = trim(wp_strip_all_tags((string) ($raw['challenge'] ?? '')));
    $solution = gdhe_sanitize_public_html((string) ($raw['solution'] ?? ''));
    if ($location === '' || $challenge === '' || $solution === '') {
        return null;
    }
    $details = array();
    $details['location'] = $location;
    $details['challenge'] = $challenge;
    $details['solutionSafeHtml'] = $solution;
    $details['results'] = gdhe_detail_string_list($raw['results'] ?? array(), 20);
    $details['cta'] = gdhe_normalize_public_link($raw['cta'] ?? null);
    return $details;
}

function gdhe_support_public_details(array $raw, int $post_id)
{
    $goal = trim(wp_strip_all_tags((string) ($raw['problem_or_goal'] ?? '')));
    $instructions = gdhe_sanitize_public_html((string) ($raw['instructions'] ?? ''));
    $topics = get_the_terms($post_id, 'support_topic');
    if ($goal === '' || $instructions === '' || !is_array($topics) || count($topics) !== 1) {
        return null;
    }
    $details = array();
    $details['topic'] = (string) gdhe_object_value($topics[0], 'slug', '');
    $details['problemOrGoal'] = $goal;
    $details['instructionsSafeHtml'] = $instructions;
    $video_url = esc_url_raw((string) ($raw['video_url'] ?? ''), array('https'));
    $details['videoUrl'] = $video_url === '' ? null : $video_url;
    return $details;
}

function gdhe_download_public_details(array $raw, int $post_id)
{
    $file = gdhe_normalize_public_file($raw['file'] ?? 0);
    $document_types = get_the_terms($post_id, 'document_type');
    $version = trim(wp_strip_all_tags((string) ($raw['version'] ?? '')));
    $date = (string) ($raw['date'] ?? '');
    $locale = (string) ($raw['locale'] ?? '');
    if (!is_array($file)
        || !is_array($document_types)
        || count($document_types) !== 1
        || $version === ''
        || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1
        || $locale !== 'en') {
        return null;
    }
    $details = array();
    $details['documentType'] = (string) gdhe_object_value($document_types[0], 'slug', '');
    $details['version'] = $version;
    $details['date'] = $date;
    $details['locale'] = 'en';
    $details['file'] = $file;
    $details['description'] = trim(wp_strip_all_tags((string) ($raw['description'] ?? '')));
    return $details;
}

function gdhe_normalize_type_details(string $type, int $post_id)
{
    if ($type === 'page' || $type === 'post') {
        return new stdClass();
    }
    $field_map = array();
    $field_map['product'] = 'product_details';
    $field_map['market'] = 'market_details';
    $field_map['reference'] = 'reference_details';
    $field_map['support_article'] = 'support_details';
    $field_map['download'] = 'download_details';
    if (!isset($field_map[$type])) {
        return null;
    }
    $raw = get_field($field_map[$type], $post_id, true);
    if (!is_array($raw)) {
        return null;
    }
    if ($type === 'product') {
        return gdhe_product_public_details($raw, $post_id);
    }
    if ($type === 'market') {
        return gdhe_market_public_details($raw);
    }
    if ($type === 'reference') {
        return gdhe_reference_public_details($raw);
    }
    if ($type === 'support_article') {
        return gdhe_support_public_details($raw, $post_id);
    }
    return gdhe_download_public_details($raw, $post_id);
}
