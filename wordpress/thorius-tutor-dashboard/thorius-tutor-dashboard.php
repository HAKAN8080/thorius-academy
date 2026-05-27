<?php
/**
 * Plugin Name: Thorius Tutor Dashboard
 * Description: Tutor LMS kontrol paneli (kontrol-paneli) görünümünü Thorius markasına uyarlar.
 * Version: 1.1.0
 * Author: Thorius
 * Text Domain: thorius-tutor-dashboard
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_TUTOR_DASHBOARD_VERSION', '1.1.0');
define('THORIUS_TUTOR_DASHBOARD_URL', plugin_dir_url(__FILE__));

function thorius_tutor_dashboard_enqueue_assets(): void
{
    if (!function_exists('tutor_utils')) {
        return;
    }

    $is_dashboard = false;

    if (function_exists('is_page') && is_page()) {
        $slug = get_post_field('post_name', get_queried_object_id());
        if (is_string($slug) && in_array($slug, array('kontrol-paneli', 'dashboard'), true)) {
            $is_dashboard = true;
        }
    }

    if (!$is_dashboard && function_exists('tutor_utils')) {
        $dashboard_page_id = (int) tutor_utils()->get_tutor_dashboard_page_id();
        if ($dashboard_page_id > 0 && is_page($dashboard_page_id)) {
            $is_dashboard = true;
        }
    }

    if (!$is_dashboard) {
        return;
    }

    wp_enqueue_style(
        'thorius-tutor-dashboard',
        THORIUS_TUTOR_DASHBOARD_URL . 'assets/dashboard.css',
        array('tutor-frontend-dashboard-css'),
        THORIUS_TUTOR_DASHBOARD_VERSION
    );
}
add_action('wp_enqueue_scripts', 'thorius_tutor_dashboard_enqueue_assets', 99);
