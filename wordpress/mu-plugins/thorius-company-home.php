<?php
/**
 * Plugin Name: Thorius Company Homepage
 * Description: Ana sayfada (front page) wp-content/thorius-company-home.html dosyasını gösterir. Block editör gerekmez.
 * Version: 1.0.0
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

const THORIUS_COMPANY_HOME_FILE = WP_CONTENT_DIR . '/thorius-company-home.html';

add_action('template_redirect', static function (): void {
    if (is_admin() || !is_front_page()) {
        return;
    }

    if (!is_readable(THORIUS_COMPANY_HOME_FILE)) {
        return;
    }

    status_header(200);
    nocache_headers();
    header('Content-Type: text/html; charset=utf-8');
    readfile(THORIUS_COMPANY_HOME_FILE);
    exit;
});
