<?php
/**
 * Plugin Name: Thorius YouTube Sync
 * Description: Her YouTube videosu için ayrı ücretsiz Tutor kursu açar (playlist veya tek link).
 * Version: 0.5.1
 * Author: Thorius
 * Text Domain: thorius-youtube-sync
 *
 * Kurulum: Ayarlar → Thorius YouTube Sync
 */

if (!defined('ABSPATH')) {
    exit;
}

define('THORIUS_YT_SYNC_VERSION', '0.5.1');
define('THORIUS_YT_SYNC_OPTION', 'thorius_youtube_sync_settings');
define('THORIUS_YT_SYNC_META', '_thorius_youtube_video_id');

/**
 * @return array{
 *   youtube_api_key: string,
 *   profiles: array<int, array{
 *     label: string,
 *     playlist_id: string,
 *     video_urls: string,
 *     course_title_prefix: string,
 *     topic_id: int,
 *     topic_title: string,
 *     category_id: int
 *   }>
 * }
 */
function thorius_yt_sync_get_settings(): array
{
    $defaults = array(
        'youtube_api_key' => '',
        'profiles' => array(
            array(
                'label' => 'TFF Satranç',
                'playlist_id' => 'PL3z_f7v-p-6Zikb9b98ViAmKujNSA76mq',
                'video_urls' => '',
                'course_title_prefix' => '',
                'topic_id' => 0,
                'topic_title' => 'YouTube Dersleri',
                'category_id' => 67,
            ),
        ),
    );

    $saved = get_option(THORIUS_YT_SYNC_OPTION, array());
    if (!is_array($saved)) {
        $saved = array();
    }

    $merged = array_merge($defaults, $saved);
    $profiles = is_array($merged['profiles'] ?? null) ? $merged['profiles'] : $defaults['profiles'];

    $normalized_profiles = array();
    foreach ($profiles as $profile) {
        if (!is_array($profile)) {
            continue;
        }
        $normalized_profiles[] = array(
            'label' => sanitize_text_field($profile['label'] ?? 'Eğitmen'),
            'playlist_id' => sanitize_text_field($profile['playlist_id'] ?? ''),
            'video_urls' => sanitize_textarea_field($profile['video_urls'] ?? ''),
            'course_title_prefix' => sanitize_text_field(
                $profile['course_title_prefix'] ?? ($profile['course_title'] ?? '')
            ),
            'topic_id' => (int) ($profile['topic_id'] ?? 0),
            'topic_title' => sanitize_text_field($profile['topic_title'] ?? 'YouTube Dersleri'),
            'category_id' => (int) ($profile['category_id'] ?? 0),
        );
    }

    if ($normalized_profiles === array()) {
        $normalized_profiles = $defaults['profiles'];
    }

    return array(
        'youtube_api_key' => sanitize_text_field($merged['youtube_api_key'] ?? ''),
        'profiles' => $normalized_profiles,
    );
}

function thorius_yt_sync_register_settings(): void
{
    register_setting('thorius_youtube_sync', THORIUS_YT_SYNC_OPTION, array(
        'type' => 'array',
        'sanitize_callback' => 'thorius_yt_sync_sanitize_settings',
    ));
}
add_action('admin_init', 'thorius_yt_sync_register_settings');

/**
 * @param mixed $input
 */
function thorius_yt_sync_sanitize_settings($input): array
{
    if (!is_array($input)) {
        $input = array();
    }

    $profiles = array();
    $raw_profiles = is_array($input['profiles'] ?? null) ? $input['profiles'] : array();

    foreach ($raw_profiles as $profile) {
        if (!is_array($profile)) {
            continue;
        }
        $profiles[] = array(
            'label' => sanitize_text_field($profile['label'] ?? ''),
            'playlist_id' => sanitize_text_field($profile['playlist_id'] ?? ''),
            'video_urls' => sanitize_textarea_field($profile['video_urls'] ?? ''),
            'course_title_prefix' => sanitize_text_field(
                $profile['course_title_prefix'] ?? ($profile['course_title'] ?? '')
            ),
            'topic_id' => (int) ($profile['topic_id'] ?? 0),
            'topic_title' => sanitize_text_field($profile['topic_title'] ?? 'YouTube Dersleri'),
            'category_id' => (int) ($profile['category_id'] ?? 0),
        );
    }

    return array(
        'youtube_api_key' => sanitize_text_field($input['youtube_api_key'] ?? ''),
        'profiles' => $profiles,
    );
}

function thorius_yt_sync_add_settings_page(): void
{
    add_options_page(
        __('Thorius YouTube Sync', 'thorius-youtube-sync'),
        __('Thorius YouTube Sync', 'thorius-youtube-sync'),
        'manage_options',
        'thorius-youtube-sync',
        'thorius_yt_sync_render_settings_page'
    );
}
add_action('admin_menu', 'thorius_yt_sync_add_settings_page');

function thorius_yt_sync_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    $settings = thorius_yt_sync_get_settings();
    $notice = '';

    if (
        isset($_POST['thorius_yt_sync_run'])
        && check_admin_referer('thorius_yt_sync_run')
    ) {
        $profile_index = isset($_POST['profile_index'])
            ? (int) $_POST['profile_index']
            : 0;
        $result = thorius_yt_sync_run_import($profile_index);
        $notice = is_wp_error($result)
            ? '<div class="notice notice-error"><p>' . esc_html($result->get_error_message()) . '</p></div>'
            : '<div class="notice notice-success"><p>' . esc_html($result) . '</p></div>';
    }

    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Thorius YouTube Sync', 'thorius-youtube-sync'); ?></h1>
        <p><strong>Sürüm <?php echo esc_html(THORIUS_YT_SYNC_VERSION); ?></strong> —
            Mod: <strong>1 video = 1 ayrı kurs</strong> (101 video → 101 kurs).
            Eski sürümde tek kursa ders açılıyordu; mutlaka bu sürümü yükleyin.
        </p>
        <p class="description">
            Her YouTube videosu = <strong>ayrı bir ücretsiz Tutor kursu</strong> (101 video → 101 kurs).
            Playlist ve/veya tek tek linklerden içe aktarır. Kapak görseli otomatik eklenir.
        </p>
        <?php echo $notice; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

        <form method="post" action="options.php">
            <?php settings_fields('thorius_youtube_sync'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">YouTube API Key</th>
                    <td>
                        <input type="password" name="<?php echo esc_attr(THORIUS_YT_SYNC_OPTION); ?>[youtube_api_key]" value="<?php echo esc_attr($settings['youtube_api_key']); ?>" class="regular-text" autocomplete="off" />
                        <p class="description">
                            Google Cloud Console’da alınan anahtar. Aşağıdaki “Google API nedir?” bölümüne bakın.
                        </p>
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e('Eğitmen profilleri', 'thorius-youtube-sync'); ?></h2>
            <p class="description">
                Playlist URL/ID ile toplu içe aktarın; playlist dışı videoları aşağıdaki kutuya satır satır ekleyin.
            </p>

            <?php foreach ($settings['profiles'] as $index => $profile) : ?>
                <div class="card" style="max-width:900px;padding:16px;margin-bottom:16px">
                    <h3 style="margin-top:0"><?php echo esc_html($profile['label'] !== '' ? $profile['label'] : ('Profil ' . ($index + 1))); ?></h3>
                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row">Etiket</th>
                            <td><input type="text" name="<?php echo esc_attr(THORIUS_YT_SYNC_OPTION); ?>[profiles][<?php echo esc_attr((string) $index); ?>][label]" value="<?php echo esc_attr($profile['label']); ?>" class="regular-text" /></td>
                        </tr>
                        <tr>
                            <th scope="row">Playlist ID / URL</th>
                            <td>
                                <input type="text" name="<?php echo esc_attr(THORIUS_YT_SYNC_OPTION); ?>[profiles][<?php echo esc_attr((string) $index); ?>][playlist_id]" value="<?php echo esc_attr($profile['playlist_id']); ?>" class="large-text" placeholder="PLxxxx veya https://youtube.com/playlist?list=..." />
                                <p class="description">101 videoluk eğitim listesi buraya. Tüm playlist tek seferde içe aktarılır.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Ek video linkleri</th>
                            <td>
                                <textarea name="<?php echo esc_attr(THORIUS_YT_SYNC_OPTION); ?>[profiles][<?php echo esc_attr((string) $index); ?>][video_urls]" rows="6" class="large-text code" placeholder="https://www.youtube.com/watch?v=...&#10;https://youtu.be/..."><?php echo esc_textarea($profile['video_urls']); ?></textarea>
                                <p class="description">Playlist’te olmayan veya ayrıca eklemek istediğiniz videolar — her satıra bir link.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Kurs adı öneki</th>
                            <td>
                                <input type="text" name="<?php echo esc_attr(THORIUS_YT_SYNC_OPTION); ?>[profiles][<?php echo esc_attr((string) $index); ?>][course_title_prefix]" value="<?php echo esc_attr($profile['course_title_prefix']); ?>" class="regular-text" placeholder="TFF Satranç —" />
                                <p class="description">Boş bırakılırsa kurs adı = YouTube video başlığı. Önek varsa: “TFF Satranç — Video Başlığı”</p>
                                <input type="hidden" name="<?php echo esc_attr(THORIUS_YT_SYNC_OPTION); ?>[profiles][<?php echo esc_attr((string) $index); ?>][topic_id]" value="0" />
                                <input type="hidden" name="<?php echo esc_attr(THORIUS_YT_SYNC_OPTION); ?>[profiles][<?php echo esc_attr((string) $index); ?>][topic_title]" value="Ders" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Kategori ID</th>
                            <td><input type="number" name="<?php echo esc_attr(THORIUS_YT_SYNC_OPTION); ?>[profiles][<?php echo esc_attr((string) $index); ?>][category_id]" value="<?php echo esc_attr((string) $profile['category_id']); ?>" class="small-text" /> <span class="description">Satranç: 67</span></td>
                        </tr>
                    </table>
                </div>
            <?php endforeach; ?>

            <p class="description" style="margin-top:8px">
                Her video için yeni ücretsiz kurs + içinde 1 ders açılır. Daha önce aktarılmış videolar atlanır.
            </p>

            <?php submit_button(__('Kaydet', 'thorius-youtube-sync')); ?>
        </form>

        <hr />
        <h2><?php esc_html_e('Manuel Senkron', 'thorius-youtube-sync'); ?></h2>
        <?php foreach ($settings['profiles'] as $index => $profile) : ?>
            <form method="post" style="display:inline-block;margin:0 12px 12px 0">
                <?php wp_nonce_field('thorius_yt_sync_run'); ?>
                <input type="hidden" name="profile_index" value="<?php echo esc_attr((string) $index); ?>" />
                <?php
                submit_button(
                    sprintf(
                        /* translators: profile label */
                        __('%s — Şimdi Senkronize Et', 'thorius-youtube-sync'),
                        $profile['label'] !== '' ? $profile['label'] : ('Profil ' . ($index + 1))
                    ),
                    'secondary',
                    'thorius_yt_sync_run',
                    false
                );
                ?>
            </form>
        <?php endforeach; ?>

        <hr />
        <h2>Google API key nedir? (Basit anlatım)</h2>
        <div class="card" style="max-width:800px;padding:16px">
            <p>YouTube videolarını <strong>programla listelemek</strong> (başlık, süre, sıra) için Google’ın resmi kapısından geçmeniz gerekir. Bu kapıya <strong>API key</strong> denir.</p>
            <ol>
                <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">console.cloud.google.com</a> → Google hesabınızla giriş</li>
                <li>Üstten <strong>Yeni proje</strong> oluşturun (ör. “Thorius YouTube”)</li>
                <li><strong>API’ler ve Hizmetler → Kitaplık</strong> → <strong>YouTube Data API v3</strong> → <strong>Etkinleştir</strong></li>
                <li><strong>API’ler ve Hizmetler → Kimlik Bilgileri → Kimlik bilgisi oluştur → API anahtarı</strong></li>
                <li>Oluşan anahtarı kopyalayıp yukarıdaki “YouTube API Key” alanına yapıştırın</li>
            </ol>
            <p><strong>Ücret:</strong> Günlük ücretsiz kota genelde binlerce istek verir; sizin kullanımınız (playlist + video listesi) çok düşük kalır. Google bazen doğrulama için kart ister; kotayı aşmadıkça ücret yansımaz.</p>
            <p><strong>Playlist ID:</strong> YouTube’da oynatma listesini açın → URL’deki <code>list=PLxxxxxxxx</code> kısmını kopyalayın.</p>
        </div>
    </div>
    <?php
}

/**
 * @return string|WP_Error
 */
function thorius_yt_sync_run_import(int $profile_index = 0)
{
    if (function_exists('set_time_limit')) {
        set_time_limit(600);
    }

    $settings = thorius_yt_sync_get_settings();

    if ($settings['youtube_api_key'] === '') {
        return new WP_Error('missing_key', 'YouTube API key tanımlı değil.');
    }

    if (!isset($settings['profiles'][$profile_index])) {
        return new WP_Error('missing_profile', 'Profil bulunamadı.');
    }

    $profile = $settings['profiles'][$profile_index];
    $playlist_id = thorius_yt_sync_normalize_playlist_id($profile['playlist_id']);
    $has_extra_urls = trim($profile['video_urls']) !== '';

    if ($playlist_id === '' && !$has_extra_urls) {
        return new WP_Error('missing_sources', 'Playlist ID veya en az bir ek video linki gerekli.');
    }

    $videos = thorius_yt_sync_collect_profile_videos($profile, $settings['youtube_api_key']);
    if (is_wp_error($videos)) {
        return $videos;
    }

    if ($videos === array()) {
        return new WP_Error('no_videos', 'İçe aktarılacak video bulunamadı.');
    }

    $created_courses = 0;
    $skipped = 0;
    $category_id = (int) ($profile['category_id'] ?? 0);
    $title_prefix = trim($profile['course_title_prefix'] ?? '');

    foreach ($videos as $video) {
        if (thorius_yt_sync_video_already_imported($video['id'])) {
            $skipped++;
            continue;
        }

        $course_id = thorius_yt_sync_create_course_from_video(
            $video,
            $category_id,
            $title_prefix
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
        $created_courses++;

        if (function_exists('thorius_academy_sync_queue_webhook')) {
            thorius_academy_sync_queue_webhook($course_id, 'course.published');
        }
    }

    return sprintf(
        '[%s] %d yeni kurs oluşturuldu, %d video zaten vardı (toplam kaynak: %d video).',
        $profile['label'],
        $created_courses,
        $skipped,
        count($videos)
    );
}

/**
 * @param array<string, mixed> $profile
 * @return array<int, array{id:string,title:string,description:string,duration_seconds:int,thumbnail_url:string}>|WP_Error
 */
function thorius_yt_sync_collect_profile_videos(array $profile, string $api_key)
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

    $extra_ids = thorius_yt_sync_parse_video_urls($profile['video_urls'] ?? '');
    $missing_ids = array();
    foreach ($extra_ids as $video_id) {
        if (!isset($by_id[$video_id])) {
            $missing_ids[] = $video_id;
            $order[] = $video_id;
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
    $chunks = array_chunk(array_values(array_unique($video_ids)), 50);

    foreach ($chunks as $chunk) {
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
            $message = $body['error']['message'] ?? 'YouTube API hatası';
            return new WP_Error('youtube_api', $message);
        }

        foreach ($body['items'] ?? array() as $item) {
            $video_id = $item['id'] ?? '';
            if ($video_id === '') {
                continue;
            }

            $thumbnails = $item['snippet']['thumbnails'] ?? array();
            $thumb = $thumbnails['maxres']['url']
                ?? $thumbnails['standard']['url']
                ?? $thumbnails['high']['url']
                ?? $thumbnails['medium']['url']
                ?? thorius_yt_sync_build_thumbnail_url($video_id);

            $videos[] = array(
                'id' => $video_id,
                'title' => wp_strip_all_tags($item['snippet']['title'] ?? 'YouTube Dersi'),
                'description' => wp_strip_all_tags($item['snippet']['description'] ?? ''),
                'duration_seconds' => thorius_yt_sync_iso8601_to_seconds(
                    $item['contentDetails']['duration'] ?? ''
                ),
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

    $candidates = array(
        'https://i.ytimg.com/vi/' . $video_id . '/maxresdefault.jpg',
        'https://i.ytimg.com/vi/' . $video_id . '/hqdefault.jpg',
    );

    foreach ($candidates as $candidate) {
        $response = wp_remote_head($candidate, array('timeout' => 10));
        if (is_wp_error($response)) {
            continue;
        }
        if ((int) wp_remote_retrieve_response_code($response) === 200) {
            return $candidate;
        }
    }

    return thorius_yt_sync_build_thumbnail_url($video_id);
}

function thorius_yt_sync_attach_lesson_thumbnail(int $lesson_id, string $video_id, string $title, string $preferred_url = ''): void
{
    $thumb_url = thorius_yt_sync_resolve_thumbnail_url($video_id, $preferred_url);

    if (!function_exists('media_sideload_image')) {
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
    }

    $attachment_id = media_sideload_image($thumb_url, $lesson_id, $title, 'id');
    if (!is_wp_error($attachment_id) && $attachment_id) {
        set_post_thumbnail((int) $lesson_id, (int) $attachment_id);
    }
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

    if (preg_match('/^PL[a-zA-Z0-9_-]+$/', $value)) {
        return $value;
    }

    return $value;
}

function thorius_yt_sync_persist_course_id(int $profile_index, int $course_id): void
{
    // Artık kullanılmıyor — her video ayrı kurs açar.
}

/**
 * @param array{id:string,title:string,description:string,duration_seconds:int,thumbnail_url?:string} $video
 * @return int|WP_Error
 */
function thorius_yt_sync_create_course_from_video(
    array $video,
    int $category_id,
    string $title_prefix
) {
    $course_post_type = post_type_exists('courses') ? 'courses' : 'tutor_course';
    $course_title = $title_prefix !== ''
        ? trim($title_prefix . ' ' . $video['title'])
        : $video['title'];

    $course_id = wp_insert_post(array(
        'post_type' => $course_post_type,
        'post_title' => $course_title,
        'post_content' => $video['description'],
        'post_status' => 'publish',
        'post_author' => get_current_user_id() ?: 1,
    ), true);

    if (is_wp_error($course_id)) {
        return $course_id;
    }

    update_post_meta($course_id, '_tutor_course_price_type', 'free');
    update_post_meta($course_id, '_tutor_is_public', 'yes');

    if ($category_id > 0) {
        wp_set_object_terms((int) $course_id, array($category_id), 'course-category', false);
    }

    $thumb_url = $video['thumbnail_url'] ?? thorius_yt_sync_build_thumbnail_url($video['id']);
    thorius_yt_sync_attach_lesson_thumbnail(
        (int) $course_id,
        $video['id'],
        $course_title,
        $thumb_url
    );

    clean_post_cache((int) $course_id);
    do_action('save_post', (int) $course_id, get_post($course_id), true);
    do_action('tutor_after_course_created', (int) $course_id);

    return (int) $course_id;
}

/**
 * @return int|WP_Error
 */
function thorius_yt_sync_create_free_course(string $title, int $category_id)
{
    return thorius_yt_sync_create_course_from_video(
        array(
            'id' => '',
            'title' => $title,
            'description' => '',
            'duration_seconds' => 0,
        ),
        $category_id,
        ''
    );
}

/**
 * @return array<int, array{id:string,title:string,description:string,duration_seconds:int}>|WP_Error
 */
function thorius_yt_sync_fetch_playlist(string $playlist_id, string $api_key)
{
    $videos = array();
    $page_token = '';

    do {
        $playlist_url = add_query_arg(
            array_filter(array(
                'part' => 'snippet,contentDetails',
                'playlistId' => $playlist_id,
                'maxResults' => 50,
                'pageToken' => $page_token,
                'key' => $api_key,
            )),
            'https://www.googleapis.com/youtube/v3/playlistItems'
        );

        $playlist_res = wp_remote_get($playlist_url, array('timeout' => 30));
        if (is_wp_error($playlist_res)) {
            return $playlist_res;
        }

        $code = wp_remote_retrieve_response_code($playlist_res);
        $playlist_body = json_decode(wp_remote_retrieve_body($playlist_res), true);

        if ($code >= 400) {
            $message = $playlist_body['error']['message'] ?? 'YouTube API hatası';
            return new WP_Error('youtube_api', $message);
        }

        $items = $playlist_body['items'] ?? array();

        foreach ($items as $item) {
            $video_id = $item['contentDetails']['videoId'] ?? '';
            if ($video_id === '') {
                continue;
            }

            $duration = thorius_yt_sync_fetch_video_duration($video_id, $api_key);
            $thumbnails = $item['snippet']['thumbnails'] ?? array();
            $thumb = $thumbnails['maxres']['url']
                ?? $thumbnails['standard']['url']
                ?? $thumbnails['high']['url']
                ?? $thumbnails['medium']['url']
                ?? thorius_yt_sync_build_thumbnail_url($video_id);

            $videos[] = array(
                'id' => $video_id,
                'title' => wp_strip_all_tags($item['snippet']['title'] ?? 'YouTube Dersi'),
                'description' => wp_strip_all_tags($item['snippet']['description'] ?? ''),
                'duration_seconds' => $duration,
                'thumbnail_url' => $thumb,
            );
        }

        $page_token = $playlist_body['nextPageToken'] ?? '';
    } while ($page_token !== '');

    return $videos;
}

function thorius_yt_sync_fetch_video_duration(string $video_id, string $api_key): int
{
    $url = add_query_arg(
        array(
            'part' => 'contentDetails',
            'id' => $video_id,
            'key' => $api_key,
        ),
        'https://www.googleapis.com/youtube/v3/videos'
    );

    $response = wp_remote_get($url, array('timeout' => 20));
    if (is_wp_error($response)) {
        return 0;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $iso = $body['items'][0]['contentDetails']['duration'] ?? '';
    return thorius_yt_sync_iso8601_to_seconds($iso);
}

function thorius_yt_sync_iso8601_to_seconds(string $duration): int
{
    if ($duration === '') {
        return 0;
    }

    preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/', $duration, $m);
    $h = isset($m[1]) ? (int) $m[1] : 0;
    $min = isset($m[2]) ? (int) $m[2] : 0;
    $s = isset($m[3]) ? (int) $m[3] : 0;

    return ($h * 3600) + ($min * 60) + $s;
}

function thorius_yt_sync_seconds_to_runtime(int $seconds): array
{
    $hours = (int) floor($seconds / 3600);
    $minutes = (int) floor(($seconds % 3600) / 60);
    $secs = $seconds % 60;

    return array(
        'hours' => (string) $hours,
        'minutes' => (string) $minutes,
        'seconds' => (string) $secs,
    );
}

function thorius_yt_sync_video_already_imported(string $youtube_video_id): bool
{
    $existing_courses = get_posts(array(
        'post_type' => array('courses', 'tutor_course'),
        'post_status' => 'any',
        'meta_key' => THORIUS_YT_SYNC_META,
        'meta_value' => $youtube_video_id,
        'fields' => 'ids',
        'posts_per_page' => 1,
    ));

    return !empty($existing_courses);
}

function thorius_yt_sync_lesson_exists(string $youtube_video_id): bool
{
    return thorius_yt_sync_video_already_imported($youtube_video_id);
}

/**
 * @return int|WP_Error
 */
function thorius_yt_sync_create_topic_for_course(int $course_id, string $topic_title)
{
    $topic_post_type = post_type_exists('topics') ? 'topics' : 'tutor_topic';

    $menu_order = 0;
    if (function_exists('tutor_utils')) {
        $menu_order = (int) tutor_utils()->get_next_course_content_order_id($course_id);
    }

    $topic_id = wp_insert_post(array(
        'post_type' => $topic_post_type,
        'post_title' => $topic_title,
        'post_content' => '',
        'post_status' => 'publish',
        'post_parent' => $course_id,
        'post_author' => get_current_user_id() ?: 1,
        'menu_order' => $menu_order,
    ), true);

    if (is_wp_error($topic_id)) {
        return $topic_id;
    }

    do_action('tutor/topic/created', (int) $topic_id);

    return (int) $topic_id;
}

/**
 * @param array{id:string,title:string,description:string,duration_seconds:int} $video
 * @return int|WP_Error
 * @deprecated Her video artık ayrı kurs; create_topic_for_course kullanın.
 */
function thorius_yt_sync_create_topic_for_video(int $course_id, array $video)
{
    return thorius_yt_sync_create_topic_for_course($course_id, $video['title']);
}

/**
 * @return int|WP_Error
 * @deprecated Tek topic modu kaldırıldı; her video kendi konusunu açar.
 */
function thorius_yt_sync_ensure_topic(int $course_id, int $topic_id, string $topic_title)
{
    if ($topic_id > 0 && get_post($topic_id)) {
        return $topic_id;
    }

    $topic_post_type = post_type_exists('topics') ? 'topics' : 'tutor_topic';

    $new_topic_id = wp_insert_post(array(
        'post_type' => $topic_post_type,
        'post_title' => $topic_title,
        'post_content' => '',
        'post_status' => 'publish',
        'post_parent' => $course_id,
        'post_author' => get_current_user_id() ?: 1,
    ), true);

    if (is_wp_error($new_topic_id)) {
        return $new_topic_id;
    }

    return (int) $new_topic_id;
}

/**
 * @param array{id:string,title:string,description:string,duration_seconds:int} $video
 * @return int|WP_Error
 */
function thorius_yt_sync_create_lesson(int $topic_id, array $video)
{
    $lesson_post_type = post_type_exists('lesson') ? 'lesson' : 'tutor_lesson';

    $menu_order = 0;
    if (function_exists('tutor_utils')) {
        $menu_order = (int) tutor_utils()->get_next_course_content_order_id($topic_id);
    }

    $lesson_id = wp_insert_post(array(
        'post_type' => $lesson_post_type,
        'post_title' => $video['title'],
        'post_content' => $video['description'],
        'post_status' => 'publish',
        'post_parent' => $topic_id,
        'post_author' => get_current_user_id() ?: 1,
        'menu_order' => $menu_order,
    ), true);

    if (is_wp_error($lesson_id)) {
        return $lesson_id;
    }

    $runtime = thorius_yt_sync_seconds_to_runtime($video['duration_seconds']);
    $youtube_url = 'https://www.youtube.com/watch?v=' . $video['id'];
    $thumb_url = $video['thumbnail_url'] ?? thorius_yt_sync_build_thumbnail_url($video['id']);

    update_post_meta($lesson_id, '_video', array(
        'source' => 'youtube',
        'source_youtube' => $youtube_url,
        'runtime' => $runtime,
        'poster' => $thumb_url,
        'poster_url' => $thumb_url,
    ));

    thorius_yt_sync_attach_lesson_thumbnail(
        (int) $lesson_id,
        $video['id'],
        $video['title'],
        $thumb_url
    );

    do_action('tutor/lesson/created', $lesson_id);

    return (int) $lesson_id;
}
