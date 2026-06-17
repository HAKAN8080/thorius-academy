# Thorius ana sayfa — WordPress’e yükleme (block editör olmadan)

"Yanıt geçerli bir JSON yanıtı değil" hatası, büyük HTML’i Gutenberg ile kaydetmeye çalışınca oluşur. **Editörü atlayın.**

## Adımlar (Plesk File Manager)

### 1. HTML dosyasını yükleyin

Kaynak: `wordpress/thorius-company-homepage-embed.html`

Hedef sunucuda: **`wp-content/thorius-company-home.html`**

- Plesk → thorius.com.tr → **Dosyalar** → `httpdocs/wp-content/`
- Dosyayı `thorius-company-home.html` adıyla yükleyin
- İçeriği embed dosyasından kopyalayın (`<style>` + `<div class="thorius-company">` birlikte)

### 2. MU eklentisini yükleyin

Kaynak: `wordpress/mu-plugins/thorius-company-home.php`

Hedef: **`wp-content/mu-plugins/thorius-company-home.php`**

- `wp-content/mu-plugins/` klasörü yoksa oluşturun
- PHP dosyasını yükleyin

MU eklentileri otomatik aktif olur; WP admin’de ayrıca etkinleştirmeye gerek yok.

### 3. Ana sayfa ayarı

WP Admin → **Ayarlar → Okuma**

- "Ana sayfanız bir statik sayfa" seçili kalsın (mevcut ana sayfa ID’si yeterli)
- Yeni HTML yapıştırmanıza gerek yok — ziyaretçiler dosyadan okunan sayfayı görür

### 4. Test

- https://thorius.com.tr — yeni vitrin
- https://thorius.com.tr/odeme/ — checkout hâlâ çalışmalı
- https://thorius.com.tr/wp-json/ — REST API

## Güncelleme

Sadece `wp-content/thorius-company-home.html` dosyasını düzenleyin.

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| Eski tema ana sayfası görünüyor | `thorius-company-home.html` yolu doğru mu? MU plugin yüklü mü? |
| Beyaz sayfa | HTML dosyası boş/okunamıyor — izinleri 644 yapın |
| JSON hatası devam | Sayfa kaydetmeyi bırakın; MU yöntemi editör kullanmaz |
