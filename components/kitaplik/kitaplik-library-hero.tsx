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
  "#3d2914",
  "#5c1a1a",
  "#1a3d2e",
  "#4a3728",
  "#2c2a4a",
  "#6b4423",
  "#243b55",
];

function shelfRows(books: ShelfBook[]) {
  const withCovers = books.filter((book) => book.cover_image_url);
  const pool =
    withCovers.length > 0
      ? withCovers
      : books.length > 0
        ? books
        : [{ slug: "placeholder", title: "Thorius", cover_image_url: null }];

  // Fill three shelves by cycling catalog covers / spine colors.
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
    <section className="relative isolate min-h-[min(78vh,820px)] overflow-hidden border-b border-[#2a1c12] text-white">
      <style>{`
        @keyframes shelfLight {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.7; }
        }
        @keyframes shelfDust {
          0% { transform: translateY(0); opacity: 0.15; }
          100% { transform: translateY(-18px); opacity: 0; }
        }
        @keyframes bookSettle {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Library room */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#1a120c_0%,#2a1a10_40%,#140e0a_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(90deg,transparent_0_2px,rgba(0,0,0,0.15)_2px_3px)]"
      />

      {/* Warm lamp light from upper right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-24 h-[70%] w-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,196,120,0.35)_0%,transparent_65%)]"
        style={{ animation: "shelfLight 7s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-[18%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,240,200,0.2),transparent_70%)]"
        style={{ animation: "shelfDust 5s linear infinite" }}
      />

      {/* Bookshelves plane — full-bleed visual */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 flex w-full items-end justify-end md:w-[62%]"
      >
        <div className="relative mr-0 flex h-full w-full max-w-4xl flex-col justify-end gap-3 px-3 pb-8 pt-16 sm:gap-4 sm:px-6 md:mr-4 md:pb-12 lg:mr-10">
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
                      ? "h-[9.5rem] sm:h-[11rem] md:h-[12.5rem]"
                      : bookIndex % 3 === 1
                        ? "h-[8.5rem] sm:h-[10rem] md:h-[11.5rem]"
                        : "h-[10rem] sm:h-[11.5rem] md:h-[13rem]";
                  const tilt =
                    bookIndex % 5 === 0
                      ? "rotate-[-1.5deg]"
                      : bookIndex % 5 === 3
                        ? "rotate-[1.2deg]"
                        : "rotate-0";
                  const spine = SPINE_COLORS[(rowIndex * 6 + bookIndex) % SPINE_COLORS.length];

                  return (
                    <div
                      key={`${book.slug}-${rowIndex}-${bookIndex}`}
                      className={`relative w-[2.6rem] shrink-0 overflow-hidden rounded-[2px] shadow-[2px_4px_10px_rgba(0,0,0,0.45)] sm:w-12 md:w-14 ${height} ${tilt}`}
                      style={{ backgroundColor: spine }}
                    >
                      {book.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.cover_image_url}
                          alt=""
                          className="h-full w-full object-cover object-center opacity-95"
                          loading="eager"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-0.5">
                          <span className="rotate-180 truncate text-[9px] font-semibold tracking-widest text-white/70 [writing-mode:vertical-rl]">
                            {book.title}
                          </span>
                        </div>
                      )}
                      <span className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-black/35 to-transparent" />
                      <span className="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-black/25 to-transparent" />
                    </div>
                  );
                })}
              </div>
              {/* shelf board */}
              <div className="relative mt-1 h-3 rounded-sm bg-[linear-gradient(180deg,#8b633f_0%,#5c3d22_55%,#3d2914_100%)] shadow-[0_8px_16px_rgba(0,0,0,0.45)] sm:h-3.5">
                <div className="absolute inset-x-0 top-0 h-px bg-[#c9a66b]/50" />
                <div className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-black/25 blur-[1px]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Readability scrim — brand stays left */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,#0c1018_0%,#0c1018f2_34%,#0c1018a6_55%,transparent_78%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,16,24,0.35)_0%,transparent_30%,rgba(12,16,24,0.55)_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[min(78vh,820px)] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-accent-300">
          THORIUS KİTAPLIĞI
        </p>
        <h1 className="max-w-xl font-serif text-4xl font-bold tracking-tight md:max-w-2xl md:text-6xl">
          Konuşan Kitaplar
        </h1>
        <p className="mt-5 max-w-lg text-base text-primary-100/90 md:text-lg">
          Kelimeleri takip ederek dinleyin. Basılı sipariş, güvenli e-kitap ve
          sesli okuma — aynı Thorius rafında.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#kitaplik-books"
            className="inline-flex items-center rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-primary-950 transition hover:bg-accent-400"
          >
            Kitapları keşfet
          </a>
          <Link
            href="/kitaplarim"
            className="inline-flex items-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Kitaplarım
          </Link>
        </div>
      </div>
    </section>
  );
}
