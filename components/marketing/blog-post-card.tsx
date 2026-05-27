import Link from "next/link";
import Image from "next/image";
import { Calendar, User } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { cn } from "@/lib/utils";

interface BlogPostCardProps {
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

export function BlogPostCard({ post, className }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-accent-300 hover:shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-primary-100">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-800 to-primary-950">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-400">
              Thorius Blog
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-primary-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(post.publishedDate)}
          </span>
          {post.author && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              {post.author.name}
            </span>
          )}
        </div>

        <h2 className="mb-2 line-clamp-2 text-lg font-bold text-primary-950 transition-colors group-hover:text-accent-700">
          {post.title}
        </h2>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
          {post.excerpt}
        </p>
        <span className="mt-4 text-sm font-semibold text-accent-700 group-hover:underline">
          Devamını Oku →
        </span>
      </div>
    </Link>
  );
}
