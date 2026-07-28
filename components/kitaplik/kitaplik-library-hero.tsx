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

  const needed = 12;
  const filled: ShelfBook[] = [];
  for (let i = 0; i < needed; i += 1) {
    filled.push(pool[i % pool.length]!);
  }
  return [filled.slice(0, 4), filled.slice(4, 8), filled.slice(8, 12)] as const;
}

/**
 * Kitaplik hero — 3 blocks: copy | Aurora video | bookshelf.
 */
export function KitaplikLibraryHero({ books }: KitaplikLibraryHeroProps) {
  const rows = shelfRows(books);

  return (
    <section className="relative isolate overflow-hidden border-b border-primary-900 text-white">
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
        className="pointer-events-none absolute -right-16 -top-20 h-[75%] w-[55%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.2)_0%,transparent_62%)]"
        style={{ animation: "shelfLight 8s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/2 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,120,200,0.16),transparent_60%)]"
      />

      <div className="relative z-10 mx-auto grid min-h-[min(82vh,880px)] w-full max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:gap-10 md:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,0.95fr)] lg:gap-8 lg:px-8 lg:py-20">
        {/* 1 — Yazı */}
        <div
          className="max-w-md justify-self-start text-left"
          style={{ animation: "heroFadeUp 0.7s ease-out both" }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent-300/90 sm:text-sm">
            Thorius Kitaplığı
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.65rem] md:leading-tight">
            Yeni Nesil Kitaplık
          </h1>

          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{ animation: "heroFadeUp 0.7s ease-out 0.12s both" }}
          >
            <a
              href="#kitaplik-books"
              className="inline-flex items-center rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-primary-950 transition hover:bg-accent-400"
            >
              Kitapları Keşfet
            </a>
            <Link
              href="/kitaplarim"
              className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Hemen Okumaya Başla
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
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

        {/* 2 — Video */}
        <div
          className="relative w-full max-w-sm justify-self-center"
          style={{ animation: "heroFadeUp 0.75s ease-out 0.08s both" }}
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

        {/* 3 — Kitaplık rafları */}
        <div
          aria-hidden
          className="relative flex w-full flex-col justify-end gap-2.5 self-end pb-2 pt-4 sm:gap-3 lg:pb-0"
          style={{ animation: "heroFadeUp 0.75s ease-out 0.14s both" }}
        >
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              <div
                className="flex items-end justify-center gap-1.5 sm:gap-2 lg:justify-end"
                style={{
                  animation: `bookSettle 0.7s ease-out ${0.1 * rowIndex}s both`,
                }}
              >
                {row.map((book, bookIndex) => {
                  const height =
                    bookIndex % 3 === 0
                      ? "h-[6.5rem] sm:h-[7.5rem] lg:h-[8.5rem]"
                      : bookIndex % 3 === 1
                        ? "h-[5.75rem] sm:h-[6.75rem] lg:h-[7.75rem]"
                        : "h-[7rem] sm:h-[8rem] lg:h-[9rem]";
                  const tilt =
                    bookIndex % 5 === 0
                      ? "rotate-[-1.5deg]"
                      : bookIndex % 5 === 3
                        ? "rotate-[1.2deg]"
                        : "rotate-0";
                  const visibility =
                    bookIndex === 3 ? "hidden sm:block" : "";
                  const spine =
                    SPINE_COLORS[(rowIndex * 4 + bookIndex) % SPINE_COLORS.length];

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
    </section>
  );
}
