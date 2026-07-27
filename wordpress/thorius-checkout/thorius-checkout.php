<?php
/**
 * Plugin Name: Thorius Checkout
 * Description: Dijital kurslar için sadeleştirilmiş WooCommerce ödeme sayfası.
 * Version: 1.9.3
 * Author: Thorius
 * Text Domain: thorius-checkout
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_CHECKOUT_VERSION', '1.9.3');
define('THORIUS_CHECKOUT_TERMS_FALLBACK_URL', 'https://academy.thorius.com.tr/kullanim-kosullari');
define('THORIUS_CHECKOUT_PRIVACY_FALLBACK_URL', 'https://academy.thorius.com.tr/gizlilik');
define('THORIUS_CHECKOUT_CATALOG_URL', 'https://academy.thorius.com.tr/kurslar');
define('THORIUS_CHECKOUT_THANKYOU_URL', 'https://academy.thorius.com.tr/tesekkurler');
define('THORIUS_CHECKOUT_KITAPLIK_MY_BOOKS_URL', 'https://kitaplik.thorius.com.tr/kitaplarim');
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
 * Sartlar kutusu her zaman gorunsun (Woo ayari kapali olsa bile).
 */
add_filter('woocommerce_checkout_show_terms', '__return_true');

/**
 * Odenecek tutar 0 olsa bile (%%100 kupon) ad / e-posta / telefon / sartlar zorunlu.
 * PayTR'ye eksik parametreyle dusmeyi engeller.
 */
function thorius_checkout_validate_customer_gate(): void
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    $first = isset($_POST['billing_first_name'])
        ? trim((string) wp_unslash($_POST['billing_first_name']))
        : '';
    $last = isset($_POST['billing_last_name'])
        ? trim((string) wp_unslash($_POST['billing_last_name']))
        : '';
    $email = isset($_POST['billing_email'])
        ? trim((string) wp_unslash($_POST['billing_email']))
        : '';
    $phone = isset($_POST['billing_phone'])
        ? trim((string) wp_unslash($_POST['billing_phone']))
        : '';

    if ($first === '') {
        wc_add_notice(__('Lütfen adınızı girin.', 'thorius-checkout'), 'error');
    }

    if ($last === '') {
        wc_add_notice(__('Lütfen soyadınızı girin.', 'thorius-checkout'), 'error');
    }

    if ($email === '') {
        wc_add_notice(__('Lütfen e-posta adresinizi girin.', 'thorius-checkout'), 'error');
    } elseif (!is_email($email)) {
        wc_add_notice(__('Lütfen geçerli bir e-posta adresi girin.', 'thorius-checkout'), 'error');
    }

    if ($phone === '') {
        wc_add_notice(__('Lütfen telefon numaranızı girin.', 'thorius-checkout'), 'error');
    }

    $termsAccepted = !empty($_POST['terms']) || !empty($_POST['legal']);
    if (!$termsAccepted) {
        wc_add_notice(
            __('Devam etmek için şartlar ve koşulları kabul etmelisiniz.', 'thorius-checkout'),
            'error'
        );
    }
}
add_action('woocommerce_checkout_process', 'thorius_checkout_validate_customer_gate', 5);

/**
 * Siparis olusurken e-posta yoksa hard-fail — webhook kitap yazamaz.
 * (%%100 kupon / bos form kacagini burada keser.)
 */
function thorius_checkout_abort_order_without_email($order, array $data): void
{
    if (!is_a($order, 'WC_Order')) {
        return;
    }

    $email = trim((string) $order->get_billing_email());
    if ($email === '' && isset($data['billing_email'])) {
        $email = trim((string) $data['billing_email']);
    }

    if ($email === '' || !is_email($email)) {
        throw new Exception(
            __('Sipariş oluşturulamadı: geçerli bir e-posta adresi zorunludur. Lütfen fatura bilgilerinizi doldurun.', 'thorius-checkout')
        );
    }

    $first = trim((string) $order->get_billing_first_name());
    $last = trim((string) $order->get_billing_last_name());
    if ($first === '' || $last === '') {
        throw new Exception(
            __('Sipariş oluşturulamadı: ad ve soyad zorunludur.', 'thorius-checkout')
        );
    }
}
add_action('woocommerce_checkout_create_order', 'thorius_checkout_abort_order_without_email', 5, 2);

/**
 * Query string billing bilgisini WC customer oturumuna yaz (kupon AJAX sonrasi kaybolmasin).
 */
function thorius_checkout_persist_query_billing_to_customer(): void
{
    if (!function_exists('is_checkout') || !is_checkout() || !function_exists('WC') || !WC()->customer) {
        return;
    }

    $map = array(
        'billing_email' => 'set_billing_email',
        'billing_first_name' => 'set_billing_first_name',
        'billing_last_name' => 'set_billing_last_name',
        'billing_phone' => 'set_billing_phone',
    );

    $customer = WC()->customer;
    foreach ($map as $queryKey => $setter) {
        if (!isset($_GET[$queryKey]) || $_GET[$queryKey] === '') {
            continue;
        }
        if (!method_exists($customer, $setter)) {
            continue;
        }
        $value = sanitize_text_field(wp_unslash((string) $_GET[$queryKey]));
        if ($value === '') {
            continue;
        }
        $customer->$setter($value);
    }
}
add_action('woocommerce_checkout_init', 'thorius_checkout_persist_query_billing_to_customer', 6);

/**
 * Guven rozetleri HTML (PayTR + kart aglari).
 */
function thorius_checkout_payment_trust_markup(string $context = 'billing'): string
{
    $assets = THORIUS_CHECKOUT_URL . 'assets/';
    $logos = [
        ['src' => $assets . 'paytr-logo.svg', 'alt' => 'PayTR', 'class' => 'thorius-trust-logo--paytr'],
        ['src' => $assets . 'visa.svg', 'alt' => 'Visa', 'class' => ''],
        ['src' => $assets . 'mastercard.svg', 'alt' => 'Mastercard', 'class' => ''],
        ['src' => $assets . 'troy.svg', 'alt' => 'Troy', 'class' => ''],
    ];

    $logo_html = '';
    foreach ($logos as $logo) {
        $class = trim('thorius-trust-logo ' . ($logo['class'] ?? ''));
        $logo_html .= '<img src="' . esc_url($logo['src']) . '" alt="' . esc_attr($logo['alt']) .
            '" class="' . esc_attr($class) . '" loading="lazy" decoding="async" />';
    }

    $note = $context === 'sidebar'
        ? esc_html__('256-bit SSL · 3D Secure · PayTR altyapısı', 'thorius-checkout')
        : esc_html__('256-bit SSL ile güvenli ödeme · Visa, Mastercard, Troy · PayTR altyapısı', 'thorius-checkout');

    return '<div class="thorius-payment-trust thorius-payment-trust--' . esc_attr($context) . '">' .
        '<p class="thorius-payment-trust__title">' . esc_html__('Güvenli ödeme', 'thorius-checkout') . '</p>' .
        '<div class="thorius-payment-trust__logos" aria-hidden="true">' . $logo_html . '</div>' .
        '<p class="thorius-payment-trust__note">' . $note . '</p>' .
        '</div>';
}

/**
 * Fatura kutusunun altinda odeme guven rozetleri.
 */
function thorius_checkout_paytr_trust_badge(): void
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    echo thorius_checkout_payment_trust_markup('billing');
}
add_action('woocommerce_after_checkout_billing_form', 'thorius_checkout_paytr_trust_badge', 18);

/**
 * Siparis ozeti panelinde odeme butonunun altinda guven rozetleri.
 */
function thorius_checkout_sidebar_trust_badge(): void
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    echo thorius_checkout_payment_trust_markup('sidebar');
}
add_action('woocommerce_review_order_after_payment', 'thorius_checkout_sidebar_trust_badge', 20);

/**
 * Siparis ozeti — fiyat yaninda KDV Dahil notu.
 */
function thorius_checkout_vat_included_markup(): string
{
    return ' <span class="thorius-vat-note">' .
        esc_html__('KDV Dahil', 'thorius-checkout') .
        '</span>';
}

function thorius_checkout_is_checkout_context(): bool
{
    return function_exists('is_checkout') && is_checkout() && !is_wc_endpoint_url('order-received');
}

/**
 * @param string $subtotal
 * @param array<string, mixed> $cart_item
 */
function thorius_checkout_cart_item_subtotal_vat_note(
    string $subtotal,
    array $cart_item,
    string $cart_item_key,
): string {
    unset($cart_item, $cart_item_key);

    if (!thorius_checkout_is_checkout_context()) {
        return $subtotal;
    }

    return $subtotal . thorius_checkout_vat_included_markup();
}
add_filter('woocommerce_cart_item_subtotal', 'thorius_checkout_cart_item_subtotal_vat_note', 20, 3);

function thorius_checkout_order_total_vat_note(string $value): string
{
    if (!thorius_checkout_is_checkout_context()) {
        return $value;
    }

    return $value . thorius_checkout_vat_included_markup();
}
add_filter('woocommerce_cart_totals_order_total_html', 'thorius_checkout_order_total_vat_note', 20);

/**
 * Siparis ozeti toplam satiri basligi.
 *
 * @param string $translated
 * @param string $text
 * @param string $domain
 */
function thorius_checkout_translate_total_label(
    string $translated,
    string $text,
    string $domain,
): string {
    if ($domain !== 'woocommerce') {
        return $translated;
    }

    if ($text === 'Total' || $translated === 'Toplam') {
        return __('Toplam', 'thorius-checkout');
    }

    return $translated;
}
add_filter('gettext', 'thorius_checkout_translate_total_label', 25, 3);

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
 * Magaza sayfasi yerine Academy kurs listesine don (varsayilan).
 */
function thorius_checkout_catalog_url(): string
{
    return THORIUS_CHECKOUT_CATALOG_URL;
}

/**
 * @return list<string>
 */
function thorius_checkout_allowed_return_hosts(): array
{
    $hosts = array(
        'academy.thorius.com.tr',
        'kitaplik.thorius.com.tr',
        'shop.thorius.com.tr',
        'thorius.com.tr',
        'www.thorius.com.tr',
        'localhost',
        '127.0.0.1',
    );

    return apply_filters('thorius_checkout_allowed_return_hosts', $hosts);
}

function thorius_checkout_is_allowed_return_url(string $url): bool
{
    $parts = wp_parse_url($url);
    if (!is_array($parts) || empty($parts['host']) || empty($parts['scheme'])) {
        return false;
    }

    if (!in_array($parts['scheme'], array('https', 'http'), true)) {
        return false;
    }

    $host = strtolower((string) $parts['host']);
    foreach (thorius_checkout_allowed_return_hosts() as $allowed) {
        if ($host === strtolower($allowed)) {
            return true;
        }
    }

    return false;
}

/**
 * Kitaplik WC urun ID'leri — siparis yalnizca bunlardan olusuyorsa Kitaplarim'a don.
 *
 * @return list<int>
 */
function thorius_checkout_library_product_ids(): array
{
    // Kitaplik basili + e-kitap WC urunleri (guncel tutun / filter ile genisletin)
    // 9046 = aurora (TR e-kitap), 9055 = aurora-en (EN e-kitap)
    $ids = array(8978, 8980, 9046, 9055);

    return array_values(array_unique(array_filter(array_map(
        'absint',
        apply_filters('thorius_checkout_library_product_ids', $ids)
    ))));
}

function thorius_checkout_store_return_url_from_request(): void
{
    if (is_admin() || wp_doing_ajax()) {
        return;
    }

    if (!isset($_GET['thorius_return']) || $_GET['thorius_return'] === '') {
        return;
    }

    if (!function_exists('WC') || !WC()->session) {
        return;
    }

    $candidate = esc_url_raw(wp_unslash((string) $_GET['thorius_return']));
    if ($candidate === '' || !thorius_checkout_is_allowed_return_url($candidate)) {
        return;
    }

    WC()->session->set('thorius_return_url', $candidate);
}
add_action('template_redirect', 'thorius_checkout_store_return_url_from_request', 3);

/**
 * PayTR / 3DS sonrasi session kaybolabiliyor — return URL'yi siparise yaz.
 */
function thorius_checkout_persist_return_url_on_order(WC_Order $order): void
{
    if (!function_exists('WC') || !WC()->session) {
        return;
    }

    $candidate = WC()->session->get('thorius_return_url');
    if (!is_string($candidate) || $candidate === '') {
        return;
    }

    if (!thorius_checkout_is_allowed_return_url($candidate)) {
        return;
    }

    $order->update_meta_data('_thorius_return_url', $candidate);
}
add_action('woocommerce_checkout_create_order', 'thorius_checkout_persist_return_url_on_order', 20);

function thorius_checkout_order_return_url(WC_Order $order): ?string
{
    $stored = $order->get_meta('_thorius_return_url', true);
    if (is_string($stored) && $stored !== '' && thorius_checkout_is_allowed_return_url($stored)) {
        return $stored;
    }

    return null;
}

function thorius_checkout_order_contains_only_library_products(WC_Order $order): bool
{
    $library_ids = thorius_checkout_library_product_ids();
    if ($library_ids === array()) {
        return false;
    }

    $line_items = $order->get_items();
    if ($line_items === array()) {
        return false;
    }

    foreach ($line_items as $item) {
        if (!($item instanceof WC_Order_Item_Product)) {
            return false;
        }

        $product_id = absint($item->get_product_id());
        if ($product_id <= 0 || !in_array($product_id, $library_ids, true)) {
            return false;
        }
    }

    return true;
}

function thorius_checkout_order_looks_like_kitaplik(WC_Order $order): bool
{
    if (thorius_checkout_order_contains_only_library_products($order)) {
        return true;
    }

    $order_return = thorius_checkout_order_return_url($order);
    if (is_string($order_return) && strpos($order_return, 'kitaplik.thorius.com.tr') !== false) {
        return true;
    }

    if (is_string($order_return) && strpos($order_return, '/kitaplarim') !== false) {
        return true;
    }

    return false;
}

function thorius_checkout_destination_after_thankyou(
    ?WC_Order $order = null,
    ?string $stored_return = null
): string {
    if (
        is_string($stored_return)
        && $stored_return !== ''
        && thorius_checkout_is_allowed_return_url($stored_return)
        && strpos($stored_return, '/tesekkurler') === false
    ) {
        return $stored_return;
    }

    if ($order instanceof WC_Order) {
        $order_return = thorius_checkout_order_return_url($order);
        if (is_string($order_return) && strpos($order_return, '/tesekkurler') === false) {
            return $order_return;
        }

        if (thorius_checkout_order_looks_like_kitaplik($order)) {
            return THORIUS_CHECKOUT_KITAPLIK_MY_BOOKS_URL;
        }
    }

    return thorius_checkout_catalog_url();
}

/**
 * Academy /tesekkurler with purchase params for GA4/Meta Purchase.
 */
function thorius_checkout_build_thankyou_url(WC_Order $order, string $next_url): string
{
    $base = apply_filters('thorius_checkout_thankyou_url', THORIUS_CHECKOUT_THANKYOU_URL);

    $product_ids = array();
    $names = array();
    foreach ($order->get_items() as $item) {
        if (!($item instanceof WC_Order_Item_Product)) {
            continue;
        }
        $product_id = absint($item->get_product_id());
        if ($product_id > 0) {
            $product_ids[] = (string) $product_id;
        }
        $name = trim((string) $item->get_name());
        if ($name !== '') {
            $names[] = $name;
        }
    }

    $args = array(
        'order_id' => (string) $order->get_id(),
        'value' => (string) $order->get_total(),
        'currency' => $order->get_currency() ? (string) $order->get_currency() : 'TRY',
    );

    if ($product_ids !== array()) {
        $args['content_ids'] = implode(',', $product_ids);
    }
    if ($names !== array()) {
        $args['content_name'] = $names[0];
    }
    if ($next_url !== '' && thorius_checkout_is_allowed_return_url($next_url)) {
        $args['next'] = $next_url;
    }

    return add_query_arg($args, $base);
}

/**
 * @return string Absolute post-payment URL (Academy thank-you with conversion params).
 */
function thorius_checkout_post_payment_url(?WC_Order $order = null): string
{
    static $cache = array();

    $cache_key = $order instanceof WC_Order ? (string) $order->get_id() : '0';
    if (isset($cache[$cache_key])) {
        return $cache[$cache_key];
    }

    $stored = null;
    if (function_exists('WC') && WC()->session) {
        $candidate = WC()->session->get('thorius_return_url');
        if (is_string($candidate) && $candidate !== '') {
            $stored = $candidate;
            WC()->session->__unset('thorius_return_url');
        }
    }

    $next = thorius_checkout_destination_after_thankyou($order, $stored);

    if ($order instanceof WC_Order) {
        $url = thorius_checkout_build_thankyou_url($order, $next);
        $cache[$cache_key] = $url;
        return $url;
    }

    $cache[$cache_key] = $next;
    return $next;
}

function thorius_checkout_post_payment_link_label(?WC_Order $order = null): string
{
    $next = '';
    if ($order instanceof WC_Order) {
        $thankyou = thorius_checkout_post_payment_url($order);
        $parts = wp_parse_url($thankyou);
        if (is_array($parts) && !empty($parts['query'])) {
            parse_str((string) $parts['query'], $query);
            if (!empty($query['next']) && is_string($query['next'])) {
                $next = $query['next'];
            }
        }
    }

    if ($next !== '' && strpos($next, 'kitaplik.thorius.com.tr') !== false) {
        return __('Kitaplarıma dön', 'thorius-checkout');
    }

    return __('Panele dön', 'thorius-checkout');
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
    foreach (thorius_checkout_allowed_return_hosts() as $host) {
        $hosts[] = $host;
    }

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

    wp_safe_redirect(thorius_checkout_post_payment_url($order));
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

    $catalog_url = thorius_checkout_post_payment_url($order);
    $link_label = thorius_checkout_post_payment_link_label($order);
    $link = '<a href="' . esc_url($catalog_url) . '">' .
        esc_html($link_label) .
        '</a>';

    $message = __('Ödemeniz alındı. Onay sayfasına yönlendiriliyorsunuz… %s', 'thorius-checkout');

    echo '<p class="thorius-thankyou-redirect">' .
        sprintf(
            /* translators: %s: link to post-payment destination */
            esc_html($message),
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
            array('jquery', 'wc-checkout'),
            THORIUS_CHECKOUT_VERSION,
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'thorius_checkout_enqueue_assets', 99);

/**
 * Conversion tracking on checkout/cart (WP domain).
 * Define in wp-config.php (do not hardcode secrets in the plugin):
 *   define('THORIUS_GA_ID', 'G-XXXXXXXXXX');
 *   define('THORIUS_META_PIXEL_ID', '123456789012345');
 */
function thorius_checkout_tracking_ids(): array
{
    $ga = defined('THORIUS_GA_ID') ? trim((string) THORIUS_GA_ID) : '';
    $pixel = defined('THORIUS_META_PIXEL_ID') ? trim((string) THORIUS_META_PIXEL_ID) : '';

    /**
     * @param array{ga:string,pixel:string} $ids
     */
    return apply_filters('thorius_checkout_tracking_ids', array(
        'ga' => $ga,
        'pixel' => $pixel,
    ));
}

function thorius_checkout_print_tracking_scripts(): void
{
    if (!function_exists('is_checkout') || !is_checkout()) {
        return;
    }

    $ids = thorius_checkout_tracking_ids();
    $ga = isset($ids['ga']) ? (string) $ids['ga'] : '';
    $pixel = isset($ids['pixel']) ? (string) $ids['pixel'] : '';

    if ($ga === '' && $pixel === '') {
        return;
    }

    if ($ga !== '') {
        $ga_js = esc_js($ga);
        echo "\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=" . esc_attr($ga) . "\"></script>\n";
        echo "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','{$ga_js}');</script>\n";
    }

    if ($pixel !== '') {
        $pixel_js = esc_js($pixel);
        echo "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','{$pixel_js}');fbq('track','PageView');</script>\n";
    }
}
add_action('wp_head', 'thorius_checkout_print_tracking_scripts', 5);
