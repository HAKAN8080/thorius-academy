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

### v1.6.2 — Odeme sonrasi yonlendirme
- PayTR / WooCommerce teşekkür sayfasindan otomatik **academy.thorius.com.tr/kurslar** yonlendirmesi
- Dis domain icin `allowed_redirect_hosts`; JS + link yedegi

### v1.6.1 — PayTR aciklama
- Taksit aciklama metni kaldirildi; yalnizca **Kredi/Banka Karti (PayTR)** etiketi

### v1.6.0 — Telefon alani
- Fatura detaylarina zorunlu **Telefon** alani eklendi
- Academy profilindeki telefon odeme sayfasina onceden doldurulur

### v1.5.9 — PayTR logo
- Ayri gizlilik paragrafi kaldirildi; sartlar onay kutusunda birlestirildi
- Metin cumle basi buyuk harf
- Fatura kutusu altinda PayTR guven rozeti

### v1.5.7 — Sepet duzen duzeltmesi
- "Sepet toplamlari" basligi okunabilir (beyaz yazi, lacivert zemin)
- Urun listesi + kupon sidebar ile ayni hizada (flex)
- Odeme butonu: **ODEME**

### v1.5.6 — Sepet duzeni
- Toplam + odeme butonu urun listesinin saginda (kompakt sidebar)
- Dijital kurslarda miktar duzenlenemez (her zaman 1)

### v1.5.5 — Sepet sayfasi UI
- Urun adi okunabilir (lacivert metin)
- Fiyat + miktar hizali kart satiri
- Lacivert toplam karti, altin odeme butonu

### v1.5.4 — Checkout UI
- Sag panel lacivert kutu; kaydirinca sticky kalir
- **Sepeti guncelle** butonu fatura detaylari kutusunun altinda

### v1.5.3 — Academy /kurslar
- Tum "magazaya don" ve hata yonlendirmeleri: **https://academy.thorius.com.tr/kurslar**

### v1.5.2 — Magaza yonlendirmesi kaldirildi
- Bos sepet / hata sonrasi magaza yerine **academy.thorius.com.tr/kurslar**
- `?add-to-cart=` magaza sayfasina duserse otomatik `/odeme/` ye yonlenir
- "Magazaya geri don" → "Kurslara don"

### v1.5.1 — Sepet uyari duzeltmesi
- "Zaten sepetinizde" + bos sepet celiskisi giderildi
- Urun sepetteyse tekrar ekleme yerine odeme/sepete yonlendirme

### v1.5.0 — Sepet erişimi
- `/sepet/` artık engellenmiyor; adet düzenleyebilir / ürün silebilirsiniz
- Ödeme sayfasında fatura kutusunun altında **Sepeti güncelle** butonu
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
- Teşekkür sayfasından **academy.thorius.com.tr/kurslar** adresine yönlendirilir

### UI
- Kupon kutusu ikon düzeltmesi
- PayTR açıklama metni okunabilir renk
- Sağ panel (fiyat kutusu) sticky

## Test

1. `https://thorius.com.tr/odeme/?add-to-cart=3055` açın
2. Yalnızca ad, soyad ve e-posta alanları görünmeli
3. Sipariş tamamlanabilmeli (PayTR test modu veya canlı)
