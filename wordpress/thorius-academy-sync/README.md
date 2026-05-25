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

## Not

Bu eklenti yalnızca academy vitrin önbelleğini yeniler. Satış için Supabase `course_products` eşleştirmesi hâlâ manuel yapılmalıdır.
