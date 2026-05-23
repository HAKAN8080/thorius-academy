import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-12">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          KVKK Aydınlatma Metni
        </h1>
        <p className="text-sm text-muted-foreground">
          Son güncelleme: 24 Mayıs 2026
        </p>
      </header>

      <div className="prose prose-lg max-w-none prose-headings:text-primary-950 prose-a:text-accent-600">
        <h2>1. Veri Sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
          uyarınca, kişisel verileriniz; veri sorumlusu olarak{" "}
          <strong>Thorius Eğitim ve Danışmanlık Ltd. Şti.</strong> tarafından
          aşağıda açıklanan kapsamda işlenebilecektir.
        </p>

        <h2>2. İşlenen Kişisel Veriler</h2>
        <p>Platform üzerinden işlediğimiz kişisel veri kategorileri:</p>
        <ul>
          <li>
            <strong>Kimlik Bilgileri:</strong> Ad, soyad
          </li>
          <li>
            <strong>İletişim Bilgileri:</strong> E-posta adresi, telefon
            numarası (opsiyonel)
          </li>
          <li>
            <strong>Müşteri İşlem Bilgileri:</strong> Kurs kayıt geçmişi,
            ilerleme verileri
          </li>
          <li>
            <strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, oturum
            bilgileri
          </li>
          <li>
            <strong>Finansal Bilgiler:</strong> Ödeme bilgileri (üçüncü taraf
            sağlayıcılar tarafından işlenir)
          </li>
        </ul>

        <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
        <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
        <ul>
          <li>Üyelik kaydı oluşturma ve hesap yönetimi</li>
          <li>Eğitim hizmetlerinin sunulması</li>
          <li>Kurs kayıt, takip ve sertifikalandırma süreçleri</li>
          <li>Müşteri memnuniyeti ve hizmet kalitesinin artırılması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Pazarlama ve tanıtım faaliyetleri (açık rıza halinde)</li>
        </ul>

        <h2>4. Kişisel Verilerin Aktarılması</h2>
        <p>
          Kişisel verileriniz, KVKK&apos;nın 8. ve 9. maddelerinde belirtilen
          şartlar dahilinde; hizmet aldığımız teknoloji sağlayıcılarına
          (Supabase, Vercel, Resend), ödeme kuruluşlarına, yasal
          yükümlülüklerimizin gereği olarak yetkili kamu kurumlarına
          aktarılabilir.
        </p>

        <h2>5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
        <p>
          Kişisel verileriniz; platform üzerinden üyelik formu, iletişim
          formu ve kullanım sırasında otomatik olarak toplanmaktadır. Bu
          veriler; sözleşmenin kurulması ve ifası, yasal yükümlülüklerin yerine
          getirilmesi, meşru menfaat ve açık rıza hukuki sebeplerine dayanarak
          işlenmektedir.
        </p>

        <h2>6. Veri Sahibi Olarak Haklarınız</h2>
        <p>
          KVKK&apos;nın 11. maddesi uyarınca veri sahibi olarak aşağıdaki
          haklara sahipsiniz:
        </p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>
            Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme
          </li>
          <li>
            Kişisel verilerin işlenme amacını ve bunların amacına uygun
            kullanılıp kullanılmadığını öğrenme
          </li>
          <li>
            Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü
            kişileri bilme
          </li>
          <li>
            Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde
            bunların düzeltilmesini isteme
          </li>
          <li>
            KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel
            verilerin silinmesini veya yok edilmesini isteme
          </li>
          <li>
            İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz
            edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya
            çıkmasına itiraz etme
          </li>
          <li>
            Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara
            uğraması hâlinde zararın giderilmesini talep etme
          </li>
        </ul>

        <h2>7. Başvuru Yöntemi</h2>
        <p>
          Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki kanallar
          üzerinden bizimle iletişime geçebilirsiniz:
        </p>
        <p>
          <strong>E-posta:</strong> info@thorius.com.tr
          <br />
          <strong>Adres:</strong> Sandalcı Mecit Cd. No 9/1 Ortaköy / Beşiktaş
          - İstanbul
        </p>
        <p>
          Başvurularınız, talep tarihinden itibaren en geç 30 (otuz) gün
          içinde değerlendirilerek tarafınıza geri dönüş yapılacaktır.
        </p>
      </div>
    </div>
  );
}
