# WooCommerce — Kitap Mağazası Kurulumu

`shop.thorius.com.tr` vitrini WooCommerce Store API üzerinden **Kitap** kategorisindeki ürünleri listeler. Ödeme `wp.thorius.com.tr/odeme` üzerinden PayTR ile yapılır.

## 1. Ürün kategorisi

1. WP Admin → **Ürünler → Kategoriler**
2. Yeni kategori: **Kitap**
3. Slug: `kitap` (`.env` içindeki `SHOP_WC_CATEGORY_SLUG` ile aynı olmalı)

## 2. Kitap ürünü ekleme

1. **Ürünler → Yeni ekle**
2. Ürün tipi: **Basit ürün**
3. **Sanal** kutusunu işaretlemeyin (fiziksel kitap)
4. Fiyat, kapak görseli, stok miktarı
5. Kategori: **Kitap**
6. Yayınla

**Önemli:** Kitap WC ürün ID’lerini `course_products` veya `career_path_products` tablolarına eklemeyin. Aksi halde sipariş sonrası yanlışlıkla kurs kaydı açılabilir.

## 3. Kargo

1. WooCommerce → **Ayarlar → Gönderim**
2. **Gönderim bölgesi** → Türkiye
3. **Sabit fiyat** veya ücretsiz kargo eşiği ekleyin

## 4. Ödeme

Mevcut **PayTR** + `thorius-checkout` eklentisi aynen kullanılır. Ek ayar gerekmez.

## 5. DNS ve Vercel

1. Vercel → proje → **Domains** → `shop.thorius.com.tr`
2. DNS: `shop` CNAME → `cname.vercel-dns.com`
3. Vercel env:
   - `NEXT_PUBLIC_SHOP_SITE_URL=https://shop.thorius.com.tr`
   - `SHOP_WC_CATEGORY_SLUG=kitap`

## 6. Test

1. `https://shop.thorius.com.tr` → kitap grid
2. **Satın al** → `wp.thorius.com.tr/odeme/?add-to-cart=...`
3. Test siparişi sonrası Academy panelde **yeni kurs kaydı oluşmamalı**
