import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "Thorius Academy hizmet kullanım koşulları ve sözleşmesi.",
};

export default function KullanimKosullariPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-12">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          Kullanım Koşulları
        </h1>
        <p className="text-sm text-muted-foreground">
          Son güncelleme: 24 Mayıs 2026
        </p>
      </header>

      <div className="prose prose-lg max-w-none prose-headings:text-primary-950 prose-a:text-accent-600">
        <h2>1. Genel Hükümler</h2>
        <p>
          Bu kullanım koşulları, Thorius Academy platformunu
          (&quot;Platform&quot;) kullanımınızı düzenler. Platforma erişerek
          veya hizmetlerimizi kullanarak, bu koşulları kabul etmiş
          sayılırsınız.
        </p>

        <h2>2. Hizmet Tanımı</h2>
        <p>
          Thorius Academy; perakende, insan kaynakları, yapay zeka, liderlik ve
          diğer profesyonel gelişim alanlarında online eğitim ve sertifika
          hizmeti sunan bir platformdur. Hizmetlerimiz; kurs içerikleri, video
          dersler, ödevler, sertifikalar ve eğitmen desteğini kapsamaktadır.
        </p>

        <h2>3. Üyelik ve Hesap Güvenliği</h2>
        <ul>
          <li>
            Platformu kullanabilmek için 18 yaşını doldurmuş olmanız
            gerekmektedir.
          </li>
          <li>
            Üyelik bilgilerinizin doğru ve güncel olmasından sorumlusunuz.
          </li>
          <li>
            Hesap güvenliğinizden ve şifrenizin gizliliğinden tek başınıza
            sorumlusunuz.
          </li>
          <li>
            Hesabınızda yetkisiz erişim fark ettiğinizde derhal bizimle
            iletişime geçmelisiniz.
          </li>
        </ul>

        <h2>4. Ödeme ve Faturalandırma</h2>
        <ul>
          <li>Ücretli kurslarımız için ödeme, kayıt sırasında alınır.</li>
          <li>Tüm fiyatlar Türk Lirası (TL) cinsinden olup KDV dahildir.</li>
          <li>
            Ödemeler güvenli üçüncü parti ödeme sağlayıcıları üzerinden
            gerçekleştirilir.
          </li>
          <li>Fatura bilgileriniz yasal yükümlülükler gereği saklanır.</li>
        </ul>

        <h2>5. İade ve Cayma Hakkı</h2>
        <p>
          Dijital içerikli kurslar için, kursa erişim sağlanmamış olması
          koşuluyla satın alma tarihinden itibaren <strong>14 gün</strong>{" "}
          içinde cayma hakkınızı kullanabilirsiniz. Kursa erişim sağlandıktan
          sonra (ilk dersin izlenmesi vb.) cayma hakkı kullanılamaz.
        </p>

        <h2>6. Fikri Mülkiyet Hakları</h2>
        <p>
          Platform üzerindeki tüm içerikler (videolar, metinler, görseller,
          slaytlar, kurs materyalleri vb.) Thorius Eğitim ve Danışmanlık Ltd.
          Şti. veya ilgili eğitmenlerin fikri mülkiyetidir. Bu içeriklerin
          izinsiz çoğaltılması, dağıtılması, ticari amaçlarla kullanılması
          yasaktır.
        </p>

        <h2>7. Yasaklı Davranışlar</h2>
        <p>Platform kullanımında aşağıdaki davranışlar yasaktır:</p>
        <ul>
          <li>Hesap bilgilerinin başkalarıyla paylaşılması</li>
          <li>Kurs içeriklerinin kayıt altına alınması ve dağıtılması</li>
          <li>Platforma zarar verecek herhangi bir teknik müdahale</li>
          <li>
            Diğer kullanıcılara, eğitmenlere veya personele yönelik saldırgan
            davranışlar
          </li>
          <li>Yasalara aykırı içerik paylaşımı</li>
        </ul>

        <h2>8. Hizmetin Sonlandırılması</h2>
        <p>
          Bu koşulları ihlal eden kullanıcıların hesapları, önceden bildirim
          yapılmaksızın askıya alınabilir veya kapatılabilir. Bu durumda
          kullanım hakkından doğan herhangi bir tazminat talep edilemez.
        </p>

        <h2>9. Sorumluluğun Sınırlandırılması</h2>
        <p>
          Platform &quot;olduğu gibi&quot; sunulmaktadır. Hizmet kesintileri,
          teknik aksaklıklar veya içerik hataları durumunda sorumluluğumuz,
          yasal düzenlemelerin izin verdiği azami sınırla sınırlıdır.
        </p>

        <h2>10. Değişiklikler</h2>
        <p>
          Bu kullanım koşullarını dilediğimiz zaman güncelleme hakkımızı saklı
          tutarız. Önemli değişiklikler hakkında kayıtlı e-posta adresiniz
          üzerinden bilgilendirileceksiniz.
        </p>

        <h2>11. Uyuşmazlıkların Çözümü</h2>
        <p>
          Bu sözleşmeden kaynaklanan uyuşmazlıklarda İstanbul Mahkemeleri ve
          İcra Daireleri yetkilidir. Tüketici Hakem Heyetleri ve Tüketici
          Mahkemeleri parasal sınırları dahilinde yetkilidir.
        </p>

        <h2>12. İletişim</h2>
        <p>
          <strong>Şirket Adı:</strong> Thorius Eğitim ve Danışmanlık Ltd. Şti.
          <br />
          <strong>E-posta:</strong> info@thorius.com.tr
          <br />
          <strong>Adres:</strong> Sandalcı Mecit Cd. No 9/1 Ortaköy / Beşiktaş
          - İstanbul
        </p>
      </div>
    </div>
  );
}
