# Thorius YouTube Sync

Manuel form — hiçbir ayar kaydedilmez. Her seferinde doldurup **Kursları Ekle** deyin.

Her YouTube videosu = ayrı ücretsiz Tutor kursu.

## Alanlar

- Etiket
- Playlist ID / URL
- Ek video linkleri
- Kurs adı öneki
- Kategori ID
- Kaynak adı
- Kaynak URL
- Açıklama altı metin

YouTube API key: formda (her seferinde) veya `wp-config.php` içinde:

```php
define('THORIUS_YOUTUBE_API_KEY', 'AIza...');
```

## Not

Aynı YouTube video ID'si WordPress'te zaten kurs olarak varsa atlanır — playlist değişse bile tekrar eklenmez.
