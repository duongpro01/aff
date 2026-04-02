import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPosts } from '@/lib/data';
const postsData = getPosts();

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  pubDate: string;
  author: string;
  status: string;
}

function categoryBadgeClass(category: string) {
  switch (category) {
    case 'Hướng dẫn': return 'bg-blue-100 text-blue-800';
    case 'Review': return 'bg-purple-100 text-purple-800';
    case 'Tin tức': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = (postsData as Post[]).find(p => p.slug === slug);

  if (!post) {
    return { title: 'Không tìm thấy bài viết' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.pubDate,
    },
  };
}

export default async function TinTucDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = postsData as Post[];
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = posts.filter(
    p => p.id !== post.id && p.category === post.category && p.status === 'published'
  ).slice(0, 3);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-accent transition-colors">Trang chủ</Link>
        <span>&gt;</span>
        <Link href="/tin-tuc" className="hover:text-accent transition-colors">Tin tức</Link>
        <span>&gt;</span>
        <span className="text-gray-700 line-clamp-1">{post.title}</span>
      </nav>

      {/* Header */}
      <article>
        <span className={`badge ${categoryBadgeClass(post.category)}`}>
          {post.category}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>{formatDate(post.pubDate)}</span>
          <span>|</span>
          <span>{post.author}</span>
        </div>

        {/* Featured image placeholder */}
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl mb-8" />

        {/* Content */}
        <div
          className="prose prose-gray max-w-none mb-12 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map(rp => (
              <Link
                key={rp.id}
                href={`/tin-tuc/${rp.slug}`}
                className="product-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10" />
                <div className="p-3">
                  <span className={`badge ${categoryBadgeClass(rp.category)} text-xs`}>
                    {rp.category}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-2">{rp.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(rp.pubDate)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
