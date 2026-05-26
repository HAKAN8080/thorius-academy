<?php
/**
 * Plugin Name: Thorius Academy Sync
 * Description: Kurs yayınlandığında veya güncellendiğinde academy.thorius.com.tr önbelleğini anında yeniler.
 * Version: 1.3.0
 * Author: Thorius
 * Text Domain: thorius-academy-sync
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_ACADEMY_SYNC_VERSION', '1.3.0');
define('THORIUS_ACADEMY_SYNC_OPTION', 'thorius_academy_sync_settings');

/**
 * @return array{webhook_url: string, webhook_secret: string, enabled: bool}
 */
function thorius_academy_sync_get_settings(): array
{
    $defaults = array(
        'webhook_url' => 'https://academy.thorius.com.tr/api/webhooks/wordpress',
        'webhook_secret' => '',
        'enabled' => false,
    );

    $saved = get_option(THORIUS_ACADEMY_SYNC_OPTION, array());
    if (!is_array($saved)) {
        $saved = array();
    }

    return array_merge($defaults, $saved);
}

function thorius_academy_sync_register_settings(): void
{
    register_setting(
        'thorius_academy_sync',
        THORIUS_ACADEMY_SYNC_OPTION,
        array(
            'type' => 'array',
            'sanitize_callback' => 'thorius_academy_sync_sanitize_settings',
            'default' => array(),
        )
    );
}
add_action('admin_init', 'thorius_academy_sync_register_settings');

/**
 * @param mixed $input
 * @return array{webhook_url: string, webhook_secret: string, enabled: bool}
 */
function thorius_academy_sync_sanitize_settings($input): array
{
    if (!is_array($input)) {
        $input = array();
    }

    return array(
        'webhook_url' => esc_url_raw(
            $input['webhook_url'] ?? 'https://academy.thorius.com.tr/api/webhooks/wordpress'
        ),
        'webhook_secret' => sanitize_text_field($input['webhook_secret'] ?? ''),
        'enabled' => !empty($input['enabled']),
    );
}

function thorius_academy_sync_add_settings_page(): void
{
    add_options_page(
        __('Thorius Academy Sync', 'thorius-academy-sync'),
        __('Thorius Academy Sync', 'thorius-academy-sync'),
        'manage_options',
        'thorius-academy-sync',
        'thorius_academy_sync_render_settings_page'
    );
}
add_action('admin_menu', 'thorius_academy_sync_add_settings_page');

function thorius_academy_sync_plugin_action_links(array $links): array
{
    $settings_link = sprintf(
        '<a href="%s">%s</a>',
        esc_url(admin_url('options-general.php?page=thorius-academy-sync')),
        esc_html__('Ayarlar', 'thorius-academy-sync')
    );

    array_unshift($links, $settings_link);

    return $links;
}
add_filter(
    'plugin_action_links_' . plugin_basename(__FILE__),
    'thorius_academy_sync_plugin_action_links'
);

function thorius_academy_sync_activation_notice(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    if (!get_transient('thorius_academy_sync_activation_notice')) {
        return;
    }

    delete_transient('thorius_academy_sync_activation_notice');

    $settings_url = admin_url('options-general.php?page=thorius-academy-sync');
    ?>
    <div class="notice notice-success is-dismissible">
        <p>
            <?php
            printf(
                wp_kses(
                    __('Thorius Academy Sync etkinleştirildi. <a href="%s">Ayarlar → Thorius Academy Sync</a> sayfasından webhook bilgilerini girin.', 'thorius-academy-sync'),
                    array('a' => array('href' => array()))
                ),
                esc_url($settings_url)
            );
            ?>
        </p>
    </div>
    <?php
}
add_action('admin_notices', 'thorius_academy_sync_activation_notice');

function thorius_academy_sync_on_activate(): void
{
    set_transient('thorius_academy_sync_activation_notice', 1, 60);
}
register_activation_hook(__FILE__, 'thorius_academy_sync_on_activate');

function thorius_academy_sync_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    $settings = thorius_academy_sync_get_settings();
    $test_result = null;

    if (
        isset($_POST['thorius_academy_sync_test']) &&
        check_admin_referer('thorius_academy_sync_test')
    ) {
        $test_result = thorius_academy_sync_run_test($settings);
    }
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Thorius Academy Sync', 'thorius-academy-sync'); ?></h1>
        <p><?php esc_html_e('Kurs yayınlandığında academy.thorius.com.tr sitesinin önbelleğini anında yeniler.', 'thorius-academy-sync'); ?></p>

        <?php if (is_array($test_result)) : ?>
            <div class="notice <?php echo $test_result['success'] ? 'notice-success' : 'notice-error'; ?>">
                <p><?php echo esc_html($test_result['message']); ?></p>
            </div>
        <?php endif; ?>

        <form method="post" action="options.php">
            <?php settings_fields('thorius_academy_sync'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="thorius_academy_sync_enabled"><?php esc_html_e('Etkin', 'thorius-academy-sync'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="thorius_academy_sync_enabled" name="<?php echo esc_attr(THORIUS_ACADEMY_SYNC_OPTION); ?>[enabled]" value="1" <?php checked($settings['enabled']); ?> />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="thorius_academy_sync_webhook_url"><?php esc_html_e('Webhook URL', 'thorius-academy-sync'); ?></label>
                    </th>
                    <td>
                        <input type="url" class="regular-text code" id="thorius_academy_sync_webhook_url" name="<?php echo esc_attr(THORIUS_ACADEMY_SYNC_OPTION); ?>[webhook_url]" value="<?php echo esc_attr($settings['webhook_url']); ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="thorius_academy_sync_webhook_secret"><?php esc_html_e('Webhook Secret', 'thorius-academy-sync'); ?></label>
                    </th>
                    <td>
                        <input type="password" class="regular-text code" id="thorius_academy_sync_webhook_secret" name="<?php echo esc_attr(THORIUS_ACADEMY_SYNC_OPTION); ?>[webhook_secret]" value="<?php echo esc_attr($settings['webhook_secret']); ?>" autocomplete="new-password" />
                        <p class="description"><?php esc_html_e('Academy tarafındaki WP_WEBHOOK_SECRET ile aynı olmalıdır.', 'thorius-academy-sync'); ?></p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

        <hr />

        <h2><?php esc_html_e('Bağlantı Testi', 'thorius-academy-sync'); ?></h2>
        <p><?php esc_html_e('Academy webhook endpoint\'ine test isteği gönderir. Önce ayarları kaydedin.', 'thorius-academy-sync'); ?></p>
        <form method="post">
            <?php wp_nonce_field('thorius_academy_sync_test'); ?>
            <?php submit_button(__('Webhook Bağlantısını Test Et', 'thorius-academy-sync'), 'secondary', 'thorius_academy_sync_test', false); ?>
        </form>
    </div>
    <?php
}

/**
 * @param array{webhook_url: string, webhook_secret: string, enabled: bool} $settings
 * @return array{success: bool, message: string}
 */
function thorius_academy_sync_run_test(array $settings): array
{
    if (empty($settings['webhook_url']) || empty($settings['webhook_secret'])) {
        return array(
            'success' => false,
            'message' => __('Webhook URL ve Secret kaydedilmeli.', 'thorius-academy-sync'),
        );
    }

    $get_response = wp_remote_get($settings['webhook_url'], array('timeout' => 8));

    if (is_wp_error($get_response)) {
        return array(
            'success' => false,
            'message' => sprintf(
                __('Bağlantı hatası: %s', 'thorius-academy-sync'),
                $get_response->get_error_message()
            ),
        );
    }

    $get_status = (int) wp_remote_retrieve_response_code($get_response);
    if ($get_status === 404) {
        return array(
            'success' => false,
            'message' => __('404 — Academy endpoint bulunamadı.', 'thorius-academy-sync'),
        );
    }

    if ($get_status < 200 || $get_status >= 300) {
        return array(
            'success' => false,
            'message' => sprintf(
                __('GET HTTP %1$d — %2$s', 'thorius-academy-sync'),
                $get_status,
                wp_strip_all_tags(wp_remote_retrieve_body($get_response))
            ),
        );
    }

    $payload = wp_json_encode(array(
        'event' => 'course.updated',
        'course' => array(
            'id' => 0,
            'slug' => 'webhook-test',
            'status' => 'publish',
            'title' => 'Webhook Test',
        ),
        'timestamp' => gmdate('c'),
    ));

    if (!is_string($payload)) {
        return array(
            'success' => false,
            'message' => __('Test payload oluşturulamadı.', 'thorius-academy-sync'),
        );
    }

    $signature = base64_encode(hash_hmac('sha256', $payload, $settings['webhook_secret'], true));

    $post_response = wp_remote_post($settings['webhook_url'], array(
        'timeout' => 8,
        'blocking' => true,
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-WP-Webhook-Signature' => $signature,
        ),
        'body' => $payload,
    ));

    if (is_wp_error($post_response)) {
        return array(
            'success' => false,
            'message' => sprintf(
                __('POST hatası: %s', 'thorius-academy-sync'),
                $post_response->get_error_message()
            ),
        );
    }

    $post_status = (int) wp_remote_retrieve_response_code($post_response);
    $post_body = wp_remote_retrieve_body($post_response);

    if ($post_status === 401) {
        return array(
            'success' => false,
            'message' => __('401 — Secret uyuşmuyor. Vercel WP_WEBHOOK_SECRET ile WordPress secret aynı olmalı.', 'thorius-academy-sync'),
        );
    }

    if ($post_status < 200 || $post_status >= 300) {
        return array(
            'success' => false,
            'message' => sprintf(
                __('POST HTTP %1$d — %2$s', 'thorius-academy-sync'),
                $post_status,
                wp_strip_all_tags($post_body)
            ),
        );
    }

    return array(
        'success' => true,
        'message' => sprintf(
            __('Bağlantı ve secret doğrulandı (POST 200): %s', 'thorius-academy-sync'),
            wp_strip_all_tags($post_body)
        ),
    );
}

function thorius_academy_sync_is_course_post($post): bool
{
    return is_object($post) && isset($post->post_type) && $post->post_type === 'courses';
}

/**
 * @return 'course.published'|'course.updated'|'course.unpublished'|'course.deleted'
 */
function thorius_academy_sync_resolve_event(string $post_status, bool $is_update, string $context = 'save'): string
{
    if ($context === 'delete') {
        return 'course.deleted';
    }

    if ($context === 'trash') {
        return 'course.unpublished';
    }

    if ($post_status === 'publish') {
        return $is_update ? 'course.updated' : 'course.published';
    }

    return 'course.unpublished';
}

function thorius_academy_sync_get_wc_product_id(int $post_id): int
{
    $product_id = get_post_meta($post_id, '_tutor_course_product_id', true);

    if (is_array($product_id)) {
        $product_id = $product_id[0] ?? 0;
    }

    return (int) $product_id;
}

/**
 * @return int[]
 */
function thorius_academy_sync_find_course_ids_by_product_id(int $product_id): array
{
    if ($product_id <= 0) {
        return array();
    }

    $course_types = post_type_exists('courses') ? array('courses') : array('tutor_course');
    $course_ids = get_posts(array(
        'post_type' => $course_types,
        'post_status' => 'any',
        'fields' => 'ids',
        'posts_per_page' => -1,
        'meta_key' => '_tutor_course_product_id',
        'meta_value' => (string) $product_id,
    ));

    if ($course_ids !== array()) {
        return array_map('intval', $course_ids);
    }

    return array_map(
        'intval',
        get_posts(array(
            'post_type' => $course_types,
            'post_status' => 'any',
            'fields' => 'ids',
            'posts_per_page' => -1,
            'meta_key' => '_tutor_course_product_id',
            'meta_value' => $product_id,
        ))
    );
}

function thorius_academy_sync_on_wc_product_saved(int $product_id): void
{
    if (!function_exists('wc_get_product') || wp_is_post_revision($product_id)) {
        return;
    }

    $product = wc_get_product($product_id);
    if (!$product) {
        return;
    }

    foreach (thorius_academy_sync_find_course_ids_by_product_id($product_id) as $course_id) {
        thorius_academy_sync_queue_webhook($course_id, 'course.updated');
    }
}
add_action('woocommerce_update_product', 'thorius_academy_sync_on_wc_product_saved', 20, 1);
add_action('woocommerce_new_product', 'thorius_academy_sync_on_wc_product_saved', 20, 1);

/**
 * @return array<string, mixed>
 */
function thorius_academy_sync_build_course_payload(WP_Post $post, ?string $previous_slug = null): array
{
    $course = array(
        'id' => (int) $post->ID,
        'slug' => (string) $post->post_name,
        'status' => (string) $post->post_status,
        'title' => (string) get_the_title($post),
    );

    if (
        is_string($previous_slug) &&
        $previous_slug !== '' &&
        $previous_slug !== $course['slug']
    ) {
        $course['previous_slug'] = $previous_slug;
    }

    $product_id = thorius_academy_sync_get_wc_product_id($post->ID);

    if ($product_id > 0 && function_exists('wc_get_product')) {
        $product = wc_get_product($product_id);

        if ($product) {
            $course['wc_product_id'] = $product_id;
            $course['price_normal'] = $product->get_regular_price() !== ''
                ? (float) $product->get_regular_price()
                : (float) $product->get_price();
            $course['price_sale'] = $product->get_sale_price() !== ''
                ? (float) $product->get_sale_price()
                : null;
        }
    }

    return $course;
}

function thorius_academy_sync_send_webhook(int $post_id, string $event, ?string $previous_slug = null): void
{
    $settings = thorius_academy_sync_get_settings();

    if (empty($settings['enabled']) || empty($settings['webhook_url']) || empty($settings['webhook_secret'])) {
        return;
    }

    $post = get_post($post_id);
    if (!$post || !thorius_academy_sync_is_course_post($post)) {
        return;
    }

    $course = thorius_academy_sync_build_course_payload($post, $previous_slug);

    $payload = wp_json_encode(array(
        'event' => $event,
        'course' => $course,
        'timestamp' => gmdate('c'),
    ));

    if (!is_string($payload)) {
        return;
    }

    $signature = base64_encode(hash_hmac('sha256', $payload, $settings['webhook_secret'], true));

    $response = wp_remote_post($settings['webhook_url'], array(
        'timeout' => 8,
        'blocking' => true,
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-WP-Webhook-Signature' => $signature,
        ),
        'body' => $payload,
    ));

    if (is_wp_error($response)) {
        error_log('[Thorius Academy Sync] Webhook failed: ' . $response->get_error_message());
        return;
    }

    $status_code = (int) wp_remote_retrieve_response_code($response);
    if ($status_code < 200 || $status_code >= 300) {
        error_log('[Thorius Academy Sync] Webhook HTTP ' . $status_code . ': ' . wp_remote_retrieve_body($response));
    }
}

function thorius_academy_sync_queue_webhook(int $post_id, string $event, ?string $previous_slug = null): void
{
    if (!isset($GLOBALS['thorius_academy_sync_queue'])) {
        $GLOBALS['thorius_academy_sync_queue'] = array();
    }

    $GLOBALS['thorius_academy_sync_queue'][$post_id] = array(
        'event' => $event,
        'previous_slug' => $previous_slug,
    );

    if (!has_action('shutdown', 'thorius_academy_sync_flush_queue')) {
        add_action('shutdown', 'thorius_academy_sync_flush_queue', 999);
    }
}

function thorius_academy_sync_flush_queue(): void
{
    if (empty($GLOBALS['thorius_academy_sync_queue']) || !is_array($GLOBALS['thorius_academy_sync_queue'])) {
        return;
    }

    foreach ($GLOBALS['thorius_academy_sync_queue'] as $post_id => $data) {
        thorius_academy_sync_send_webhook(
            (int) $post_id,
            (string) $data['event'],
            $data['previous_slug'] ?? null
        );
    }

    $GLOBALS['thorius_academy_sync_queue'] = array();
}

function thorius_academy_sync_store_previous_slug(int $post_id, array $data): void
{
    if (($data['post_type'] ?? '') !== 'courses') {
        return;
    }

    $post = get_post($post_id);
    if (!$post) {
        return;
    }

    set_transient(
        'thorius_academy_prev_slug_' . $post_id,
        $post->post_name,
        MINUTE_IN_SECONDS
    );
}
add_action('pre_post_update', 'thorius_academy_sync_store_previous_slug', 10, 2);

function thorius_academy_sync_get_stored_previous_slug(int $post_id): ?string
{
    $slug = get_transient('thorius_academy_prev_slug_' . $post_id);
    delete_transient('thorius_academy_prev_slug_' . $post_id);

    if (!is_string($slug) || $slug === '') {
        return null;
    }

    return $slug;
}

function thorius_academy_sync_handle_course_save(
    int $post_id,
    bool $update = true,
    ?string $previous_slug = null
): void {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }

    $post = get_post($post_id);
    if (!$post || !thorius_academy_sync_is_course_post($post)) {
        return;
    }

    if (in_array($post->post_status, array('auto-draft', 'inherit'), true)) {
        return;
    }

    if (!$previous_slug) {
        $previous_slug = thorius_academy_sync_get_stored_previous_slug($post_id);
    }

    $event = thorius_academy_sync_resolve_event($post->post_status, $update, 'save');
    thorius_academy_sync_queue_webhook($post_id, $event, $previous_slug);
}

function thorius_academy_sync_after_insert(int $post_id, WP_Post $post, bool $update, ?WP_Post $post_before): void
{
    $previous_slug = null;
    if ($post_before instanceof WP_Post && $post_before->post_name !== $post->post_name) {
        $previous_slug = $post_before->post_name;
    }

    thorius_academy_sync_handle_course_save($post_id, $update, $previous_slug);
}
add_action('wp_after_insert_post', 'thorius_academy_sync_after_insert', 20, 4);

function thorius_academy_sync_on_tutor_save(int $post_id, WP_Post $post): void
{
    if (!thorius_academy_sync_is_course_post($post)) {
        return;
    }

    thorius_academy_sync_handle_course_save($post_id, true);
}
add_action('tutor_save_course_after', 'thorius_academy_sync_on_tutor_save', 99, 2);
add_action('tutor_save_course', 'thorius_academy_sync_on_tutor_save', 99, 2);

function thorius_academy_sync_on_save_post(int $post_id, WP_Post $post, bool $update): void
{
    thorius_academy_sync_handle_course_save($post_id, $update);
}
add_action('save_post_courses', 'thorius_academy_sync_on_save_post', 999, 3);

function thorius_academy_sync_on_trash(int $post_id): void
{
    $post = get_post($post_id);
    if (!$post || !thorius_academy_sync_is_course_post($post)) {
        return;
    }

    thorius_academy_sync_send_webhook($post_id, 'course.unpublished', $post->post_name);
}
add_action('wp_trash_post', 'thorius_academy_sync_on_trash');

function thorius_academy_sync_on_delete(int $post_id): void
{
    $post = get_post($post_id);
    if (!$post || !thorius_academy_sync_is_course_post($post)) {
        return;
    }

    thorius_academy_sync_send_webhook($post_id, 'course.deleted', $post->post_name);
}
add_action('before_delete_post', 'thorius_academy_sync_on_delete');

function thorius_academy_sync_get_course_id_from_lesson(int $lesson_id): int
{
    if (function_exists('tutor_utils')) {
        $course_id = tutor_utils()->get_course_id_by('lesson', $lesson_id);
        if ($course_id) {
            return (int) $course_id;
        }
    }

    $topic_id = (int) wp_get_post_parent_id($lesson_id);
    if ($topic_id <= 0) {
        return 0;
    }

    return (int) wp_get_post_parent_id($topic_id);
}

function thorius_academy_sync_get_course_id_from_topic(int $topic_id): int
{
    return (int) wp_get_post_parent_id($topic_id);
}

function thorius_academy_sync_on_curriculum_change(int $post_id): void
{
    $post = get_post($post_id);
    if (!$post) {
        return;
    }

    $course_id = 0;

    if ($post->post_type === 'lesson' || $post->post_type === 'tutor_lesson') {
        $course_id = thorius_academy_sync_get_course_id_from_lesson($post_id);
    } elseif ($post->post_type === 'topics' || $post->post_type === 'tutor_topic') {
        $course_id = thorius_academy_sync_get_course_id_from_topic($post_id);
    }

    if ($course_id <= 0) {
        return;
    }

    thorius_academy_sync_queue_webhook($course_id, 'course.updated');
}

function thorius_academy_sync_on_lesson_created(int $lesson_id): void
{
    thorius_academy_sync_on_curriculum_change($lesson_id);
}
add_action('tutor/lesson/created', 'thorius_academy_sync_on_lesson_created', 20, 1);

function thorius_academy_sync_on_lesson_updated(int $lesson_id): void
{
    thorius_academy_sync_on_curriculum_change($lesson_id);
}
add_action('tutor/lesson_update/after', 'thorius_academy_sync_on_lesson_updated', 20, 1);

function thorius_academy_sync_on_lesson_save(int $post_id, WP_Post $post): void
{
    if (!in_array($post->post_type, array('lesson', 'tutor_lesson'), true)) {
        return;
    }

    thorius_academy_sync_on_curriculum_change($post_id);
}
add_action('save_post_lesson', 'thorius_academy_sync_on_lesson_save', 999, 2);
add_action('save_post_tutor_lesson', 'thorius_academy_sync_on_lesson_save', 999, 2);

function thorius_academy_sync_on_topic_save(int $post_id, WP_Post $post): void
{
    if (!in_array($post->post_type, array('topics', 'tutor_topic'), true)) {
        return;
    }

    thorius_academy_sync_on_curriculum_change($post_id);
}
add_action('save_post_topics', 'thorius_academy_sync_on_topic_save', 999, 2);
add_action('save_post_tutor_topic', 'thorius_academy_sync_on_topic_save', 999, 2);
