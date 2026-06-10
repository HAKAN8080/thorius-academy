# Thorius Checkout (WordPress Eklentisi)

WooCommerce ödeme sayfası (`/odeme/`) için dijital kurs satışına uygun sade checkout.

## Kurulum

1. `wordpress/thorius-checkout/` klasörünü zipleyin veya FTP ile şuraya yükleyin:
   ```
   wp-content/plugins/thorius-checkout/
   ```
2. WordPress Admin → Eklentiler → **Thorius Checkout** → Etkinleştir
3. **Önemli:** Tema veya Özelleştir → Ek CSS içinde eski checkout gizleme kuralları varsa kaldırın (çakışma yapabilir).

## Ne yapar?

### v1.5.1 — Sepet uyari duzeltmesi
- "Zaten sepetinizde" + bos sepet celiskisi giderildi
- Urun sepetteyse tekrar ekleme yerine odeme/sepete yonlendirme

### v1.5.0 — Sepet erişimi
- `/sepet/` artık engellenmiyor; adet düzenleyebilir / ürün silebilirsiniz
- Ödeme sayfasında **Sepeti düzenle** linki
- Aynı kurs tekrar eklenince x2 olmaz (adet 1'de kalır)
- Dijital ürünlerde max adet = 1

### v1.4.0 — Checkout validation fix
- Gizli zorunlu fatura alanlari (telefon, adres, ulke) otomatik doldurulur
- PayTR icin varsayilan telefon numarasi eklenir
- Diger eklentilerin ekledigi zorunlu fatura alanlari kaldirilir / hatalari temizlenir

### v1.3.0 — Minimal checkout
- Yalnızca **Ad**, **Soyad**, **E-posta** görünür
- Adres, şirket, vergi no, telefon ve ek bilgi alanları kaldırıldı
- Dijital ürün: teslimat adresi istenmez
- WooCommerce/PayTR için görünmeyen varsayılan fatura bilgileri otomatik doldurulur

### Akış
- Academy'den `Hemen Satın Al` → `?add-to-cart=...&billing_email=...`
- Sepet atlanır → doğrudan `/odeme/`
- Ödeme sonrası webhook ile Academy kaydı açılır

### UI
- Kupon kutusu ikon düzeltmesi
- PayTR açıklama metni okunabilir renk
- Sağ panel (fiyat kutusu) sticky

## Test

1. `https://thorius.com.tr/odeme/?add-to-cart=3055` açın
2. Yalnızca ad, soyad ve e-posta alanları görünmeli
3. Sipariş tamamlanabilmeli (PayTR test modu veya canlı)
