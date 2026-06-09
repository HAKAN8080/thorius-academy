# Thorius Academy Sync

WordPress eklentisi — Tutor LMS kursu yayınlandığında veya güncellendiğinde `academy.thorius.com.tr` önbelleğini anında yeniler.

## Kurulum

1. `thorius-academy-sync` klasörünü `wp-content/plugins/` altına yükleyin ve etkinleştirin.
2. **Ayarlar → Thorius Academy Sync** sayfasına gidin.
3. Alanları doldurun:
   - **Etkin**: işaretleyin
   - **Webhook URL**: `https://academy.thorius.com.tr/api/webhooks/wordpress`
   - **Webhook Secret**: Academy `.env` dosyasındaki `WP_WEBHOOK_SECRET` ile aynı değer

## Academy tarafı

`.env` dosyasına ekleyin:

```env
WP_WEBHOOK_SECRET=guclu-rastgele-bir-deger
```

Deploy sonrası endpoint test:

```bash
curl https://academy.thorius.com.tr/api/webhooks/wordpress
```

## Ne zaman tetiklenir?

- Kurs **yayınlandığında** (`course.published`)
- Yayında olan kurs **güncellendiğinde** (`course.updated`) — Tutor LMS Course Builder dahil
- Kurs **taslağa alındığında / yayından kaldırıldığında** (`course.unpublished`)
- Kurs **silindiğinde** (`course.deleted`)

## Fiyat senkronu (Academy vitrin)

Academy kartlarındaki fiyat **Supabase `course_products`** tablosundan okunur; WooCommerce fiyatı otomatik canlı çekilmez.

Webhook şu durumlarda fiyatı Academy'ye yazar:

- Tutor **kursu** kaydedildiğinde / güncellendiğinde (kursa WC ürünü bağlı olmalı: `_tutor_course_product_id`)
- WooCommerce **ürünü** kaydedildiğinde / güncellendiğinde (v1.3.0+) — bağlı kurs varsa fiyat yenilenir

Kurs WooCommerce ürününe bağlı değilse veya hiç webhook gitmemişse Academy'de **Ücretsiz** görünür.

## Academy → Tutor kayıt senkronu (v1.4.0+)

Academy'de ücretsiz kursa kayıt olunduğunda Tutor `kontrol-paneli/enrolled-courses/` listesine de düşmesi için:

- Eklenti **etkin** olmalı ve **Webhook Secret** Academy `WP_WEBHOOK_SECRET` ile aynı olmalı
- WordPress'te güncel `thorius-academy-sync` (v1.4.0+) yüklü olmalı
- Endpoint: `POST /wp-json/thorius/v1/academy-enroll` (HMAC imzalı, e-posta + `course_id`)

## Eski Tutor üyeleri → Academy (v1.6.0+)

thorius.com.tr'de daha önce kayıt olmuş ve kurs satın almış üyeler, Academy'de **aynı e-posta** ile giriş yaptığında kursları ve izleme ilerlemesi otomatik içe aktarılır.

- Endpoint: `POST /wp-json/thorius/v1/academy-user-legacy`
- HMAC imzalı gövde: `email`
- Dönen veri: Tutor kayıtlı kurslar, tamamlanan dersler, ilerleme yüzdesi
- Academy paneli açılışında (en fazla 6 saatte bir) senkron çalışır

**Eski üye için adımlar:**

1. `academy.thorius.com.tr/kayit` veya `/giris` — **thorius.com.tr ile aynı e-posta**
2. İlk kez Academy kullanıyorsa kayıt olun veya parola sıfırlayın
3. `/panel/kurslarim` — eski kurslar ve kaldığı ders görünür

WordPress'te güncel `thorius-academy-sync` **v1.6.0+** yüklü olmalı.

## Toplu üyelik yenileme e-postası (v1.7.0+)

Tüm Tutor kayıtlı üyelere “şifre süreniz doldu” + yeni kurslar (MIT vb.) e-postası göndermek için:

1. WordPress **v1.7.0+** (`/academy-member-list` endpoint)
2. Academy deploy + `RESEND_API_KEY`, `CRON_SECRET`, `WP_WEBHOOK_SECRET`
3. Önce dry-run:

```bash
curl "https://academy.thorius.com.tr/api/admin/membership-renewal-campaign?secret=CRON_SECRET&offset=0&limit=25&dry_run=true"
```

4. Gönderim (25’er batch, `has_more` false olana kadar `offset` artırın):

```bash
curl -X POST "https://academy.thorius.com.tr/api/admin/membership-renewal-campaign?secret=CRON_SECRET&offset=0&limit=25"
```

Opsiyonel: `CAMPAIGN_COURSE_SLUGS=slug1,slug2` ile e-postadaki kursları sabitleyin.

Alıcılar `/yeni-parola` sayfasında şifre belirler; panelde eski kurslar legacy senkron ile gelir.

## Academy kayıt → WordPress hesabı (v1.5.0+)

Academy `/kayit` sonrası aynı e-posta ve şifre ile WordPress/Tutor girişi için:

- Endpoint: `POST /wp-json/thorius/v1/academy-register-user`
- HMAC imzalı gövde: `email`, `full_name`, `password`
- Yeni kullanıcıda WP hesabı Academy şifresiyle açılır; mevcut e-postada şifre **değiştirilmez**

## Coaching

Academy kayıt akışı Coaching hesabı da açabilir (ayrı Supabase veya webhook):

```env
COACHING_SUPABASE_URL=
COACHING_SUPABASE_SERVICE_ROLE_KEY=
# veya
COACHING_REGISTER_WEBHOOK_URL=https://coaching.thorius.com.tr/api/webhooks/academy-register
COACHING_WEBHOOK_SECRET=
```

Academy ve Coaching aynı Supabase projesini kullanıyorsa ek provisioning gerekmez.

## Not
