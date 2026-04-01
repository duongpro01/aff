import Link from 'next/link';
import posts from '@/data/posts.json';

const displayPosts = posts.slice(0, 6);

const gradients = [
  'from-primary to-primary-light',
  'from-accent to-accent-light',
  'from-blue-500 to-cyan-400',
  'from-green-500 to-emerald-400',
  'from-purple-500 to-pink-400',
  'from-orange-500 to-yellow-400',
];

export default function NewsSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--foreground)]">
          Tin tức mới nhất
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/tin-tuc/${post.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image placeholder */}
              <div
                className={`flex h-48 items-center justify-center bg-gradient-to-br ${gradients[i % gradients.length]}`}
              >
                <span className="text-4xl font-bold text-white/30">
                  YeuPick
                </span>
              </div>

              <div className="p-5">
                {/* Category badge */}
                <span className="badge bg-primary/10 text-primary">
                  {post.category}
                </span>

                {/* Title */}
                <h3 className="mt-3 text-base font-semibold leading-snug text-[var(--foreground)] group-hover:text-primary">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="mt-2 line-clamp-2 text-sm text-[var(--gray-500)]">
                  {post.excerpt}
                </p>

                {/* Date & Read more */}
                <div className="mt-4 flex items-center justify-between">
                  <time className="text-xs text-[var(--gray-400)]">
                    {post.pubDate}
                  </time>
                  <span className="text-sm font-medium text-accent group-hover:underline">
                    Đọc thêm
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/tin-tuc"
            className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            Xem tất cả tin tức
          </Link>
        </div>
      </div>
    </section>
  );
}
