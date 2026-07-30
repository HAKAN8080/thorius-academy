import Link from "next/link";

const HERO_VIDEO_SRC = "/videos/aurora-yayinda.mp4";

interface ShelfBook {
  slug: string;
  title: string;
  cover_image_url: string | null;
}

interface KitaplikLibraryHeroProps {
  books: ShelfBook[];
}

const SPINE_COLORS = [
  "#1e3a5f",
  "#243b55",
  "#2c3e50",
  "#1a3d2e",
  "#3d2914",
  "#4a3728",
  "#5c1a1a",
  "#1f2a44",
];

function shelfRows(books: ShelfBook[]) {
  const withCovers = books.filter((book) => book.cover_image_url);
  const pool =
    withCovers.length > 0
      ? withCovers
      : books.length > 0
        ? books
        : [{ slug: "placeholder", title: "Thorius", cover_image_url: null }];

  const needed = 18;
  const filled: ShelfBook[] = [];
  for (let i = 0; i < needed; i += 1) {
    filled.push(pool[i % pool.length]!);
  }
  return [filled.slice(0, 6), filled.slice(6, 12), filled.slice(12, 18)] as const;
}

/**
 * Kitaplik hero — yazı sol, video orta, kitaplık sağda tam yükseklik.
 */
export function KitaplikLibraryHero({ books }: KitaplikLibraryHeroProps) {
  const rows = shelfRows(books);

  return (
    <section className="relative isolate min-h-[min(88vh,920px)] overflow-hidden border-b border-primary-900 text-white">
      <style>{`
        @keyframes shelfLight {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.72; }
        }
        @keyframes heroFadeUp {
          from { transform: translateY(14px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes yayindaBlink {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.55); }
          50% { opacity: 0.35; box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        }
        @keyframes bookSettle {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
        className="pointer-events-none absolute -right-16 -top-20 h-[75%] w-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.22)_0%,transparent_62%)]"
        style={{ animation: "shelfLight 8s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/2 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,120,200,0.18),transparent_60%)]"
      />

      {/* 3 — Kitaplık: sağda absolute, ekranı dikey kaplar (eski yapı) */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 z-[1] hidden h-full w-[52%] items-end justify-end xl:w-[50%] lg:flex"
      >
        <div className="relative mr-0 flex h-full w-full max-w-none flex-col justify-end gap-3 px-2 pb-8 pt-16 sm:gap-4 sm:px-4 md:pb-10 lg:mr-2 lg:px-5 xl:mr-6">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              <div
                className="flex items-end justify-end gap-1.5 sm:gap-2 md:gap-2.5"
                style={{
                  animation: `bookSettle 0.7s ease-out ${0.12 * rowIndex}s both`,
                }}
              >
                {row.map((book, bookIndex) => {
                  const height =
                    bookIndex % 3 === 0
                      ? "h-[8rem] sm:h-[9rem] lg:h-[10rem] xl:h-[11rem]"
                      : bookIndex % 3 === 1
                        ? "h-[7rem] sm:h-[8rem] lg:h-[9rem] xl:h-[10rem]"
                        : "h-[8.5rem] sm:h-[9.5rem] lg:h-[10.5rem] xl:h-[11.5rem]";
                  const tilt =
                    bookIndex % 5 === 0
                      ? "rotate-[-1.5deg]"
                      : bookIndex % 5 === 3
                        ? "rotate-[1.2deg]"
                        : "rotate-0";
                  const visibility =
                    bookIndex === 3
                      ? "hidden xl:block"
                      : bookIndex === 4
                        ? "hidden xl:block"
                        : bookIndex === 5
                          ? "hidden 2xl:block"
                          : "";
                  const spine =
                    SPINE_COLORS[(rowIndex * 6 + bookIndex) % SPINE_COLORS.length];

                  return (
                    <div
                      key={`${book.slug}-${rowIndex}-${bookIndex}`}
                      className={`relative aspect-[2/3] shrink-0 overflow-hidden rounded-[2px] shadow-[2px_4px_12px_rgba(0,0,0,0.5)] ${height} ${tilt} ${visibility}`}
                      style={{ backgroundColor: spine }}
                    >
                      {book.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.cover_image_url}
                          alt=""
                          className="h-full w-full object-contain object-center opacity-95"
                          loading="eager"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-1">
                          <span className="truncate text-center text-[10px] font-semibold tracking-widest text-white/70">
                            {book.title}
                          </span>
                        </div>
                      )}
                      <span className="pointer-events-none absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-black/45 to-transparent" />
                    </div>
                  );
                })}
              </div>
              <div className="relative mt-1 h-2.5 rounded-sm bg-[linear-gradient(180deg,#3a4558_0%,#1c2433_100%)] shadow-[0_8px_18px_rgba(0,0,0,0.5)] sm:h-3">
                <div className="absolute inset-x-0 top-0 h-px bg-accent-500/35" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Okunabilirlik: soldan kitaplığa yumuşak geçiş */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,#070b14_0%,#070b14f2_22%,#070b14b8_42%,#070b1466_58%,transparent_72%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(7,11,20,0.2)_0%,transparent_30%,rgba(7,11,20,0.45)_100%)]"
      />

      {/* 2 — Video: ekranın gerçek ortası (lg+) */}
      <div
        className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center lg:flex"
        style={{ animation: "heroFadeUp 0.75s ease-out 0.1s both" }}
      >
        <div className="pointer-events-auto w-[min(100%,600px)] xl:w-[640px]">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
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
              className="aspect-[4/5] w-full bg-black object-contain"
              src={HERO_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              aria-label="Aurora — yayında tanıtım videosu"
            >
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

      {/* 1 — Yazı sol */}
      <div className="relative z-10 flex min-h-[min(88vh,920px)] w-full items-center">
        <div className="flex w-full flex-col gap-10 px-4 py-14 sm:px-6 md:px-8 md:py-16 xl:px-10">
          <div
            className="w-full max-w-md shrink-0 text-left lg:max-w-sm xl:max-w-md"
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
              <li>Basılı</li>
            </ul>
          </div>

          {/* Mobil: video yazının altında */}
          <div
            className="relative mx-auto w-full max-w-[min(100%,560px)] sm:max-w-[600px] lg:hidden"
            style={{ animation: "heroFadeUp 0.75s ease-out 0.1s both" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
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
                className="aspect-[4/5] w-full bg-black object-contain"
                src={HERO_VIDEO_SRC}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                controls={false}
                aria-label="Aurora — yayında tanıtım videosu"
              >
                <source src={HERO_VIDEO_SRC} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil / tablet: kitaplık altta tam genişlik */}
      <div
        aria-hidden
        className="relative z-10 border-t border-white/5 px-3 pb-8 pt-2 lg:hidden"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col justify-end gap-3">
          {rows.map((row, rowIndex) => (
            <div key={`m-${rowIndex}`} className="relative">
              <div className="flex items-end justify-center gap-1.5 sm:gap-2">
                {row.slice(0, 4).map((book, bookIndex) => {
                  const height =
                    bookIndex % 2 === 0
                      ? "h-[6.5rem] sm:h-[7.5rem]"
                      : "h-[7.25rem] sm:h-[8.25rem]";
                  const spine =
                    SPINE_COLORS[(rowIndex * 4 + bookIndex) % SPINE_COLORS.length];
                  return (
                    <div
                      key={`m-${book.slug}-${rowIndex}-${bookIndex}`}
                      className={`relative aspect-[2/3] shrink-0 overflow-hidden rounded-[2px] shadow-[2px_4px_12px_rgba(0,0,0,0.5)] ${height}`}
                      style={{ backgroundColor: spine }}
                    >
                      {book.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.cover_image_url}
                          alt=""
                          className="h-full w-full object-contain object-center opacity-95"
                          loading="lazy"
                        />
                      ) : null}
                      <span className="pointer-events-none absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-black/45 to-transparent" />
                    </div>
                  );
                })}
              </div>
              <div className="relative mt-1 h-2.5 rounded-sm bg-[linear-gradient(180deg,#3a4558_0%,#1c2433_100%)] sm:h-3">
                <div className="absolute inset-x-0 top-0 h-px bg-accent-500/35" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
