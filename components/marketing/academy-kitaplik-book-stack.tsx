import type { KitaplikPromoBook } from "@/lib/kitaplik/academy-promo-books";

const STACK_TRANSFORMS = [
  "rotate-[-10deg] -translate-x-6 translate-y-4",
  "rotate-[-4deg] -translate-x-2 translate-y-2",
  "rotate-[2deg] translate-x-1",
  "rotate-[7deg] translate-x-4 -translate-y-2",
  "rotate-[12deg] translate-x-8 -translate-y-4",
] as const;

interface AcademyKitaplikBookStackProps {
  books: KitaplikPromoBook[];
  coverAlt: (title: string) => string;
  stackLabel: string;
}

export function AcademyKitaplikBookStack({
  books,
  coverAlt,
  stackLabel,
}: AcademyKitaplikBookStackProps) {
  if (books.length === 0) {
    return null;
  }

  return (
    <div
      className="relative mx-auto flex h-[min(22rem,52vw)] w-full max-w-[20rem] items-end justify-center sm:h-[24rem] sm:max-w-[22rem]"
      aria-hidden={books.length <= 1 ? undefined : true}
    >
      <span className="sr-only">{stackLabel}</span>
      {books.map((book, index) => (
        <div
          key={book.id}
          className={`absolute bottom-4 w-[38%] max-w-[9.5rem] origin-bottom transition-transform duration-300 ${STACK_TRANSFORMS[index] ?? STACK_TRANSFORMS[STACK_TRANSFORMS.length - 1]}`}
          style={{ zIndex: index + 1 }}
        >
          <div className="overflow-hidden rounded-md border border-white/80 bg-white shadow-[0_18px_40px_-12px_rgba(11,30,63,0.45)] ring-1 ring-primary-900/10">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200">
              {book.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.cover_image_url}
                  alt={coverAlt(book.title)}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>
          </div>
        </div>
      ))}
      <div
        className="absolute bottom-0 left-1/2 h-8 w-[72%] -translate-x-1/2 rounded-[100%] bg-primary-950/15 blur-md"
        aria-hidden="true"
      />
    </div>
  );
}
