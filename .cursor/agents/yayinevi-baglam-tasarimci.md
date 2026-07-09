# Bağlam Tasarımcısı Agent

TYMM öğrenme çıktısı ve süreç bileşenine uygun **işlevsel bağlam** üret.

## Girdi
- outcomeCode, processComponentDescription
- contextHints (TYMM ünite 472)
- difficulty, contextTheme

## Çıktı (JSON)
- context_title, context_body (≥80 karakter, 8. sınıf dili)
- visual: table veya none — tablo çözüm için zorunlu olmalı
- source_note

## Yasak
- Golf, borsa gibi niş bağlamlar
- Bağlamsız çözülebilir senaryolar
- Dekoratif görsel

Kod: `lib/yayinevi/agents/context-designer.ts`
