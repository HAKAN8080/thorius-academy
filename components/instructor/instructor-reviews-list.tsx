import { Star } from "lucide-react";
import type { InstructorCourseReview } from "@/types/instructor";

interface InstructorReviewsListProps {
  reviews: InstructorCourseReview[];
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} yıldız`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "text-primary-200"
          }`}
        />
      ))}
    </div>
  );
}

export function InstructorReviewsList({ reviews }: InstructorReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-primary-100 bg-primary-50/50 p-10 text-center">
        <p className="text-muted-foreground">
          Bu kurs için henüz yorum bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => {
        const reviewedLabel = review.reviewed_at
          ? new Date(review.reviewed_at).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : null;

        return (
          <li
            key={review.id}
            className="rounded-2xl border border-primary-100 bg-white p-5"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-primary-950">
                  {review.student_name ?? "Anonim öğrenci"}
                </p>
                {reviewedLabel && (
                  <p className="text-sm text-muted-foreground">
                    {reviewedLabel}
                  </p>
                )}
              </div>
              <StarRating rating={review.rating} />
            </div>
            {review.review_text ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary-800">
                {review.review_text.replace(/<[^>]+>/g, "").trim()}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Yorum metni yok.
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
