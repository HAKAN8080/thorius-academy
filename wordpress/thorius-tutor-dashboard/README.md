# Thorius Tutor Dashboard

Tutor LMS `kontrol-paneli` sayfasının görünümünü Academy ile uyumlu hale getirir.

## Kurulum

1. `wordpress/thorius-tutor-dashboard/` klasörünü zipleyin veya FTP ile yükleyin:
   ```
   wp-content/plugins/thorius-tutor-dashboard/
   ```
2. WordPress Admin → Eklentiler → **Thorius Tutor Dashboard** → Etkinleştir
3. `/kontrol-paneli/` sayfasını hard refresh ile açın

## Ne yapar?

- Açık zemin + beyaz sol menü (okunaklı koyu metin)
- Altın vurgulu butonlar ve aktif menü çizgisi (Academy accent)
- Yuvarlatılmış istatistik/kurs kartları
- `tutor-screen-frontend-dashboard` body sınıfına uygun seçiciler

Tutor güncellemelerinden sonra görünüm bozulursa CSS seçicileri güncellenmelidir.

## v1.2.1

- **Layout düzeltmesi:** v1.2.0'daki `display:flex`, `width:260px`, `position:sticky` ve mobil `display:flex` kuralları kaldırıldı
- Tutor'un yerel grid yapısı (`.tutor-row` / `.tutor-col-*`) korunur; yalnızca renk/tipografi override edilir
- Beyaz sidebar, altın aktif/hover vurgusu ve Academy kart stilleri korunur

## v1.2.0

- Doğru Tutor body/class seçicileri (`tutor-screen-frontend-dashboard`)
- Sol menü tamamen beyaz kart; koyu mavi sidebar kaldırıldı
- CSS Tutor stillerinden sonra yüklenir (priority 999)

## v1.1.0

- Sol menü açık zemin + okunaklı koyu metin
- Aktif menü öğesinde altın sol çizgi
