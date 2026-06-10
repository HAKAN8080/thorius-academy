<?php
/**
 * Plugin Name: Thorius Checkout
 * Description: Dijital kurslar için sadeleştirilmiş WooCommerce ödeme sayfası.
 * Version: 1.6.2
 * Author: Thorius
 * Text Domain: thorius-checkout
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_CHECKOUT_VERSION', '1.6.2');
define('THORIUS_CHECKOUT_TERMS_FALLBACK_URL', 'https://academy.thorius.com.tr/kullanim-kosullari');
define('THORIUS_CHECKOUT_PRIVACY_FALLBACK_URL', 'https://academy.thorius.com.tr/gizlilik');
define('THORIUS_CHECKOUT_CATALOG_URL', 'https://academy.thorius.com.tr/kurslar');
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
        'billing_phone',
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
    );
}

/**
 * Ad, soyad, e-posta ve telefon alanlarini goster.
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

    $fields['billing']['billing_phone']['priority'] = 40;
    $fields['billing']['billing_phone']['required'] = true;
    $fields['billing']['billing_phone']['class'] = array('form-row-wide');
    $fields['billing']['billing_phone']['label'] = __('Telefon', 'thorius-checkout');
    $fields['billing']['billing_phone']['type'] = 'tel';
    $fields['billing']['billing_phone']['placeholder'] = '05XX XXX XX XX';
    $fields['billing']['billing_phone']['autocomplete'] = 'tel';

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
                stripos($message, 'adres') !== false ||
                stripos($message, 'vergi') !== false ||
                stripos($message, 'sirket') !== false ||
                stripos($message, 'company') !== false
            ) &&
            !preg_match('/(ad|soyad|e-posta|email|telefon|phone|first name|last name)/iu', $message)
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
        esc_html__('Sadece ad, soyad, e-posta ve telefon yeterlidir. Zorunlu alanlar * ile isaretlenmistir.', 'thorius-checkout') .
        '</p>';
}
add_action('woocommerce_before_checkout_billing_form', 'thorius_checkout_billing_required_note', 5);

/**
 * @param 'terms'|'privacy' $type
 */
function thorius_checkout_policy_url(string $type): string
{
    if ($type === 'terms') {
        $page_id = function_exists('wc_terms_and_conditions_page_id') ? (int) wc_terms_and_conditions_page_id() : 0;
        $fallback = THORIUS_CHECKOUT_TERMS_FALLBACK_URL;
    } else {
        $page_id = function_exists('wc_privacy_policy_page_id') ? (int) wc_privacy_policy_page_id() : 0;
        $fallback = THORIUS_CHECKOUT_PRIVACY_FALLBACK_URL;
    }

    if ($page_id > 0) {
        $url = get_permalink($page_id);
        if (is_string($url) && $url !== '') {
            return $url;
        }
    }

    return $fallback;
}

/**
 * Ayri gizlilik paragrafi yerine sartlar onay kutusunda birlestir.
 */
function thorius_checkout_remove_privacy_policy_text(): void
{
    remove_action('woocommerce_checkout_terms_and_conditions', 'wc_checkout_privacy_policy_text', 20);
}
add_action('woocommerce_init', 'thorius_checkout_remove_privacy_policy_text');

/**
 * Sartlar onay metni — cumle basi buyuk, geri kalan kucuk harf.
 */
function thorius_checkout_terms_checkbox_text(): string
{
    $terms_link = '<a href="' . esc_url(thorius_checkout_policy_url('terms')) .
        '" class="thorius-policy-link" target="_blank" rel="noopener noreferrer">şartlar ve koşullar</a>';
    $privacy_link = '<a href="' . esc_url(thorius_checkout_policy_url('privacy')) .
        '" class="thorius-policy-link" target="_blank" rel="noopener noreferrer">gizlilik ilkesi</a>';

    return sprintf(
        'Web sitesinin %1$s sayfasını okudum ve kabul ediyorum; kişisel verilerim sipariş işleme ve %2$s kapsamında kullanılacaktır.',
        $terms_link,
        $privacy_link
    );
}
add_filter('woocommerce_get_terms_and_conditions_checkbox_text', 'thorius_checkout_terms_checkbox_text');

/**
 * Fatura kutusunun altinda PayTR guven rozetı.
 */
function thorius_checkout_paytr_trust_badge(): void
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    $logo_url = THORIUS_CHECKOUT_URL . 'assets/paytr-logo.png';

    echo '<div class="thorius-paytr-trust">' .
        '<img src="' . esc_url($logo_url) . '" alt="PayTR" width="140" height="36" loading="lazy" decoding="async" />' .
        '<p>' . esc_html__('256-bit SSL ile güvenli ödeme · PayTR altyapısı', 'thorius-checkout') . '</p>' .
        '</div>';
}
add_action('woocommerce_after_checkout_billing_form', 'thorius_checkout_paytr_trust_badge', 18);

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
 * Dijital kurslarda adet her zaman 1.
 */
function thorius_checkout_limit_virtual_quantity($max, $product): int
{
    if (is_a($product, 'WC_Product') && $product->is_virtual()) {
        return 1;
    }

    return (int) $max;
}
add_filter('woocommerce_quantity_input_max', 'thorius_checkout_limit_virtual_quantity', 20, 2);
add_filter('woocommerce_quantity_input_min', static function ($min, $product) {
    if (is_a($product, 'WC_Product') && $product->is_virtual()) {
        return 1;
    }

    return $min;
}, 20, 2);

/**
 * Magaza sayfasi yerine Academy kurs listesine don.
 */
function thorius_checkout_catalog_url(): string
{
    return THORIUS_CHECKOUT_CATALOG_URL;
}
add_filter('woocommerce_return_to_shop_redirect', 'thorius_checkout_catalog_url');
add_filter('woocommerce_continue_shopping_redirect', 'thorius_checkout_catalog_url');

/**
 * Academy disi yonlendirmeler icin guvenli host listesi.
 *
 * @param list<string> $hosts
 * @return list<string>
 */
function thorius_checkout_allowed_redirect_hosts(array $hosts): array
{
    $hosts[] = 'academy.thorius.com.tr';

    return $hosts;
}
add_filter('allowed_redirect_hosts', 'thorius_checkout_allowed_redirect_hosts');

/**
 * PayTR / odeme sonrasi teşekkür sayfasinda Academy'ye yonlendir.
 */
function thorius_checkout_get_order_received_order(): ?WC_Order
{
    if (!function_exists('is_order_received_page') || !is_order_received_page()) {
        return null;
    }

    global $wp;
    $order_id = absint($wp->query_vars['order-received'] ?? 0);
    if ($order_id <= 0) {
        $order_id = absint(get_query_var('order-received'));
    }
    if ($order_id <= 0) {
        return null;
    }

    $order = wc_get_order($order_id);
    if (!$order instanceof WC_Order) {
        return null;
    }

    $order_key = isset($_GET['key']) ? wc_clean(wp_unslash($_GET['key'])) : '';
    if ($order_key === '' || !$order->key_is_valid($order_key)) {
        return null;
    }

    return $order;
}

function thorius_checkout_should_redirect_after_payment(WC_Order $order): bool
{
    return !$order->has_status(array('failed', 'cancelled', 'refunded'));
}

function thorius_checkout_redirect_order_received(): void
{
    if (is_admin() || wp_doing_ajax() || wp_doing_cron()) {
        return;
    }

    $order = thorius_checkout_get_order_received_order();
    if (!$order || !thorius_checkout_should_redirect_after_payment($order)) {
        return;
    }

    wp_safe_redirect(thorius_checkout_catalog_url());
    exit;
}
add_action('template_redirect', 'thorius_checkout_redirect_order_received', 15);

/**
 * Sunucu yonlendirmesi calismazsa (onbellek vb.) teşekkür sayfasinda yedek link + JS.
 */
function thorius_checkout_thankyou_redirect_fallback(int $order_id): void
{
    $order = wc_get_order($order_id);
    if (!$order instanceof WC_Order || !thorius_checkout_should_redirect_after_payment($order)) {
        return;
    }

    $catalog_url = thorius_checkout_catalog_url();
    $link = '<a href="' . esc_url($catalog_url) . '">' .
        esc_html__('Kurslara dön', 'thorius-checkout') .
        '</a>';

    echo '<p class="thorius-thankyou-redirect">' .
        sprintf(
            /* translators: %s: link to Academy course catalog */
            esc_html__('Ödemeniz alındı. Kurslarınıza yönlendiriliyorsunuz… %s', 'thorius-checkout'),
            $link
        ) .
        '</p>';

    echo '<script>window.setTimeout(function(){ window.location.href=' .
        wp_json_encode($catalog_url) .
        '; }, 1500);</script>';
}
add_action('woocommerce_thankyou', 'thorius_checkout_thankyou_redirect_fallback', 5);

/**
 * add-to-cart istegi magaza/urun sayfasina dusmesin; dogrudan odemeye git.
 */
function thorius_checkout_redirect_add_to_cart_to_checkout(): void
{
    if (is_admin() || wp_doing_ajax()) {
        return;
    }

    if (!isset($_GET['add-to-cart']) || $_GET['add-to-cart'] === '') {
        return;
    }

    if (function_exists('is_checkout') && is_checkout()) {
        return;
    }

    if (!function_exists('wc_get_checkout_url')) {
        return;
    }

    $checkout_url = wc_get_checkout_url();
    $query_string = isset($_SERVER['QUERY_STRING']) ? (string) $_SERVER['QUERY_STRING'] : '';
    if ($query_string !== '') {
        $checkout_url .= (strpos($checkout_url, '?') === false ? '?' : '&') . $query_string;
    }

    wp_safe_redirect($checkout_url);
    exit;
}
add_action('template_redirect', 'thorius_checkout_redirect_add_to_cart_to_checkout', 4);

/**
 * Sepete ekleme hatasinda Academy kurs listesine don.
 */
function thorius_checkout_cart_redirect_after_error(string $url): string
{
    return thorius_checkout_catalog_url();
}
add_filter('woocommerce_cart_redirect_after_error', 'thorius_checkout_cart_redirect_after_error', 20);

/**
 * "Magazaya geri don" metnini guncelle.
 */
function thorius_checkout_translate_shop_strings(string $translated, string $text, string $domain): string
{
    if ($domain !== 'woocommerce') {
        return $translated;
    }

    if ($text === 'Return to shop' || $text === 'Mağazaya geri dön') {
        return __('Kurslara dön', 'thorius-checkout');
    }

    if ($text === 'Proceed to checkout' || $translated === 'Ödeme sayfasına git') {
        return __('ÖDEME', 'thorius-checkout');
    }

    return $translated;
}
add_filter('gettext', 'thorius_checkout_translate_shop_strings', 20, 3);

/**
 * Urun zaten sepetteyse tekrar ekleme yerine yonlendir (bos sepet + uyari bug'ini onler).
 */
function thorius_checkout_redirect_if_already_in_cart(): void
{
    if (is_admin() || wp_doing_ajax()) {
        return;
    }

    if (!isset($_GET['add-to-cart']) || $_GET['add-to-cart'] === '') {
        return;
    }

    if (!function_exists('WC') || !WC()->cart) {
        return;
    }

    $product_id = absint(wp_unslash($_GET['add-to-cart']));
    if ($product_id <= 0) {
        return;
    }

    foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
        if ((int) ($cart_item['product_id'] ?? 0) !== $product_id) {
            continue;
        }

        WC()->cart->set_quantity($cart_item_key, 1, true);

        if (function_exists('is_cart') && is_cart() && function_exists('wc_get_cart_url')) {
            wp_safe_redirect(wc_get_cart_url());
            exit;
        }

        if (function_exists('wc_get_checkout_url')) {
            wp_safe_redirect(wc_get_checkout_url());
            exit;
        }

        return;
    }
}
add_action('template_redirect', 'thorius_checkout_redirect_if_already_in_cart', 5);

/**
 * Tekrar eklemede adeti 1'e sabitle.
 */
function thorius_checkout_force_single_quantity($quantity, int $product_id): int
{
    if (!function_exists('WC') || !WC()->cart) {
        return $quantity;
    }

    foreach (WC()->cart->get_cart() as $cart_item) {
        if ((int) ($cart_item['product_id'] ?? 0) === $product_id) {
            return 1;
        }
    }

    $product = function_exists('wc_get_product') ? wc_get_product($product_id) : null;
    if (is_a($product, 'WC_Product') && $product->is_virtual()) {
        return 1;
    }

    return $quantity;
}
add_filter('woocommerce_add_to_cart_quantity', 'thorius_checkout_force_single_quantity', 20, 2);

/**
 * Sepette dijital urun adedi duzenlenemez — her zaman 1.
 *
 * @param string $product_quantity
 * @param string $cart_item_key
 * @param array<string, mixed> $cart_item
 */
function thorius_checkout_cart_item_quantity(string $product_quantity, string $cart_item_key, array $cart_item): string
{
    $product = $cart_item['data'] ?? null;
    if (!is_a($product, 'WC_Product') || !$product->is_virtual()) {
        return $product_quantity;
    }

    return '<span class="thorius-cart-qty-fixed" aria-label="' .
        esc_attr__('Adet: 1', 'thorius-checkout') .
        '">1</span>';
}
add_filter('woocommerce_cart_item_quantity', 'thorius_checkout_cart_item_quantity', 20, 3);

/**
 * Form gonderiminde veya hesaplamada adeti 1'e sabitle.
 */
function thorius_checkout_normalize_cart_quantities($cart): void
{
    if (!is_a($cart, 'WC_Cart')) {
        return;
    }

    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
        $product = $cart_item['data'] ?? null;
        if (!is_a($product, 'WC_Product') || !$product->is_virtual()) {
            continue;
        }

        if ((int) ($cart_item['quantity'] ?? 0) !== 1) {
            $cart->set_quantity($cart_item_key, 1, false);
        }
    }
}
add_action('woocommerce_before_calculate_totals', 'thorius_checkout_normalize_cart_quantities', 1);

/**
 * Bos sepette kalan eski "zaten sepetinizde" uyarisini gizle.
 */
function thorius_checkout_filter_stale_duplicate_notices($notices): array
{
    if (!function_exists('WC') || !WC()->cart || !WC()->cart->is_empty()) {
        return $notices;
    }

    if (!is_array($notices)) {
        return $notices;
    }

    foreach ($notices as $type => $messages) {
        if (!is_array($messages)) {
            continue;
        }

        $notices[$type] = array_values(array_filter(
            $messages,
            static function ($message) {
                if (!is_string($message)) {
                    return true;
                }

                return stripos($message, 'zaten sepetinizde') === false;
            }
        ));
    }

    return $notices;
}
add_filter('woocommerce_get_notices', 'thorius_checkout_filter_stale_duplicate_notices', 20);

/**
 * Sepet sayfasindaki odeme butonu metni.
 */
function thorius_checkout_proceed_button_text(): string
{
    return __('ÖDEME', 'thorius-checkout');
}
add_filter('woocommerce_proceed_to_checkout_button_text', 'thorius_checkout_proceed_button_text');

/**
 * Fatura detaylari kutusunun altinda sepete donus butonu.
 */
function thorius_checkout_edit_cart_button(): void
{
    if (!function_exists('wc_get_cart_url') || !function_exists('WC') || !WC()->cart || WC()->cart->is_empty()) {
        return;
    }

    echo '<div class="thorius-edit-cart-wrap">' .
        '<a href="' . esc_url(wc_get_cart_url()) . '" class="thorius-edit-cart-btn">' .
        esc_html__('Sepeti güncelle', 'thorius-checkout') .
        '</a></div>';
}
add_action('woocommerce_after_checkout_billing_form', 'thorius_checkout_edit_cart_button', 15);

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
 * PayTR taksit aciklama metnini gosterme — yalnizca odeme yontemi etiketi kalsin.
 *
 * @param array<string, WC_Payment_Gateway> $gateways
 * @return array<string, WC_Payment_Gateway>
 */
function thorius_checkout_clear_paytr_description(array $gateways): array
{
    foreach ($gateways as $gateway_id => $gateway) {
        if (stripos((string) $gateway_id, 'paytr') === false) {
            continue;
        }

        if (is_object($gateway) && property_exists($gateway, 'description')) {
            $gateway->description = '';
        }
    }

    return $gateways;
}
add_filter('woocommerce_available_payment_gateways', 'thorius_checkout_clear_paytr_description', 20);

/**
 * Checkout CSS — kupon ikonu, PayTR metni, kompakt layout.
 */
function thorius_checkout_enqueue_assets(): void
{
    $is_checkout = function_exists('is_checkout') && is_checkout();
    $is_cart = function_exists('is_cart') && is_cart();

    if (!$is_checkout && !$is_cart) {
        return;
    }

    wp_enqueue_style(
        'thorius-checkout',
        THORIUS_CHECKOUT_URL . 'assets/checkout.css',
        array('woocommerce-layout', 'woocommerce-smallscreen', 'woocommerce-general'),
        THORIUS_CHECKOUT_VERSION
    );

    if ($is_checkout) {
        wp_enqueue_script(
            'thorius-checkout',
            THORIUS_CHECKOUT_URL . 'assets/checkout.js',
            array(),
            THORIUS_CHECKOUT_VERSION,
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'thorius_checkout_enqueue_assets', 99);
