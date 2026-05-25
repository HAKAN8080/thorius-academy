# Thorius Checkout (WordPress Eklentisi)

WooCommerce ödeme sayfası (`/odeme/`) için kurumsal fatura alanları ve UI düzeltmeleri.

## Kurulum

1. `wordpress/thorius-checkout/` klasörünü zipleyin veya FTP ile şuraya yükleyin:
   ```
   wp-content/plugins/thorius-checkout/
   ```
2. WordPress Admin → Eklentiler → **Thorius Checkout** → Etkinleştir
3. **Önemli:** Görünüm → Özelleştir → Ek CSS bölümünde şu satırı bulun ve `#billing_company_field,` kısmını kaldırın:

   ```css
   /* REMOVE UNUSED */
   #billing_company_field,   ← BU SATIRI SİLİN
   #billing_address_2_field,
   ...
   ```

## Ne yapar?

### Fatura alanları
- **İşletme Adı** — opsiyonel (WooCommerce `billing_company`)
- **Vergi Numarası** — opsiyonel (`billing_vkn`, sipariş meta olarak kaydedilir)
- Telefon + e-posta yan yana, kompakt padding

### UI düzeltmeleri (v1.2)
- Sepet atlanır — `add-to-cart` sonrası doğrudan `/odeme/`
- Ad, soyad, telefon, e-posta alanları ~%60 genişletildi
- Sol panelde PayTR logosu + **Güvenli Ödeme** (yaşam boyu erişim alanının üstü)
- Kupon kutusunda ikon/metin çakışması giderildi
- PayTR açıklama metni koyu sidebar üzerinde beyaz/açık renk

## Test

1. `https://thorius.com.tr/odeme/?add-to-cart=3055` açın
2. İşletme Adı + Vergi Numarası alanlarını görün (zorunlu değil)
3. Kupon satırında ikon ile metin çakışmamalı
4. PayTR açıklaması okunabilir olmalı
