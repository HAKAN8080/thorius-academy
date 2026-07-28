import Link from "next/link";

const HERO_VIDEO_SRC = "/videos/aurora-yayinda.mp4";

/**
 * Kitaplik homepage hero — copy left, Aurora promo video center-right,
 * blinking YAYINDA badge on the video.
 */
export function KitaplikLibraryHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-primary-900 text-white">
      <style>{`
        @keyframes heroFadeUp {
          from { transform: translateY(14px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes yayindaBlink {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.55); }
          50% { opacity: 0.35; box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes yayindaBlink {
            0%, 100% { opacity: 1; }
          }
        }
      `}</style>

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(145deg,#070b14_0%,#0f1a2e_48%,#0a1220_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:56px_56px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-0 h-[70%] w-[55%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18)_0%,transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/2 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,120,200,0.16),transparent_60%)]"
      />

      <div className="relative z-10 mx-auto grid min-h-[min(78vh,820px)] w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:gap-12 md:py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-14 lg:px-8 lg:py-20">
        <div
          className="max-w-xl justify-self-start text-left"
          style={{ animation: "heroFadeUp 0.7s ease-out both" }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent-300/90 sm:text-sm">
            Thorius Kitaplığı
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Yeni Nesil Kitaplık
          </h1>

          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{ animation: "heroFadeUp 0.7s ease-out 0.12s both" }}
          >
            <a
              href="#kitaplik-books"
              className="inline-flex items-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-primary-950 transition hover:bg-accent-400"
            >
              Kitapları Keşfet
            </a>
            <Link
              href="/kitaplarim"
              className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Hemen Okumaya Başla
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-white/45">
            <li>E-kitap</li>
            <li className="text-accent-500/80" aria-hidden>
              ·
            </li>
            <li>Sesli</li>
            <li className="text-accent-500/80" aria-hidden>
              ·
            </li>
            <li>Metin takibi</li>
            <li className="text-accent-500/80" aria-hidden>
              ·
            </li>
            <li>Basılı</li>
          </ul>
        </div>

        <div
          className="relative w-full max-w-2xl justify-self-center lg:justify-self-end"
          style={{ animation: "heroFadeUp 0.75s ease-out 0.1s both" }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <span
              className="pointer-events-none absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-md bg-accent-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-950"
              style={{ animation: "yayindaBlink 1.35s ease-in-out infinite" }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-primary-950"
              />
              YAYINDA
            </span>

            <video
              className="aspect-video w-full object-cover"
              src={HERO_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Aurora — yayında tanıtım videosu"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
