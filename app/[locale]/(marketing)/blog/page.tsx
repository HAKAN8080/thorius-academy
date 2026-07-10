import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { BlogPostListItem } from "@/components/marketing/blog-post-list-item";
import { getBlogPosts } from "@/lib/wordpress/blog";

export const metadata: Metadata = {
  title: "Blog Yazıları | Thorius Academy",
  description:
    "Lojistik, siber güvenlik, İK, yapay zeka ve online eğitim üzerine Thorius Academy blog yazıları.",
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <section className="bg-gradient-to-br from-primary-900 to-primary-700 py-16 text-white md:py-20">
        <Container size="narrow" className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Blog Yazıları</h1>
          <p className="mt-4 text-lg text-primary-100">
            Sektörden güncel içerikler, rehberler ve uzman görüşleri.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="narrow">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Henüz blog yazısı bulunmuyor.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
              {posts.map((post) => (
                <BlogPostListItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
