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

**Henüz kapsam dışı:** Mevcut Academy kayıtlarının geriye dönük toplu senkronu; satın alma (WC) kayıtları zaten Tutor tarafında oluşuyor olabilir.

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
