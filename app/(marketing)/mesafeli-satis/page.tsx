import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description: "Thorius Academy mesafeli satış sözleşmesi.",
};

export default function MesafeliSatisPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-12">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          Mesafeli Satış Sözleşmesi
        </h1>
        <p className="text-sm text-muted-foreground">
          Son güncelleme: 26 Mayıs 2026
        </p>
      </header>

      <div className="prose prose-lg max-w-none prose-headings:text-primary-950 prose-a:text-accent-600">
        <p>
          İşbu Mesafeli Satış Sözleşmesi, 6502 sayılı Tüketicinin Korunması
          Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri
          uyarınca düzenlenmiştir.
        </p>

        <h2>1. Taraflar</h2>
        <p>
          <strong>Satıcı:</strong> Thorius Eğitim ve Danışmanlık Ltd. Şti.
          <br />
          <strong>Adres:</strong> Sandalcı Mecit Cd. No 9/1 Ortaköy / Beşiktaş,
          İstanbul
          <br />
          <strong>E-posta:</strong> info@thorius.com.tr
          <br />
          <strong>Telefon / WhatsApp:</strong> +90 543 132 35 03
        </p>
        <p>
          <strong>Alıcı:</strong> Thorius Academy platformu üzerinden dijital
          eğitim hizmeti satın alan gerçek veya tüzel kişi.
        </p>

        <h2>2. Sözleşmenin Konusu</h2>
        <p>
          İşbu sözleşmenin konusu, Alıcı&apos;nın Satıcı&apos;ya ait{" "}
          <strong>academy.thorius.com.tr</strong> internet sitesi üzerinden
          elektronik ortamda sipariş verdiği, aşağıda nitelikleri ve satış
          fiyatı belirtilen dijital eğitim / kurs hizmetinin satışı ve
          teslimine ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir.
        </p>

        <h2>3. Ürün / Hizmet Bilgileri</h2>
        <p>
          Satın alınan hizmet; video dersler, dijital materyaller, sınavlar ve
          sertifika içeren online eğitim paketlerinden oluşur. Hizmetin temel
          nitelikleri ilgili kurs sayfasında yer almaktadır. Tüm fiyatlar Türk
          Lirası (TRY) cinsinden olup yasal vergiler dahildir.
        </p>

        <h2>4. Ödeme ve Teslimat</h2>
        <ul>
          <li>
            Ödeme, güvenli ödeme altyapısı üzerinden kredi/banka kartı ile
            gerçekleştirilir.
          </li>
          <li>
            Dijital hizmet, ödemenin onaylanmasının ardından Alıcı&apos;nın
            kayıtlı e-posta adresine gönderilen erişim bilgileri ile teslim
            edilir.
          </li>
          <li>
            Teslimat süresi, ödeme onayından itibaren en geç 24 saat içindedir.
          </li>
        </ul>

        <h2>5. Cayma Hakkı</h2>
        <p>
          Dijital içerik niteliğindeki hizmetlerde, hizmetin ifasına
          (kursa/derse erişimin sağlanmasına) başlanmamış olması koşuluyla
          sözleşme tarihinden itibaren <strong>14 gün</strong> içinde cayma
          hakkı kullanılabilir. Alıcı&apos;nın onayı ile ifaya başlanan
          hizmetlerde cayma hakkı kullanılamaz.
        </p>
        <p>
          Cayma bildirimi <strong>info@thorius.com.tr</strong> adresine
          e-posta yoluyla iletilir.
        </p>

        <h2>6. Genel Hükümler</h2>
        <ul>
          <li>
            Alıcı, sipariş öncesinde ön bilgilendirme formunu ve işbu sözleşmeyi
            elektronik ortamda teyit ettiğini kabul eder.
          </li>
          <li>
            Uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri
            yetkilidir.
          </li>
          <li>
            Satıcı, teknik nedenlerle hizmet sunumunu geçici olarak
            durdurabilir; bu durumda Alıcı bilgilendirilir.
          </li>
        </ul>

        <h2>7. Yürürlük</h2>
        <p>
          Alıcı, platform üzerinden ödeme yaparak işbu sözleşmenin tüm
          hükümlerini okuduğunu, anladığını ve kabul ettiğini beyan eder.
        </p>

        <p className="text-sm text-muted-foreground">
          Bu metin ön bilgilendirme amaçlıdır. Güncel ve bağlayıcı sözleşme
          metni için info@thorius.com.tr adresinden bizimle iletişime
          geçebilirsiniz.
        </p>
      </div>
    </div>
  );
}
