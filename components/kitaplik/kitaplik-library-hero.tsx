import Link from "next/link";

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

export function KitaplikLibraryHero({ books }: KitaplikLibraryHeroProps) {
  const rows = shelfRows(books);

  return (
    <section className="relative isolate min-h-[min(82vh,880px)] overflow-hidden border-b border-primary-900 text-white">
      <style>{`
        @keyframes shelfLight {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.72; }
        }
        @keyframes heroFadeUp {
          from { transform: translateY(14px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes accentPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes bookSettle {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Premium tech room — deep navy, not rustic wood wash */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(145deg,#070b14_0%,#0f1a2e_48%,#0a1220_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:56px_56px]"
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

      {/* Bookshelves — product as place */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 flex w-full items-end justify-end md:w-[58%]"
      >
        <div className="relative mr-0 flex h-full w-full max-w-4xl flex-col justify-end gap-3 px-3 pb-8 pt-20 sm:gap-4 sm:px-6 md:mr-4 md:pb-12 lg:mr-8">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              <div
                className="flex items-end justify-center gap-1.5 sm:gap-2 md:justify-end md:gap-2.5"
                style={{
                  animation: `bookSettle 0.7s ease-out ${0.12 * rowIndex}s both`,
                }}
              >
                {row.map((book, bookIndex) => {
                  const height =
                    bookIndex % 3 === 0
                      ? "h-[8rem] sm:h-[9rem] lg:h-[10rem]"
                      : bookIndex % 3 === 1
                        ? "h-[7rem] sm:h-[8rem] lg:h-[9rem]"
                        : "h-[8.5rem] sm:h-[9.5rem] lg:h-[10.5rem]";
                  const tilt =
                    bookIndex % 5 === 0
                      ? "rotate-[-1.5deg]"
                      : bookIndex % 5 === 3
                        ? "rotate-[1.2deg]"
                        : "rotate-0";
                  // Trailing books only appear when the shelf column is wide
                  // enough, so full covers never overflow or get clipped.
                  const visibility =
                    bookIndex === 3
                      ? "hidden sm:block"
                      : bookIndex === 4
                        ? "hidden lg:block"
                        : bookIndex === 5
                          ? "hidden xl:block"
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

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,#070b14_0%,#070b14f5_38%,#070b14bb_58%,transparent_82%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,20,0.25)_0%,transparent_28%,rgba(7,11,20,0.55)_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[min(82vh,880px)] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div
          className="max-w-xl md:max-w-2xl"
          style={{ animation: "heroFadeUp 0.7s ease-out both" }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent-300/90 sm:text-sm">
            Thorius Kitaplığı
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Yeni Nesil Kitaplık
          </h1>

          <p
            className="mt-5 font-serif text-4xl font-bold leading-[1.15] tracking-tight text-accent-400 sm:text-5xl md:text-6xl"
            style={{ animation: "accentPulse 5s ease-in-out infinite" }}
          >
            Oku.
            <br />
            Dinle.
            <br />
            Takip Et.
          </p>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
            Sesli okuma, eş zamanlı metin takibi, e-kitap ve basılı kitap
            deneyimini tek platformda keşfedin.
          </p>

          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{ animation: "heroFadeUp 0.7s ease-out 0.15s both" }}
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
            <li className="text-accent-500/80">·</li>
            <li>Sesli</li>
            <li className="text-accent-500/80">·</li>
            <li>Metin takibi</li>
            <li className="text-accent-500/80">·</li>
            <li>Basılı</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
