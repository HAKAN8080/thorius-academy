<?php
/**
 * Plugin Name: Thorius Checkout
 * Description: Dijital kurslar için sadeleştirilmiş WooCommerce ödeme sayfası.
 * Version: 1.4.0
 * Author: Thorius
 * Text Domain: thorius-checkout
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_CHECKOUT_VERSION', '1.4.0');
define('THORIUS_CHECKOUT_PATH', plugin_dir_path(__FILE__));
define('THORIUS_CHECKOUT_URL', plugin_dir_url(__FILE__));

/**
 * @return list<string>
 */
function thorius_checkout_visible_billing_fields(): array
{
    return array(
        'billing_first_name',
        'billing_last_name',
        'billing_email',
    );
}

/**
 * PayTR / WooCommerce'in arka planda bekledigi fatura alanlari.
 *
 * @return array<string, string>
 */
function thorius_checkout_hidden_billing_defaults(): array
{
    return array(
        'billing_country' => 'TR',
        'billing_city' => 'Istanbul',
        'billing_address_1' => 'Dijital urun',
        'billing_postcode' => '34000',
        'billing_state' => 'TR34',
        'billing_phone' => '5000000000',
    );
}

/**
 * Yalnizca ad, soyad ve e-posta alanlarini goster.
 */
function thorius_checkout_billing_fields(array $fields): array
{
    if (!isset($fields['billing'])) {
        return $fields;
    }

    $keep = thorius_checkout_visible_billing_fields();

    foreach (array_keys($fields['billing']) as $key) {
        if (!in_array($key, $keep, true)) {
            unset($fields['billing'][$key]);
        }
    }

    $fields['billing']['billing_first_name']['priority'] = 10;
    $fields['billing']['billing_first_name']['required'] = true;
    $fields['billing']['billing_first_name']['class'] = array('form-row-first');
    $fields['billing']['billing_first_name']['label'] = __('Ad', 'thorius-checkout');

    $fields['billing']['billing_last_name']['priority'] = 20;
    $fields['billing']['billing_last_name']['required'] = true;
    $fields['billing']['billing_last_name']['class'] = array('form-row-last');
    $fields['billing']['billing_last_name']['label'] = __('Soyad', 'thorius-checkout');

    $fields['billing']['billing_email']['priority'] = 30;
    $fields['billing']['billing_email']['required'] = true;
    $fields['billing']['billing_email']['class'] = array('form-row-wide');
    $fields['billing']['billing_email']['label'] = __('E-posta adresi', 'thorius-checkout');

    return $fields;
}
add_filter('woocommerce_checkout_fields', 'thorius_checkout_billing_fields', 20);
add_filter('woocommerce_checkout_fields', 'thorius_checkout_billing_fields', 9999);

/**
 * Teslimat alanlarini kaldir.
 */
function thorius_checkout_remove_shipping_fields(array $fields): array
{
    unset($fields['shipping']);
    unset($fields['order']);

    return $fields;
}
add_filter('woocommerce_checkout_fields', 'thorius_checkout_remove_shipping_fields', 30);

/**
 * Academy'den gelen billing alanlarini query string ile onceden doldur.
 */
function thorius_checkout_prefill_from_query($value, string $input)
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return $value;
    }

    if (!isset($_GET[$input]) || $_GET[$input] === '') {
        return $value;
    }

    if (!in_array($input, thorius_checkout_visible_billing_fields(), true)) {
        return $value;
    }

    return sanitize_text_field(wp_unslash($_GET[$input]));
}
add_filter('woocommerce_checkout_get_value', 'thorius_checkout_prefill_from_query', 20, 2);

/**
 * @param array<string, mixed> $target
 */
function thorius_checkout_apply_hidden_billing_defaults(array &$target): void
{
    foreach (thorius_checkout_hidden_billing_defaults() as $key => $default) {
        if (!isset($target[$key]) || $target[$key] === '' || $target[$key] === null) {
            $target[$key] = $default;
        }
    }
}

/**
 * WooCommerce / PayTR icin gorunmeyen varsayilan fatura bilgileri.
 */
function thorius_checkout_posted_data(array $data): array
{
    thorius_checkout_apply_hidden_billing_defaults($data);

    return $data;
}
add_filter('woocommerce_checkout_posted_data', 'thorius_checkout_posted_data', 5);

/**
 * Bazi eklentiler dogrudan $_POST uzerinden dogrulama yapar.
 */
function thorius_checkout_inject_posted_billing_defaults(): void
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    thorius_checkout_apply_hidden_billing_defaults($_POST);
}
add_action('woocommerce_checkout_process', 'thorius_checkout_inject_posted_billing_defaults', 1);
add_action('woocommerce_before_checkout_process', 'thorius_checkout_inject_posted_billing_defaults', 1);

/**
 * Oturumdaki musteri nesnesine varsayilan fatura bilgilerini yaz.
 */
function thorius_checkout_set_customer_defaults(): void
{
    if (!function_exists('is_checkout') || !is_checkout() || !function_exists('WC') || !WC()->customer) {
        return;
    }

    $customer = WC()->customer;
    foreach (thorius_checkout_hidden_billing_defaults() as $key => $value) {
        $setter = 'set_' . $key;
        $getter = 'get_' . $key;
        if (!method_exists($customer, $setter) || !method_exists($customer, $getter)) {
            continue;
        }

        $current = $customer->$getter();
        if ($current === '' || $current === null) {
            $customer->$setter($value);
        }
    }
}
add_action('woocommerce_checkout_init', 'thorius_checkout_set_customer_defaults', 5);

/**
 * Gizli fatura alanlari icin hatali dogrulama mesajlarini temizle.
 */
function thorius_checkout_clear_hidden_billing_errors($data, $errors): void
{
    if (!is_wp_error($errors)) {
        return;
    }

    $keep = thorius_checkout_visible_billing_fields();

    foreach ($errors->get_error_codes() as $code) {
        if (in_array($code, $keep, true)) {
            continue;
        }

        if (strpos((string) $code, 'billing_') === 0) {
            $errors->remove($code);
            continue;
        }

        $message = $errors->get_error_message($code);
        if (
            is_string($message) &&
            (
                stripos($message, 'fatura') !== false ||
                stripos($message, 'billing') !== false ||
                stripos($message, 'telefon') !== false ||
                stripos($message, 'adres') !== false ||
                stripos($message, 'vergi') !== false ||
                stripos($message, 'sirket') !== false ||
                stripos($message, 'company') !== false
            ) &&
            !preg_match('/(ad|soyad|e-posta|email|first name|last name)/iu', $message)
        ) {
            $errors->remove($code);
        }
    }
}
add_action('woocommerce_after_checkout_validation', 'thorius_checkout_clear_hidden_billing_errors', 999, 2);

/**
 * Siparis kaydinda eksik fatura alanlarini tamamla.
 */
function thorius_checkout_create_order_defaults($order, array $data): void
{
    if (!is_a($order, 'WC_Order')) {
        return;
    }

    foreach (thorius_checkout_hidden_billing_defaults() as $key => $default) {
        $setter = 'set_' . $key;
        $getter = 'get_' . $key;
        if (!method_exists($order, $setter) || !method_exists($order, $getter)) {
            continue;
        }

        if (!$order->$getter()) {
            $order->$setter($default);
        }
    }
}
add_action('woocommerce_checkout_create_order', 'thorius_checkout_create_order_defaults', 20, 2);

/**
 * Dijital urun — teslimat adresi gerekmez.
 */
add_filter('woocommerce_cart_needs_shipping_address', '__return_false');
add_filter('woocommerce_cart_needs_shipping', '__return_false');
add_filter('woocommerce_enable_order_notes_field', '__return_false');
add_filter('woocommerce_ship_to_different_address_checked', '__return_false');

/**
 * Fatura formu ustunde zorunlu alan notu.
 */
function thorius_checkout_billing_required_note(): void
{
    echo '<p class="thorius-checkout-required-note">' .
        esc_html__('Sadece ad, soyad ve e-posta yeterlidir. Zorunlu alanlar * ile isaretlenmistir.', 'thorius-checkout') .
        '</p>';
}
add_action('woocommerce_before_checkout_billing_form', 'thorius_checkout_billing_required_note', 5);

/**
 * Eski siparislerdeki vergi numarasini admin ekraninda goster.
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

    echo '<p><strong>' . esc_html__('Vergi Numarasi', 'thorius-checkout') . ':</strong> ' . esc_html($vkn) . '</p>';
}
add_action('woocommerce_admin_order_data_after_billing_address', 'thorius_checkout_admin_order_meta');

/**
 * Sepeti atla — urun eklendikten sonra dogrudan odeme sayfasina yonlendir.
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
 * Sepet sayfasini atla — dolu sepet varsa odeme sayfasina yonlendir.
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
