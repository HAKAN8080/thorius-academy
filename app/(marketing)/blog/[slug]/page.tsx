import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Container } from "@/components/layout/container";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/wordpress/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts(50);
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.warn("[Blog] generateStaticParams failed:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Yazı Bulunamadı" };
  }

  return {
    title: `${post.title} | Thorius Academy Blog`,
    description: post.excerpt,
  };
}

export const revalidate = 3600;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <header className="border-b border-primary-100 bg-gradient-to-b from-primary-50 to-white py-10 md:py-14">
        <Container size="narrow">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-accent-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Tüm Yazılar
          </Link>

          <h1 className="text-3xl font-bold leading-tight text-primary-950 md:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-primary-600">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {formatDate(post.publishedDate)}
            </span>
            {post.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" aria-hidden="true" />
                {post.author.name}
              </span>
            )}
          </div>
        </Container>
      </header>

      <section className="py-12 md:py-16">
        <Container size="narrow">
          <div
            className="prose prose-lg max-w-none prose-headings:text-primary-950 prose-a:text-accent-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Container>
      </section>
    </article>
  );
}
