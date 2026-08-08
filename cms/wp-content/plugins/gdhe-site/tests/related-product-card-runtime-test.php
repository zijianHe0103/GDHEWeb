<?php

defined('ABSPATH') || exit;

$routes = rest_get_server()->get_routes();
if (!isset($routes['/gdhe/v1/related-product-cards'])) {
    throw new RuntimeException('RelatedProductCardCollection REST route is missing.');
}

WP_CLI::line('RelatedProductCardCollection REST route exists.');
