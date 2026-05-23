import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Thorius Academy gizlilik politikası ve kişisel verilerin korunması hakkında bilgilendirme.",
};

export default function GizlilikPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-12">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          Gizlilik Politikası
        </h1>
        <p className="text-sm text-muted-foreground">
          Son güncelleme: 24 Mayıs 2026
        </p>
      </header>

      <div className="prose prose-lg max-w-none prose-headings:text-primary-950 prose-a:text-accent-600">
        <h2>1. Giriş</h2>
        <p>
          Thorius Academy olarak, kullanıcılarımızın gizliliğine önem
          veriyoruz. Bu gizlilik politikası, kişisel verilerinizin nasıl
          toplandığı, kullanıldığı ve korunduğu hakkında bilgi vermektedir.
        </p>

        <h2>2. Toplanan Veriler</h2>
        <p>Platformumuz üzerinden aşağıdaki verileri toplayabiliriz:</p>
        <ul>
          <li>Ad, soyad ve e-posta adresi</li>
          <li>Kurslara kayıt sırasında paylaşılan bilgiler</li>
          <li>Kurs ilerlemesi ve değerlendirme verileri</li>
          <li>Kullanım istatistikleri ve tercihler</li>
          <li>
            Ödeme bilgileri (üçüncü parti ödeme sağlayıcıları tarafından
            işlenir)
          </li>
        </ul>

        <h2>3. Verilerin Kullanımı</h2>
        <p>Toplanan veriler aşağıdaki amaçlarla kullanılır:</p>
        <ul>
          <li>Kişiselleştirilmiş eğitim hizmeti sunmak</li>
          <li>Hesap yönetimi ve iletişim</li>
          <li>Hizmet kalitesini iyileştirmek</li>
          <li>Yasal yükümlülükleri yerine getirmek</li>
        </ul>

        <h2>4. Veri Güvenliği</h2>
        <p>
          Verilerinizi korumak için endüstri standartlarında güvenlik
          önlemleri uyguluyoruz. Tüm veriler şifrelenmiş bağlantı üzerinden
          iletilir ve güvenli sunucularda saklanır.
        </p>

        <h2>5. Üçüncü Taraflar</h2>
        <p>
          Verileriniz, hizmetlerimizi sunmak için kullandığımız güvenilir
          üçüncü taraf hizmet sağlayıcılarıyla paylaşılabilir (ödeme
          işlemcileri, hosting hizmetleri, e-posta servisleri vb.).
        </p>

        <h2>6. Çerezler</h2>
        <p>
          Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler
          kullanmaktadır. Çerez tercihlerinizi tarayıcı ayarlarınızdan
          yönetebilirsiniz.
        </p>

        <h2>7. Haklarınız</h2>
        <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verilerinizin işlenmesini öğrenme</li>
          <li>Verilerinize erişim talep etme</li>
          <li>Verilerinizin düzeltilmesini isteme</li>
          <li>Verilerinizin silinmesini talep etme</li>
          <li>Veri işlemesine itiraz etme</li>
        </ul>

        <h2>8. İletişim</h2>
        <p>
          Gizlilik ile ilgili sorularınız için bizimle iletişime
          geçebilirsiniz:
        </p>
        <p>
          <strong>E-posta:</strong> info@thorius.com.tr
          <br />
          <strong>Adres:</strong> Sandalcı Mecit Cd. No 9/1 Ortaköy / Beşiktaş
          - İstanbul
        </p>
      </div>
    </div>
  );
}
