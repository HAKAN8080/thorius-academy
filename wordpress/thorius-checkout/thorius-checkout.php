<?php
/**
 * Plugin Name: Thorius Checkout
 * Description: Dijital kurslar için sadeleştirilmiş WooCommerce ödeme sayfası.
 * Version: 1.3.0
 * Author: Thorius
 * Text Domain: thorius-checkout
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_CHECKOUT_VERSION', '1.3.0');
define('THORIUS_CHECKOUT_PATH', plugin_dir_path(__FILE__));
define('THORIUS_CHECKOUT_URL', plugin_dir_url(__FILE__));

/**
 * Yalnızca ad, soyad ve e-posta alanlarını göster.
 */
function thorius_checkout_billing_fields(array $fields): array
{
    if (!isset($fields['billing'])) {
        return $fields;
    }

    $keep = array(
        'billing_first_name',
        'billing_last_name',
        'billing_email',
    );

    foreach (array_keys($fields['billing']) as $key) {
        if (!in_array($key, $keep, true)) {
            unset($fields['billing'][$key]);
        }
    }

    $fields['billing']['billing_first_name']['priority'] = 10;
    $fields['billing']['billing_first_name']['required'] = true;
    $fields['billing']['billing_first_name']['class'] = array('form-row-first');

    $fields['billing']['billing_last_name']['priority'] = 20;
    $fields['billing']['billing_last_name']['required'] = true;
    $fields['billing']['billing_last_name']['class'] = array('form-row-last');

    $fields['billing']['billing_email']['priority'] = 30;
    $fields['billing']['billing_email']['required'] = true;
    $fields['billing']['billing_email']['class'] = array('form-row-wide');

    return $fields;
}
add_filter('woocommerce_checkout_fields', 'thorius_checkout_billing_fields', 20);

/**
 * Teslimat alanlarını kaldır.
 */
function thorius_checkout_remove_shipping_fields(array $fields): array
{
    unset($fields['shipping']);
    unset($fields['order']);

    return $fields;
}
add_filter('woocommerce_checkout_fields', 'thorius_checkout_remove_shipping_fields', 30);

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
    );

    if (!in_array($input, $allowed, true)) {
        return $value;
    }

    return sanitize_text_field(wp_unslash($_GET[$input]));
}
add_filter('woocommerce_checkout_get_value', 'thorius_checkout_prefill_from_query', 20, 2);

/**
 * WooCommerce / PayTR için görünmeyen varsayılan fatura bilgileri.
 */
function thorius_checkout_posted_data(array $data): array
{
    $defaults = array(
        'billing_country' => 'TR',
        'billing_city' => 'Istanbul',
        'billing_address_1' => 'Dijital urun',
        'billing_postcode' => '34000',
        'billing_state' => 'TR34',
        'billing_phone' => '',
    );

    foreach ($defaults as $key => $default) {
        if (empty($data[$key])) {
            $data[$key] = $default;
        }
    }

    return $data;
}
add_filter('woocommerce_checkout_posted_data', 'thorius_checkout_posted_data', 20);

/**
 * Sipariş kaydında eksik fatura alanlarını tamamla.
 */
function thorius_checkout_create_order_defaults($order, array $data): void
{
    if (!is_a($order, 'WC_Order')) {
        return;
    }

    if (!$order->get_billing_country()) {
        $order->set_billing_country('TR');
    }
    if (!$order->get_billing_city()) {
        $order->set_billing_city('Istanbul');
    }
    if (!$order->get_billing_address_1()) {
        $order->set_billing_address_1('Dijital urun');
    }
    if (!$order->get_billing_postcode()) {
        $order->set_billing_postcode('34000');
    }
    if (!$order->get_billing_state()) {
        $order->set_billing_state('TR34');
    }
}
add_action('woocommerce_checkout_create_order', 'thorius_checkout_create_order_defaults', 20, 2);

/**
 * Dijital ürün — teslimat adresi gerekmez.
 */
add_filter('woocommerce_cart_needs_shipping_address', '__return_false');
add_filter('woocommerce_cart_needs_shipping', '__return_false');
add_filter('woocommerce_enable_order_notes_field', '__return_false');
add_filter('woocommerce_ship_to_different_address_checked', '__return_false');

/**
 * Fatura formu üstünde zorunlu alan notu.
 */
function thorius_checkout_billing_required_note(): void
{
    echo '<p class="thorius-checkout-required-note">' .
        esc_html__('Sadece ad, soyad ve e-posta yeterlidir. Zorunlu alanlar * ile işaretlenmiştir.', 'thorius-checkout') .
        '</p>';
}
add_action('woocommerce_before_checkout_billing_form', 'thorius_checkout_billing_required_note', 5);

/**
 * Eski siparişlerdeki vergi numarasını admin ekranında göster.
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
