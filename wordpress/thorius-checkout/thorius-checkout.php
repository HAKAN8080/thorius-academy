<?php
/**
 * Plugin Name: Thorius Checkout
 * Description: Ödeme sayfası alanları, kurumsal fatura alanları ve checkout UI düzeltmeleri.
 * Version: 1.2.4
 * Author: Thorius
 * Text Domain: thorius-checkout
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_CHECKOUT_VERSION', '1.2.4');
define('THORIUS_CHECKOUT_PATH', plugin_dir_path(__FILE__));
define('THORIUS_CHECKOUT_URL', plugin_dir_url(__FILE__));

/**
 * Özel fatura alanları: İşletme Adı + Vergi Numarası (opsiyonel).
 */
function thorius_checkout_billing_fields(array $fields): array
{
    if (!isset($fields['billing'])) {
        return $fields;
    }

    $fields['billing']['billing_first_name']['priority'] = 10;
    $fields['billing']['billing_last_name']['priority'] = 20;

    $fields['billing']['billing_company'] = array_merge(
        $fields['billing']['billing_company'] ?? array(
            'type' => 'text',
            'class' => array('form-row-first'),
        ),
        array(
            'label' => __('İşletme Adı', 'thorius-checkout'),
            'placeholder' => __('Opsiyonel', 'thorius-checkout'),
            'required' => false,
            'priority' => 30,
            'class' => array('form-row-first'),
        )
    );

    $fields['billing']['billing_vkn'] = array(
        'type' => 'text',
        'label' => __('Vergi Numarası', 'thorius-checkout'),
        'placeholder' => __('Opsiyonel', 'thorius-checkout'),
        'required' => false,
        'class' => array('form-row-last'),
        'priority' => 31,
        'maxlength' => 11,
        'custom_attributes' => array(
            'inputmode' => 'numeric',
            'autocomplete' => 'off',
        ),
    );

    $fields['billing']['billing_country']['priority'] = 40;
    $fields['billing']['billing_address_1']['priority'] = 50;
    $fields['billing']['billing_city']['priority'] = 60;
    $fields['billing']['billing_phone']['priority'] = 70;
    $fields['billing']['billing_email']['priority'] = 80;

    return $fields;
}
add_filter('woocommerce_checkout_fields', 'thorius_checkout_billing_fields', 20);

/**
 * Academy'den gelen billing alanlarını query string ile önceden doldur.
 */
function thorius_checkout_prefill_from_query($value, string $input)
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return $value;
    }

    if (!isset($_GET[$input]) || $_GET[$input] === '') {
        return $value;
    }

    $allowed = array(
        'billing_email',
        'billing_first_name',
        'billing_last_name',
        'billing_phone',
    );

    if (!in_array($input, $allowed, true)) {
        return $value;
    }

    return sanitize_text_field(wp_unslash($_GET[$input]));
}
add_filter('woocommerce_checkout_get_value', 'thorius_checkout_prefill_from_query', 20, 2);

/**
 * Fatura formu üstünde zorunlu alan notu.
 */
function thorius_checkout_billing_required_note(): void
{
    echo '<p class="thorius-checkout-required-note">' .
        esc_html__('Zorunlu alanlar * ile işaretlenmiştir.', 'thorius-checkout') .
        '</p>';
}
add_action('woocommerce_before_checkout_billing_form', 'thorius_checkout_billing_required_note', 5);

/**
 * Vergi numarasını sipariş meta olarak kaydet.
 */
function thorius_checkout_save_vkn(int $order_id): void
{
    if (empty($_POST['billing_vkn'])) {
        return;
    }

    $vkn = sanitize_text_field(wp_unslash($_POST['billing_vkn']));
    update_post_meta($order_id, '_billing_vkn', $vkn);
}
add_action('woocommerce_checkout_update_order_meta', 'thorius_checkout_save_vkn');

/**
 * Admin sipariş ekranında vergi numarasını göster.
 */
function thorius_checkout_admin_order_meta($order): void
{
    if (!is_a($order, 'WC_Order')) {
        return;
    }

    $vkn = $order->get_meta('_billing_vkn');
    if (!$vkn) {
        return;
    }

    echo '<p><strong>' . esc_html__('Vergi Numarası', 'thorius-checkout') . ':</strong> ' . esc_html($vkn) . '</p>';
}
add_action('woocommerce_admin_order_data_after_billing_address', 'thorius_checkout_admin_order_meta');

/**
 * Sepeti atla — ürün eklendikten sonra doğrudan ödeme sayfasına yönlendir.
 */
function thorius_checkout_add_to_cart_redirect(string $url): string
{
    if (!function_exists('wc_get_checkout_url')) {
        return $url;
    }

    return wc_get_checkout_url();
}
add_filter('woocommerce_add_to_cart_redirect', 'thorius_checkout_add_to_cart_redirect');

/**
 * Sepet sayfasını atla — dolu sepet varsa ödeme sayfasına yönlendir.
 */
function thorius_checkout_skip_cart_page(): void
{
    if (!function_exists('is_cart') || !is_cart()) {
        return;
    }

    if (!function_exists('WC') || !WC()->cart || WC()->cart->is_empty()) {
        return;
    }

    wp_safe_redirect(wc_get_checkout_url());
    exit;
}
add_action('template_redirect', 'thorius_checkout_skip_cart_page', 20);

/**
 * Checkout CSS — kupon ikonu, PayTR metni, kompakt layout.
 */
function thorius_checkout_enqueue_assets(): void
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    wp_enqueue_style(
        'thorius-checkout',
        THORIUS_CHECKOUT_URL . 'assets/checkout.css',
        array('woocommerce-layout', 'woocommerce-smallscreen', 'woocommerce-general'),
        THORIUS_CHECKOUT_VERSION
    );

    wp_enqueue_script(
        'thorius-checkout',
        THORIUS_CHECKOUT_URL . 'assets/checkout.js',
        array(),
        THORIUS_CHECKOUT_VERSION,
        true
    );
}
add_action('wp_enqueue_scripts', 'thorius_checkout_enqueue_assets', 99);
