import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { cn } from "@/lib/utils";

interface BlogPostListItemProps {
  post: BlogPost;
  className?: string;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function BlogPostListItem({ post, className }: BlogPostListItemProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex items-start justify-between gap-4 border-b border-primary-100 py-6 transition-colors first:pt-0 last:border-b-0 hover:bg-primary-50/60 sm:gap-6 sm:px-4 sm:py-7",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary-500">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
        </div>

        <h2 className="text-lg font-bold leading-snug text-primary-950 transition-colors group-hover:text-accent-700 sm:text-xl">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {post.excerpt}
          </p>
        )}
      </div>

      <ChevronRight
        className="mt-1 h-5 w-5 shrink-0 text-primary-300 transition-colors group-hover:text-accent-600"
        aria-hidden="true"
      />
    </Link>
  );
}
