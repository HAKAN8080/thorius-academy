import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Globe,
  Lightbulb,
  MessageCircle,
  Scale,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { InspirationBanner } from "@/components/marketing/inspiration-banner";

const values = [
  { icon: BookOpen, label: "Erişilebilirlik" },
  { icon: GraduationCap, label: "Eğitmen Kalitesi" },
  { icon: Scale, label: "Etik ve Şeffaflık" },
  { icon: Lightbulb, label: "Yenilikçilik" },
  { icon: Users, label: "Demokratik" },
] as const;

const whyThorius = [
  { icon: Globe, text: "%100 online erişim" },
  { icon: GraduationCap, text: "Uzman eğitmen kadrosu" },
  { icon: Trophy, text: "Katılım / başarı belgeleri" },
  { icon: MessageCircle, text: "Eğitmenle etkileşimli öğrenme" },
  { icon: TrendingUp, text: "Kurumsal çözümler ve özel eğitim paketleri" },
] as const;

const team = [
  { name: "Dr. Elif Demir Uğur", role: "Kurucu Ortak" },
  { name: "M. Hakan Uğur", role: "Kurucu Ortak" },
] as const;

export function AboutPageView() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 text-white md:py-20">
        <Container size="narrow" className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
            Eğitimde Yeni Nesil Deneyim
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Thorius Hakkında</h1>
          <p className="mt-6 text-lg leading-relaxed text-primary-100">
            Uzman profesyonellerin bilgi ve deneyimlerini erişilebilir, kaliteli
            ve etki odaklı dijital eğitimlere dönüştüren bir eğitim platformuyuz.
          </p>
        </Container>
      </section>

      <InspirationBanner compact />

      <section className="py-16 md:py-20" aria-labelledby="mission-heading">
        <Container size="narrow">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2
                id="mission-heading"
                className="mb-4 text-2xl font-bold text-primary-950"
              >
                Misyon
              </h2>
              <p className="leading-relaxed text-primary-700">
                Beyaz yaka profesyonellerin bilgi ve deneyimlerini; erişilebilir,
                kaliteli ve etki odaklı eğitimlere dönüştürerek bireylerin ve
                kurumların gelişimine katkı sağlamak.
              </p>
              <p className="mt-4 leading-relaxed text-primary-700">
                Thorius, profesyonellerin iç görü ve tecrübelerini sadece özel
                kurumlara değil, toplumun tamamına açık hale getirerek eğitimde
                fırsat eşitliğine katkıda bulunmayı hedefler. Perakende, İnsan
                Kaynakları, Yazılım ve Planlama – Tedarik Zinciri alanlarında
                25 yıllık deneyimimiz ile sizlere değer katıyoruz.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold text-primary-950">
                Vizyon
              </h2>
              <p className="leading-relaxed text-primary-700">
                Deneyimin ve bilginin sadece kurumlara değil, tüm topluma ait
                olduğu bir geleceği inşa etmek.
              </p>
              <p className="mt-4 leading-relaxed text-primary-700">
                Dijital çağın getirdiği olanakları kullanarak, bilgiyi
                demokratikleştiren, etkileşimli ve sürdürülebilir bir eğitim
                ekosistemi kurmak vizyonumuzun temelidir.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section
        className="border-y border-primary-100 bg-primary-50 py-16"
        aria-labelledby="values-heading"
      >
        <Container size="narrow">
          <h2
            id="values-heading"
            className="mb-10 text-center text-2xl font-bold text-primary-950"
          >
            Değerlerimiz
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {values.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl border border-primary-100 bg-white p-6 text-center shadow-sm"
              >
                <Icon
                  className="mb-3 h-8 w-8 text-accent-600"
                  aria-hidden="true"
                />
                <span className="font-semibold text-primary-900">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20" aria-labelledby="why-heading">
        <Container size="narrow">
          <h2
            id="why-heading"
            className="mb-4 text-center text-2xl font-bold text-primary-950"
          >
            Neden Thorius?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-primary-700">
            Amacımız; bireylerin ve kurumların gelişimini destekleyen,
            sürdürülebilir ve yüksek etkili öğrenme deneyimleri sunmaktır.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {whyThorius.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-primary-100 bg-white px-5 py-4 shadow-sm"
              >
                <Icon
                  className="h-5 w-5 shrink-0 text-accent-600"
                  aria-hidden="true"
                />
                <span className="font-medium text-primary-800">{text}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        className="border-t border-primary-100 bg-primary-900 py-16 text-white"
        aria-labelledby="team-heading"
      >
        <Container size="narrow">
          <h2
            id="team-heading"
            className="mb-10 text-center text-2xl font-bold"
          >
            Ekibimiz
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-primary-700 bg-primary-800/50 p-8 text-center"
              >
                <p className="text-lg font-bold text-white">{member.name}</p>
                <p className="mt-1 text-sm text-accent-400">{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl font-bold text-primary-950">
            Sorularınız mı var?
          </h2>
          <p className="mt-4 text-primary-700">
            Bize iletişim sayfasından kolayca ulaşabilirsiniz.
          </p>
          <Button variant="gold" size="lg" className="mt-8" asChild>
            <Link href="/iletisim">İletişime Geçin</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
