import Link from 'next/link';
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

const POSTS_PER_PAGE = 12;

export default async function TinTucPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const publishedPosts = (postsData as Post[]).filter(p => p.status === 'published');
  const totalPages = Math.ceil(publishedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = publishedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tin tức Pickleball</h1>
      <p className="text-gray-500 mb-8">Cập nhật tin tức, hướng dẫn và review mới nhất về pickleball</p>

      {paginatedPosts.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map(post => (
            <Link
              key={post.id}
              href={`/tin-tuc/${post.slug}`}
              className="product-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Placeholder image */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20" />
              <div className="p-4">
                <span className={`badge ${categoryBadgeClass(post.category)} mb-2`}>
                  {post.category}
                </span>
                <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 mt-2 mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(post.pubDate)}</span>
                  <span>{post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10">
          {currentPage > 1 && (
            <Link
              href={`/tin-tuc?page=${currentPage - 1}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
            >
              Trước
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Link
              key={page}
              href={`/tin-tuc?page=${page}`}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                page === currentPage
                  ? 'bg-primary text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={`/tin-tuc?page=${currentPage + 1}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
            >
              Sau
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
