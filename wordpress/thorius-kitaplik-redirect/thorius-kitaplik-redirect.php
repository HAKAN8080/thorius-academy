<?php
/**
 * Plugin Name: Thorius Kitaplik Redirect
 * Description: thorius.com.tr/kitaplik → kitaplik.thorius.com.tr (301)
 * Version: 1.0.0
 * Author: Thorius
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eski "yazım aşamasında" Kitaplık sayfasını canlı Kitaplık subdomain'ine yönlendir.
 */
function thorius_kitaplik_redirect_legacy_path(): void
{
    if (is_admin() || wp_doing_ajax() || wp_doing_cron()) {
        return;
    }

    $requestUri = isset($_SERVER['REQUEST_URI'])
        ? (string) $_SERVER['REQUEST_URI']
        : '';
    $path = (string) (parse_url($requestUri, PHP_URL_PATH) ?: '');

    if (!preg_match('#^/kitaplik(/|$)#i', $path)) {
        return;
    }

    $target = 'https://kitaplik.thorius.com.tr/';
    wp_redirect($target, 301);
    exit;
}
add_action('template_redirect', 'thorius_kitaplik_redirect_legacy_path', 0);
