<?php
/**
 * Plugin Name: Thorius YouTube Sync
 * Description: YouTube playlist/linklerinden her video için ayrı ücretsiz Tutor kursu açar (manuel).
 * Version: 1.0.6
 * Author: Thorius
 * Text Domain: thorius-youtube-sync
 *
 * Kurulum: Ayarlar → Thorius YouTube Sync
 * İsteğe bağlı wp-config.php: define('THORIUS_YOUTUBE_API_KEY', 'AIza...');
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_YT_SYNC_VERSION', '1.0.6');
define('THORIUS_YT_SYNC_META', '_thorius_youtube_video_id');
define('THORIUS_YT_SYNC_THUMB_META', '_thorius_youtube_thumbnail_url');
define('THORIUS_YT_SYNC_INSTRUCTOR_ID', 277);
define('THORIUS_YT_SYNC_REASSIGN_BATCH_SIZE', 5);

function thorius_yt_sync_raise_limits(): void
{
    if (function_exists('set_time_limit')) {
        @set_time_limit(120);
    }
    if (function_exists('ini_set')) {
        @ini_set('memory_limit', '512M');
    }
}

function thorius_yt_sync_get_reassign_job_key(): string
{
    return 'thorius_yt_reassign_' . get_current_user_id();
}

function thorius_yt_sync_get_instructor_id(): int
{
    return THORIUS_YT_SYNC_INSTRUCTOR_ID;
}

/**
 * @return string[]
 */
function thorius_yt_sync_get_course_post_types(): array
{
    $types = array();

    if (post_type_exists('courses')) {
        $types[] = 'courses';
    }
    if (post_type_exists('tutor_course')) {
        $types[] = 'tutor_course';
    }

    return $types !== array() ? $types : array('courses');
}

function thorius_yt_sync_register_rest_fields(): void
{
    foreach (thorius_yt_sync_get_course_post_types() as $post_type) {
        register_rest_field(
            $post_type,
            'thorius_youtube',
            array(
                'get_callback' => static function (array $post): array {
                    $post_id = (int) ($post['id'] ?? 0);
                    $video_id = (string) get_post_meta($post_id, THORIUS_YT_SYNC_META, true);
                    $thumbnail_url = (string) get_post_meta($post_id, THORIUS_YT_SYNC_THUMB_META, true);

                    if ($thumbnail_url === '' && $video_id !== '') {
                        $thumbnail_url = thorius_yt_sync_build_thumbnail_url($video_id);
                    }

                    return array(
                        'video_id' => $video_id,
                        'thumbnail_url' => $thumbnail_url,
                    );
                },
                'schema' => array(
                    'type' => 'object',
                    'context' => array('view', 'edit'),
                ),
            )
        );
    }
}
add_action('rest_api_init', 'thorius_yt_sync_register_rest_fields');

function thorius_yt_sync_default_description_footer(): string
{
    return <<<'HTML'
<h3>Kurs Hakkında</h3>
<p>Bu eğitim programı, ilgili alandaki kurumsal farkındalığı artırmak amacıyla hazırlanmış bir <strong>İçerik Kürasyonu (Derleme) ve Rehberlik</strong> kursudur.</p>
<p>Thorius Akademi olarak, bilgiye erişimi kolaylaştırmak adına internet üzerindeki en nitelikli kamusal eğitim kaynaklarını sizler için tek bir müfredat altında yapılandırdık.</p>
<h4>⚠️ Önemli Bilgilendirme ve Telif Notu</h4>
<p><strong>İçerik Kaynağı:</strong> Bu kursta yer alan video ders, <strong>{source_name}</strong> tarafından üretilmiş ve YouTube platformu üzerinden kamunun ücretsiz erişimine açılmış resmi içeriktir.</p>
<p><strong>Yayınlanma Biçimi:</strong> Kurs kapsamında hiçbir video indirilmemiş veya Thorius sunucularına yüklenmemiştir. Eğitim, YouTube embed altyapısı ile doğrudan kaynak kanal üzerinden oynatılmaktadır.</p>
<p><strong>Telif ve Hak Sahipliği:</strong> Eğitim videosunun tüm fikri mülkiyet, telif ve mülkiyet hakları <strong>{source_name}</strong> kurumuna/kanalına aittir.</p>
<p><strong>🔗 Orijinal Kaynağa Git:</strong> <a href="{source_url}" target="_blank" rel="noopener noreferrer">{source_name}</a> · <a href="{video_url}" target="_blank" rel="noopener noreferrer">Bu video</a></p>
HTML;
}

function thorius_yt_sync_get_api_key(): string
{
    if (defined('THORIUS_YOUTUBE_API_KEY') && THORIUS_YOUTUBE_API_KEY !== '') {
        return (string) THORIUS_YOUTUBE_API_KEY;
    }

    return sanitize_text_field(wp_unslash($_POST['thorius_yt_api_key'] ?? ''));
}

/**
 * @return array<string, string|int>|WP_Error
 */
function thorius_yt_sync_parse_form_from_post()
{
    $playlist_id = sanitize_text_field(wp_unslash($_POST['thorius_yt_playlist_id'] ?? ''));
    $video_urls = sanitize_textarea_field(wp_unslash($_POST['thorius_yt_video_urls'] ?? ''));

    if (thorius_yt_sync_normalize_playlist_id($playlist_id) === '' && trim($video_urls) === '') {
        return new WP_Error('missing_sources', 'Playlist ID/URL veya en az bir ek video linki gerekli.');
    }

    $api_key = thorius_yt_sync_get_api_key();
    if ($api_key === '') {
        return new WP_Error('missing_key', 'YouTube API key gerekli (form alanı veya wp-config THORIUS_YOUTUBE_API_KEY).');
    }

    return array(
        'label' => sanitize_text_field(wp_unslash($_POST['thorius_yt_label'] ?? '')),
        'playlist_id' => $playlist_id,
        'video_urls' => $video_urls,
        'course_title_prefix' => sanitize_text_field(wp_unslash($_POST['thorius_yt_course_title_prefix'] ?? '')),
        'category_id' => (int) ($_POST['thorius_yt_category_id'] ?? 0),
        'source_name' => sanitize_text_field(wp_unslash($_POST['thorius_yt_source_name'] ?? '')),
        'source_url' => esc_url_raw(wp_unslash($_POST['thorius_yt_source_url'] ?? '')),
        'description_footer' => wp_kses_post(wp_unslash($_POST['thorius_yt_description_footer'] ?? '')),
        'api_key' => $api_key,
    );
}

function thorius_yt_sync_handle_add_courses(): void
{
    if (!isset($_POST['thorius_yt_add_courses'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        return;
    }

    check_admin_referer('thorius_yt_add_courses');

    $form = thorius_yt_sync_parse_form_from_post();
    if (is_wp_error($form)) {
        set_transient(
            'thorius_yt_notice_' . get_current_user_id(),
            array('type' => 'error', 'message' => $form->get_error_message()),
            60
        );
        wp_safe_redirect(admin_url('options-general.php?page=thorius-youtube-sync'));
        exit;
    }

    $result = thorius_yt_sync_import_courses($form);
    set_transient(
        'thorius_yt_notice_' . get_current_user_id(),
        array(
            'type' => is_wp_error($result) ? 'error' : 'success',
            'message' => is_wp_error($result) ? $result->get_error_message() : $result,
        ),
        60
    );

    wp_safe_redirect(admin_url('options-general.php?page=thorius-youtube-sync'));
    exit;
}
add_action('admin_init', 'thorius_yt_sync_handle_add_courses');
add_action('admin_init', 'thorius_yt_sync_handle_reassign_today');
add_action('admin_init', 'thorius_yt_sync_handle_reassign_batch');

function thorius_yt_sync_reassign_continue_url(int $done = 0, int $total = 0): string
{
    $url = admin_url('options-general.php?page=thorius-youtube-sync&thorius_yt_reassign_batch=1');

    if ($done > 0 && $total > 0) {
        $url = add_query_arg(
            array(
                'thorius_yt_batch_done' => $done,
                'thorius_yt_batch_total' => $total,
            ),
            $url
        );
    }

    return wp_nonce_url($url, 'thorius_yt_reassign_batch');
}

function thorius_yt_sync_handle_reassign_today(): void
{
    if (!isset($_POST['thorius_yt_reassign_today'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        return;
    }

    check_admin_referer('thorius_yt_reassign_today');
    thorius_yt_sync_raise_limits();

    $instructor_id = thorius_yt_sync_get_instructor_id();
    if (!get_user_by('id', $instructor_id)) {
        set_transient(
            'thorius_yt_notice_' . get_current_user_id(),
            array(
                'type' => 'error',
                'message' => sprintf('Eğitmen kullanıcısı bulunamadı (ID %d).', $instructor_id),
            ),
            60
        );
        wp_safe_redirect(admin_url('options-general.php?page=thorius-youtube-sync'));
        exit;
    }

    $course_ids = thorius_yt_sync_get_todays_youtube_course_ids();
    if (empty($course_ids)) {
        set_transient(
            'thorius_yt_notice_' . get_current_user_id(),
            array(
                'type' => 'error',
                'message' => 'Bugün YouTube Sync ile eklenen kurs bulunamadı.',
            ),
            60
        );
        wp_safe_redirect(admin_url('options-general.php?page=thorius-youtube-sync'));
        exit;
    }

    set_transient(
        thorius_yt_sync_get_reassign_job_key(),
        array(
            'course_ids' => array_map('intval', $course_ids),
            'offset' => 0,
            'instructor_id' => $instructor_id,
            'updated_posts' => 0,
            'total' => count($course_ids),
        ),
        HOUR_IN_SECONDS
    );

    wp_safe_redirect(thorius_yt_sync_reassign_continue_url(0, count($course_ids)));
    exit;
}

function thorius_yt_sync_handle_reassign_batch(): void
{
    if (empty($_GET['thorius_yt_reassign_batch'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        return;
    }

    check_admin_referer('thorius_yt_reassign_batch');
    thorius_yt_sync_raise_limits();

    $job = get_transient(thorius_yt_sync_get_reassign_job_key());
    if (!is_array($job) || empty($job['course_ids'])) {
        set_transient(
            'thorius_yt_notice_' . get_current_user_id(),
            array(
                'type' => 'error',
                'message' => 'Eğitmen güncelleme işi bulunamadı veya süresi doldu. Lütfen tekrar başlatın.',
            ),
            60
        );
        wp_safe_redirect(admin_url('options-general.php?page=thorius-youtube-sync'));
        exit;
    }

    $course_ids = array_values(array_map('intval', $job['course_ids']));
    $offset = max(0, (int) ($job['offset'] ?? 0));
    $instructor_id = (int) ($job['instructor_id'] ?? thorius_yt_sync_get_instructor_id());
    $updated_posts = (int) ($job['updated_posts'] ?? 0);
    $total = (int) ($job['total'] ?? count($course_ids));
    $batch = array_slice($course_ids, $offset, THORIUS_YT_SYNC_REASSIGN_BATCH_SIZE);

    foreach ($batch as $course_id) {
        $updated_posts += thorius_yt_sync_reassign_instructor_for_course_tree($course_id, $instructor_id);
    }

    $offset += count($batch);

    if ($offset >= count($course_ids)) {
        delete_transient(thorius_yt_sync_get_reassign_job_key());
        set_transient(
            'thorius_yt_notice_' . get_current_user_id(),
            array(
                'type' => 'success',
                'message' => sprintf(
                    '%d kurs tarandı, %d kayıt eğitmen %d olarak güncellendi.',
                    $total,
                    $updated_posts,
                    $instructor_id
                ),
            ),
            60
        );
        wp_safe_redirect(admin_url('options-general.php?page=thorius-youtube-sync'));
        exit;
    }

    set_transient(
        thorius_yt_sync_get_reassign_job_key(),
        array(
            'course_ids' => $course_ids,
            'offset' => $offset,
            'instructor_id' => $instructor_id,
            'updated_posts' => $updated_posts,
            'total' => $total,
        ),
        HOUR_IN_SECONDS
    );

    wp_safe_redirect(thorius_yt_sync_reassign_continue_url($offset, $total));
    exit;
}

function thorius_yt_sync_add_settings_page(): void
{
    add_options_page(
        __('Thorius YouTube Sync', 'thorius-youtube-sync'),
        __('Thorius YouTube Sync', 'thorius-youtube-sync'),
        'manage_options',
        'thorius-youtube-sync',
        'thorius_yt_sync_render_page'
    );
}
add_action('admin_menu', 'thorius_yt_sync_add_settings_page');

function thorius_yt_sync_render_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    $notice = '';
    $stored = get_transient('thorius_yt_notice_' . get_current_user_id());
    if (is_array($stored)) {
        $class = ($stored['type'] ?? '') === 'error' ? 'notice-error' : 'notice-success';
        $notice = '<div class="notice ' . esc_attr($class) . ' is-dismissible"><p>'
            . esc_html($stored['message'] ?? '') . '</p></div>';
        delete_transient('thorius_yt_notice_' . get_current_user_id());
    }

    $api_key_from_config = defined('THORIUS_YOUTUBE_API_KEY') && THORIUS_YOUTUBE_API_KEY !== '';

    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Thorius YouTube Sync', 'thorius-youtube-sync'); ?></h1>
        <p>Sürüm <?php echo esc_html(THORIUS_YT_SYNC_VERSION); ?> — Her video = ayrı ücretsiz kurs. Form kaydedilmez.</p>
        <?php echo $notice; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

        <form method="post" action="<?php echo esc_url(admin_url('options-general.php?page=thorius-youtube-sync')); ?>" style="max-width:900px">
            <?php wp_nonce_field('thorius_yt_add_courses'); ?>

            <?php if (!$api_key_from_config) : ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><label for="thorius_yt_api_key">YouTube API Key</label></th>
                        <td>
                            <input type="password" id="thorius_yt_api_key" name="thorius_yt_api_key" value="" class="regular-text" autocomplete="off" />
                            <p class="description">Playlist listelemek için gerekli. Kalıcı değil — her seferinde girin veya wp-config’e <code>THORIUS_YOUTUBE_API_KEY</code> ekleyin.</p>
                        </td>
                    </tr>
                </table>
            <?php else : ?>
                <p class="description">YouTube API key wp-config üzerinden tanımlı.</p>
            <?php endif; ?>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="thorius_yt_label">Etiket</label></th>
                    <td><input type="text" id="thorius_yt_label" name="thorius_yt_label" value="" class="regular-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="thorius_yt_playlist_id">Playlist ID / URL</label></th>
                    <td><input type="text" id="thorius_yt_playlist_id" name="thorius_yt_playlist_id" value="" class="large-text" placeholder="PLxxxx veya https://youtube.com/playlist?list=..." /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="thorius_yt_video_urls">Ek video linkleri</label></th>
                    <td><textarea id="thorius_yt_video_urls" name="thorius_yt_video_urls" rows="5" class="large-text code"></textarea></td>
                </tr>
                <tr>
                    <th scope="row"><label for="thorius_yt_course_title_prefix">Kurs adı öneki</label></th>
                    <td><input type="text" id="thorius_yt_course_title_prefix" name="thorius_yt_course_title_prefix" value="" class="regular-text" placeholder="BTK —" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="thorius_yt_category_id">Kategori ID</label></th>
                    <td><input type="number" id="thorius_yt_category_id" name="thorius_yt_category_id" value="" class="small-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="thorius_yt_source_name">Kaynak adı</label></th>
                    <td><input type="text" id="thorius_yt_source_name" name="thorius_yt_source_name" value="" class="large-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="thorius_yt_source_url">Kaynak URL</label></th>
                    <td><input type="url" id="thorius_yt_source_url" name="thorius_yt_source_url" value="" class="large-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="thorius_yt_description_footer">Açıklama altı metin</label></th>
                    <td>
                        <textarea id="thorius_yt_description_footer" name="thorius_yt_description_footer" rows="10" class="large-text code"></textarea>
                        <p class="description">Boş bırakılırsa varsayılan telif metni kullanılır. Yer tutucular: {source_name}, {source_url}, {video_title}, {video_url}</p>
                    </td>
                </tr>
            </table>

            <?php submit_button(__('Kursları Ekle', 'thorius-youtube-sync'), 'primary', 'thorius_yt_add_courses'); ?>
        </form>

        <hr style="margin:2rem 0" />

        <h2><?php esc_html_e('Eğitmen düzeltme', 'thorius-youtube-sync'); ?></h2>
        <p>Bugün YouTube Sync ile eklenen kursların eğitmenini <strong>ID <?php echo (int) THORIUS_YT_SYNC_INSTRUCTOR_ID; ?></strong> yapar ve YouTube kapak görseli URL&apos;sini kaydeder. Çok sayıda kurs varsa işlem <?php echo (int) THORIUS_YT_SYNC_REASSIGN_BATCH_SIZE; ?>&apos;erli partiler halinde otomatik devam eder.</p>
        <?php
        $batch_running = isset($_GET['thorius_yt_batch_done'], $_GET['thorius_yt_batch_total'])
            && (int) $_GET['thorius_yt_batch_total'] > 0;
        if ($batch_running) :
            ?>
            <div class="notice notice-info"><p>
                <?php
                printf(
                    esc_html__('İşleniyor: %1$d / %2$d kurs... Sayfa birkaç kez yenilenecek.', 'thorius-youtube-sync'),
                    min((int) $_GET['thorius_yt_batch_done'], (int) $_GET['thorius_yt_batch_total']),
                    (int) $_GET['thorius_yt_batch_total']
                );
                ?>
            </p></div>
        <?php endif; ?>
        <form method="post" action="<?php echo esc_url(admin_url('options-general.php?page=thorius-youtube-sync')); ?>" style="max-width:900px">
            <?php wp_nonce_field('thorius_yt_reassign_today'); ?>
            <?php submit_button(__('Bugünkü kurslarda eğitmeni güncelle', 'thorius-youtube-sync'), 'secondary', 'thorius_yt_reassign_today'); ?>
        </form>
    </div>
    <?php
}

/**
 * @param array<string, mixed> $form
 * @return string|WP_Error
 */
function thorius_yt_sync_import_courses(array $form)
{
    thorius_yt_sync_raise_limits();

    $api_key = (string) ($form['api_key'] ?? '');
    $profile = array(
        'label' => $form['label'] ?? '',
        'playlist_id' => $form['playlist_id'] ?? '',
        'video_urls' => $form['video_urls'] ?? '',
        'course_title_prefix' => $form['course_title_prefix'] ?? '',
        'category_id' => (int) ($form['category_id'] ?? 0),
        'source_name' => $form['source_name'] ?? '',
        'source_url' => $form['source_url'] ?? '',
        'description_footer' => $form['description_footer'] ?? '',
    );

    $playlist_id = thorius_yt_sync_normalize_playlist_id($profile['playlist_id']);
    $videos = thorius_yt_sync_collect_videos($profile, $api_key);
    if (is_wp_error($videos)) {
        return $videos;
    }

    if ($videos === array()) {
        return new WP_Error('no_videos', 'Video bulunamadı.');
    }

    $created = 0;
    $skipped = 0;
    $category_id = (int) ($profile['category_id'] ?? 0);
    $title_prefix = trim($profile['course_title_prefix'] ?? '');

    foreach ($videos as $video) {
        if (thorius_yt_sync_video_already_imported($video['id'])) {
            $skipped++;
            continue;
        }

        $course_content = thorius_yt_sync_build_course_content($video, $profile);
        $course_id = thorius_yt_sync_create_course_from_video(
            $video,
            $category_id,
            $title_prefix,
            $course_content
        );
        if (is_wp_error($course_id)) {
            return $course_id;
        }

        $topic_id = thorius_yt_sync_create_topic_for_course($course_id, 'Ders');
        if (is_wp_error($topic_id)) {
            return $topic_id;
        }

        $lesson_id = thorius_yt_sync_create_lesson($topic_id, $video);
        if (is_wp_error($lesson_id)) {
            return $lesson_id;
        }

        update_post_meta($course_id, THORIUS_YT_SYNC_META, $video['id']);
        update_post_meta($lesson_id, THORIUS_YT_SYNC_META, $video['id']);
        $created++;

        if (function_exists('thorius_academy_sync_queue_webhook')) {
            thorius_academy_sync_queue_webhook($course_id, 'course.published');
        }

        if ($created % 5 === 0) {
            wp_cache_flush();
        }
    }

    if ($created === 0 && $skipped > 0) {
        return sprintf('%d video bulundu — hepsi WordPress\'te zaten kurs olarak kayıtlı.', $skipped);
    }

    if ($skipped > 0) {
        return sprintf('%d kurs eklendi, %d video zaten vardı (atlandı).', $created, $skipped);
    }

    return sprintf('%d kurs eklendi.', $created);
}

/**
 * @param array<string, mixed> $profile
 * @return array<int, array{id:string,title:string,description:string,duration_seconds:int,thumbnail_url:string}>|WP_Error
 */
function thorius_yt_sync_collect_videos(array $profile, string $api_key)
{
    $by_id = array();
    $order = array();

    $playlist_id = thorius_yt_sync_normalize_playlist_id($profile['playlist_id'] ?? '');
    if ($playlist_id !== '') {
        $playlist_videos = thorius_yt_sync_fetch_playlist($playlist_id, $api_key);
        if (is_wp_error($playlist_videos)) {
            return $playlist_videos;
        }
        foreach ($playlist_videos as $video) {
            if (!isset($by_id[$video['id']])) {
                $order[] = $video['id'];
            }
            $by_id[$video['id']] = $video;
        }
    }

    foreach (thorius_yt_sync_parse_video_urls($profile['video_urls'] ?? '') as $video_id) {
        if (!isset($by_id[$video_id])) {
            $order[] = $video_id;
        }
    }

    $missing_ids = array();
    foreach ($order as $video_id) {
        if (!isset($by_id[$video_id])) {
            $missing_ids[] = $video_id;
        }
    }

    if ($missing_ids !== array()) {
        $fetched = thorius_yt_sync_fetch_videos_by_ids($missing_ids, $api_key);
        if (is_wp_error($fetched)) {
            return $fetched;
        }
        foreach ($fetched as $video) {
            $by_id[$video['id']] = $video;
        }
    }

    $videos = array();
    foreach ($order as $video_id) {
        if (isset($by_id[$video_id])) {
            $videos[] = $by_id[$video_id];
        }
    }

    return $videos;
}

/**
 * @return array<int, string>
 */
function thorius_yt_sync_parse_video_urls(string $raw): array
{
    $lines = preg_split('/\r\n|\r|\n/', $raw) ?: array();
    $ids = array();

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }
        $video_id = thorius_yt_sync_extract_video_id($line);
        if ($video_id !== '') {
            $ids[] = $video_id;
        }
    }

    return array_values(array_unique($ids));
}

function thorius_yt_sync_extract_video_id(string $value): string
{
    $value = trim($value);
    if ($value === '') {
        return '';
    }

    if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $value)) {
        return $value;
    }

    if (preg_match('/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/', $value, $matches)) {
        return $matches[1];
    }

    return '';
}

/**
 * @param array<int, string> $video_ids
 * @return array<int, array{id:string,title:string,description:string,duration_seconds:int,thumbnail_url:string}>|WP_Error
 */
function thorius_yt_sync_fetch_videos_by_ids(array $video_ids, string $api_key)
{
    $videos = array();

    foreach (array_chunk(array_values(array_unique($video_ids)), 50) as $chunk) {
        $url = add_query_arg(
            array(
                'part' => 'snippet,contentDetails',
                'id' => implode(',', $chunk),
                'key' => $api_key,
            ),
            'https://www.googleapis.com/youtube/v3/videos'
        );

        $response = wp_remote_get($url, array('timeout' => 30));
        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code >= 400) {
            return new WP_Error('youtube_api', $body['error']['message'] ?? 'YouTube API hatası');
        }

        foreach ($body['items'] ?? array() as $item) {
            $video_id = $item['id'] ?? '';
            if ($video_id === '') {
                continue;
            }

            $thumbnails = $item['snippet']['thumbnails'] ?? array();
            $thumb = $thumbnails['maxres']['url']
                ?? $thumbnails['high']['url']
                ?? $thumbnails['medium']['url']
                ?? thorius_yt_sync_build_thumbnail_url($video_id);

            $videos[] = array(
                'id' => $video_id,
                'title' => wp_strip_all_tags($item['snippet']['title'] ?? 'YouTube Dersi'),
                'description' => wp_strip_all_tags($item['snippet']['description'] ?? ''),
                'duration_seconds' => thorius_yt_sync_iso8601_to_seconds($item['contentDetails']['duration'] ?? ''),
                'thumbnail_url' => $thumb,
            );
        }
    }

    return $videos;
}

function thorius_yt_sync_build_thumbnail_url(string $video_id): string
{
    return 'https://i.ytimg.com/vi/' . $video_id . '/hqdefault.jpg';
}

function thorius_yt_sync_resolve_thumbnail_url(string $video_id, string $preferred = ''): string
{
    if ($preferred !== '') {
        return $preferred;
    }

    return thorius_yt_sync_build_thumbnail_url($video_id);
}

function thorius_yt_sync_attach_thumbnail(int $post_id, string $video_id, string $title, string $preferred_url = ''): void
{
    unset($title);

    if ($post_id <= 0 || $video_id === '') {
        return;
    }

    $url = esc_url_raw(thorius_yt_sync_resolve_thumbnail_url($video_id, $preferred_url));
    if ($url === '') {
        return;
    }

    update_post_meta($post_id, THORIUS_YT_SYNC_THUMB_META, $url);
}

function thorius_yt_sync_backfill_course_thumbnail(int $course_id): bool
{
    if ($course_id <= 0) {
        return false;
    }

    $video_id = (string) get_post_meta($course_id, THORIUS_YT_SYNC_META, true);
    if ($video_id === '') {
        return false;
    }

    thorius_yt_sync_attach_thumbnail($course_id, $video_id, '', '');

    return true;
}

function thorius_yt_sync_normalize_playlist_id(string $value): string
{
    $value = trim($value);
    if ($value === '') {
        return '';
    }

    if (preg_match('/list=([a-zA-Z0-9_-]+)/', $value, $matches)) {
        return $matches[1];
    }

    return $value;
}

/**
 * @param array{id:string,title:string,description:string} $video
 * @param array<string, mixed> $profile
 */
function thorius_yt_sync_build_course_content(array $video, array $profile): string
{
    $description = trim($video['description'] ?? '');
    $footer = thorius_yt_sync_render_description_footer($profile, $video);

    if ($footer === '') {
        return $description;
    }

    $parts = array();
    if ($description !== '') {
        $parts[] = wpautop(esc_html($description));
    }
    $parts[] = '<hr />';
    $parts[] = $footer;

    return implode("\n\n", $parts);
}

/**
 * @param array<string, mixed> $profile
 * @param array{id:string,title:string} $video
 */
function thorius_yt_sync_render_description_footer(array $profile, array $video): string
{
    $template = trim($profile['description_footer'] ?? '');
    if ($template === '') {
        $template = thorius_yt_sync_default_description_footer();
    }

    $source_name = trim($profile['source_name'] ?? '');
    $source_url = trim($profile['source_url'] ?? '');
    $video_url = 'https://www.youtube.com/watch?v=' . ($video['id'] ?? '');

    return str_replace(
        array('{source_name}', '{source_url}', '{video_title}', '{video_url}'),
        array(
            $source_name !== '' ? esc_html($source_name) : esc_html__('Kaynak kanal', 'thorius-youtube-sync'),
            $source_url !== '' ? esc_url($source_url) : esc_url($video_url),
            esc_html($video['title'] ?? ''),
            esc_url($video_url),
        ),
        $template
    );
}

/**
 * @param array{id:string,title:string,description:string,duration_seconds:int,thumbnail_url?:string} $video
 * @return int|WP_Error
 */
function thorius_yt_sync_create_course_from_video(
    array $video,
    int $category_id,
    string $title_prefix,
    string $post_content = ''
) {
    $course_post_type = post_type_exists('courses') ? 'courses' : 'tutor_course';
    $course_title = $title_prefix !== ''
        ? trim($title_prefix . ' ' . $video['title'])
        : $video['title'];

    $course_id = wp_insert_post(array(
        'post_type' => $course_post_type,
        'post_title' => $course_title,
        'post_content' => $post_content !== '' ? $post_content : ($video['description'] ?? ''),
        'post_status' => 'publish',
        'post_author' => thorius_yt_sync_get_instructor_id(),
    ), true);

    if (is_wp_error($course_id)) {
        return $course_id;
    }

    update_post_meta($course_id, '_tutor_course_price_type', 'free');
    update_post_meta($course_id, '_tutor_is_public', 'yes');

    if ($category_id > 0) {
        wp_set_object_terms((int) $course_id, array($category_id), 'course-category', false);
    }

    thorius_yt_sync_attach_thumbnail(
        (int) $course_id,
        $video['id'],
        $course_title,
        $video['thumbnail_url'] ?? ''
    );

    clean_post_cache((int) $course_id);
    do_action('save_post', (int) $course_id, get_post($course_id), true);
    do_action('tutor_after_course_created', (int) $course_id);

    return (int) $course_id;
}

/**
 * @return array<int, array{id:string,title:string,description:string,duration_seconds:int,thumbnail_url:string}>|WP_Error
 */
function thorius_yt_sync_fetch_playlist(string $playlist_id, string $api_key)
{
    $videos = array();
    $page_token = '';

    do {
        $response = wp_remote_get(
            add_query_arg(
                array_filter(array(
                    'part' => 'snippet,contentDetails',
                    'playlistId' => $playlist_id,
                    'maxResults' => 50,
                    'pageToken' => $page_token,
                    'key' => $api_key,
                )),
                'https://www.googleapis.com/youtube/v3/playlistItems'
            ),
            array('timeout' => 30)
        );

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code >= 400) {
            return new WP_Error('youtube_api', $body['error']['message'] ?? 'YouTube API hatası');
        }

        foreach ($body['items'] ?? array() as $item) {
            $video_id = $item['contentDetails']['videoId'] ?? '';
            if ($video_id === '') {
                continue;
            }

            $thumbnails = $item['snippet']['thumbnails'] ?? array();
            $thumb = $thumbnails['maxres']['url']
                ?? $thumbnails['high']['url']
                ?? $thumbnails['medium']['url']
                ?? thorius_yt_sync_build_thumbnail_url($video_id);

            $videos[] = array(
                'id' => $video_id,
                'title' => wp_strip_all_tags($item['snippet']['title'] ?? 'YouTube Dersi'),
                'description' => wp_strip_all_tags($item['snippet']['description'] ?? ''),
                'duration_seconds' => thorius_yt_sync_fetch_video_duration($video_id, $api_key),
                'thumbnail_url' => $thumb,
            );
        }

        $page_token = $body['nextPageToken'] ?? '';
    } while ($page_token !== '');

    return $videos;
}

function thorius_yt_sync_fetch_video_duration(string $video_id, string $api_key): int
{
    $response = wp_remote_get(
        add_query_arg(
            array('part' => 'contentDetails', 'id' => $video_id, 'key' => $api_key),
            'https://www.googleapis.com/youtube/v3/videos'
        ),
        array('timeout' => 20)
    );

    if (is_wp_error($response)) {
        return 0;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    return thorius_yt_sync_iso8601_to_seconds($body['items'][0]['contentDetails']['duration'] ?? '');
}

function thorius_yt_sync_iso8601_to_seconds(string $duration): int
{
    if ($duration === '') {
        return 0;
    }

    preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/', $duration, $m);
    return ((int) ($m[1] ?? 0) * 3600) + ((int) ($m[2] ?? 0) * 60) + (int) ($m[3] ?? 0);
}

function thorius_yt_sync_seconds_to_runtime(int $seconds): array
{
    return array(
        'hours' => (string) (int) floor($seconds / 3600),
        'minutes' => (string) (int) floor(($seconds % 3600) / 60),
        'seconds' => (string) ($seconds % 60),
    );
}

function thorius_yt_sync_video_already_imported(string $youtube_video_id): bool
{
    $existing = get_posts(array(
        'post_type' => array('courses', 'tutor_course'),
        'post_status' => 'any',
        'meta_key' => THORIUS_YT_SYNC_META,
        'meta_value' => $youtube_video_id,
        'fields' => 'ids',
        'posts_per_page' => 1,
    ));

    return !empty($existing);
}

/**
 * @return int[]
 */
function thorius_yt_sync_get_todays_youtube_course_ids(): array
{
    $course_types = post_type_exists('courses') ? array('courses') : array('tutor_course');

    return get_posts(array(
        'post_type' => $course_types,
        'post_status' => 'any',
        'fields' => 'ids',
        'posts_per_page' => -1,
        'meta_key' => THORIUS_YT_SYNC_META,
        'date_query' => array(
            array(
                'after' => current_time('Y-m-d 00:00:00'),
                'before' => current_time('Y-m-d 23:59:59'),
                'inclusive' => true,
            ),
        ),
    ));
}

/**
 * @return int[]
 */
function thorius_yt_sync_collect_course_tree_post_ids(int $course_id): array
{
    $ids = array($course_id);
    $topic_types = post_type_exists('topics') ? array('topics') : array('tutor_topic');
    $lesson_types = post_type_exists('lesson') ? array('lesson') : array('tutor_lesson');

    $topics = get_posts(array(
        'post_type' => $topic_types,
        'post_parent' => $course_id,
        'post_status' => 'any',
        'posts_per_page' => -1,
        'fields' => 'ids',
    ));

    foreach ($topics as $topic_id) {
        $ids[] = (int) $topic_id;

        $lessons = get_posts(array(
            'post_type' => $lesson_types,
            'post_parent' => (int) $topic_id,
            'post_status' => 'any',
            'posts_per_page' => -1,
            'fields' => 'ids',
        ));

        foreach ($lessons as $lesson_id) {
            $ids[] = (int) $lesson_id;
        }
    }

    return array_values(array_unique(array_filter($ids)));
}

function thorius_yt_sync_bulk_set_post_authors(array $post_ids, int $author_id): int
{
    global $wpdb;

    $post_ids = array_values(array_unique(array_filter(array_map('intval', $post_ids))));
    if ($post_ids === array() || $author_id <= 0) {
        return 0;
    }

    $placeholders = implode(', ', array_fill(0, count($post_ids), '%d'));
    $params = array_merge(array($author_id), $post_ids, array($author_id));
    $sql = $wpdb->prepare(
        "UPDATE {$wpdb->posts} SET post_author = %d WHERE ID IN ($placeholders) AND post_author != %d",
        $params
    );

    $wpdb->query($sql);

    foreach ($post_ids as $post_id) {
        clean_post_cache($post_id);
    }

    return max(0, (int) $wpdb->rows_affected);
}

/**
 * @return int Güncellenen kayıt sayısı
 */
function thorius_yt_sync_reassign_instructor_for_course_tree(int $course_id, int $instructor_id): int
{
    if ($course_id <= 0) {
        return 0;
    }

    thorius_yt_sync_backfill_course_thumbnail($course_id);

    $post_ids = thorius_yt_sync_collect_course_tree_post_ids($course_id);
    if ($post_ids === array()) {
        return 0;
    }

    return thorius_yt_sync_bulk_set_post_authors($post_ids, $instructor_id);
}

/**
 * @return string|WP_Error
 */
function thorius_yt_sync_reassign_todays_youtube_courses(int $instructor_id = 0)
{
    $instructor_id = $instructor_id > 0 ? $instructor_id : thorius_yt_sync_get_instructor_id();

    if (!get_user_by('id', $instructor_id)) {
        return new WP_Error(
            'missing_instructor',
            sprintf('Eğitmen kullanıcısı bulunamadı (ID %d).', $instructor_id)
        );
    }

    $course_ids = thorius_yt_sync_get_todays_youtube_course_ids();
    if (empty($course_ids)) {
        return 'Bugün YouTube Sync ile eklenen kurs bulunamadı.';
    }

    $updated_posts = 0;
    foreach ($course_ids as $course_id) {
        $updated_posts += thorius_yt_sync_reassign_instructor_for_course_tree((int) $course_id, $instructor_id);
    }

    return sprintf(
        '%d kurs tarandı, %d kayıt eğitmen %d olarak güncellendi.',
        count($course_ids),
        $updated_posts,
        $instructor_id
    );
}

/**
 * @return int|WP_Error
 */
function thorius_yt_sync_create_topic_for_course(int $course_id, string $topic_title)
{
    $topic_post_type = post_type_exists('topics') ? 'topics' : 'tutor_topic';
    $menu_order = function_exists('tutor_utils')
        ? (int) tutor_utils()->get_next_course_content_order_id($course_id)
        : 0;

    $topic_id = wp_insert_post(array(
        'post_type' => $topic_post_type,
        'post_title' => $topic_title,
        'post_content' => '',
        'post_status' => 'publish',
        'post_parent' => $course_id,
        'post_author' => thorius_yt_sync_get_instructor_id(),
        'menu_order' => $menu_order,
    ), true);

    if (is_wp_error($topic_id)) {
        return $topic_id;
    }

    do_action('tutor/topic/created', (int) $topic_id);
    return (int) $topic_id;
}

/**
 * @param array{id:string,title:string,description:string,duration_seconds:int,thumbnail_url?:string} $video
 * @return int|WP_Error
 */
function thorius_yt_sync_create_lesson(int $topic_id, array $video)
{
    $lesson_post_type = post_type_exists('lesson') ? 'lesson' : 'tutor_lesson';
    $menu_order = function_exists('tutor_utils')
        ? (int) tutor_utils()->get_next_course_content_order_id($topic_id)
        : 0;

    $lesson_id = wp_insert_post(array(
        'post_type' => $lesson_post_type,
        'post_title' => $video['title'],
        'post_content' => $video['description'],
        'post_status' => 'publish',
        'post_parent' => $topic_id,
        'post_author' => thorius_yt_sync_get_instructor_id(),
        'menu_order' => $menu_order,
    ), true);

    if (is_wp_error($lesson_id)) {
        return $lesson_id;
    }

    $thumb_url = $video['thumbnail_url'] ?? thorius_yt_sync_build_thumbnail_url($video['id']);

    update_post_meta($lesson_id, '_video', array(
        'source' => 'youtube',
        'source_video_id' => $video['id'],
        'source_youtube' => 'https://www.youtube.com/watch?v=' . $video['id'],
        'runtime' => thorius_yt_sync_seconds_to_runtime($video['duration_seconds']),
        'duration_sec' => (string) max(0, (int) ($video['duration_seconds'] ?? 0)),
        'poster' => $thumb_url,
        'poster_url' => $thumb_url,
    ));

    thorius_yt_sync_attach_thumbnail((int) $lesson_id, $video['id'], $video['title'], $thumb_url);
    do_action('tutor/lesson/created', $lesson_id);

    return (int) $lesson_id;
}
