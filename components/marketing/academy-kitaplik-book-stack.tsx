import type { KitaplikPromoBook } from "@/lib/kitaplik/academy-promo-books";

const STACK_TRANSFORMS = [
  "rotate-[-10deg] -translate-x-6 translate-y-4",
  "rotate-[-4deg] -translate-x-2 translate-y-2",
  "rotate-[2deg] translate-x-1",
  "rotate-[7deg] translate-x-4 -translate-y-2",
  "rotate-[12deg] translate-x-8 -translate-y-4",
] as const;

const COMPACT_STACK_TRANSFORMS = [
  "rotate-[-8deg] -translate-x-3 translate-y-2",
  "rotate-[-3deg] -translate-x-1 translate-y-1",
  "rotate-[3deg] translate-x-0.5",
  "rotate-[8deg] translate-x-2.5 -translate-y-1",
] as const;

interface AcademyKitaplikBookStackProps {
  books: KitaplikPromoBook[];
  bookLinkAria: (title: string) => string;
  bookHref: (slug: string) => string;
  stackLabel: string;
  variant?: "default" | "compact";
  maxBooks?: number;
}

export function AcademyKitaplikBookStack({
  books,
  bookLinkAria,
  bookHref,
  stackLabel,
  variant = "default",
  maxBooks,
}: AcademyKitaplikBookStackProps) {
  const visibleBooks = maxBooks ? books.slice(0, maxBooks) : books;

  if (visibleBooks.length === 0) {
    return null;
  }

  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "relative mx-auto flex h-[7.5rem] w-full max-w-[7rem] items-end justify-center sm:h-[8.5rem] sm:max-w-[7.5rem]"
          : "relative mx-auto flex h-[min(22rem,52vw)] w-full max-w-[20rem] items-end justify-center sm:h-[24rem] sm:max-w-[22rem]"
      }
    >
      <span className="sr-only">{stackLabel}</span>
      {visibleBooks.map((book, index) => (
        <a
          key={book.id}
          href={bookHref(book.slug)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={bookLinkAria(book.title)}
          className={`absolute bottom-2 block origin-bottom transition-transform duration-300 hover:z-20 hover:scale-[1.04] focus-visible:z-20 focus-visible:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ${
            isCompact
              ? `w-[42%] max-w-[3.25rem] ${COMPACT_STACK_TRANSFORMS[index] ?? COMPACT_STACK_TRANSFORMS[COMPACT_STACK_TRANSFORMS.length - 1]}`
              : `bottom-4 w-[38%] max-w-[9.5rem] ${STACK_TRANSFORMS[index] ?? STACK_TRANSFORMS[STACK_TRANSFORMS.length - 1]}`
          }`}
          style={{ zIndex: index + 1 }}
        >
          <div
            className={`overflow-hidden border border-white/80 bg-white ring-1 ring-primary-900/10 ${
              isCompact
                ? "rounded-sm shadow-[0_10px_24px_-10px_rgba(11,30,63,0.5)]"
                : "rounded-md shadow-[0_18px_40px_-12px_rgba(11,30,63,0.45)]"
            }`}
          >
            <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200">
              {book.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.cover_image_url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>
          </div>
        </a>
      ))}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[100%] bg-primary-950/15 blur-md ${
          isCompact ? "h-4 w-[68%]" : "h-8 w-[72%]"
        }`}
        aria-hidden="true"
      />
    </div>
  );
}
