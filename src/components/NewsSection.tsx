import Link from 'next/link';
import { getPosts } from '@/lib/data';

const gradients = [
  'from-primary to-primary-light',
  'from-accent to-accent-light',
  'from-blue-500 to-cyan-400',
  'from-green-500 to-emerald-400',
  'from-purple-500 to-pink-400',
  'from-orange-500 to-yellow-400',
];

export default function NewsSection() {
  const posts = getPosts();
  const displayPosts = posts.slice(0, 6);

  if (displayPosts.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <h2 className="mb-6 sm:mb-8 md:mb-12 text-center text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)]">Latest News</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post: any, i: number) => (
            <Link key={post.slug} href={`/tin-tuc/${post.slug}`} className="group overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className={`flex h-32 sm:h-40 md:h-48 items-center justify-center bg-gradient-to-br ${gradients[i % gradients.length]}`}>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/30">WS</span>
              </div>
              <div className="p-3 sm:p-4 md:p-5">
                <span className="badge bg-primary/10 text-primary text-[10px] sm:text-xs">{post.category}</span>
                <h3 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold leading-snug text-[var(--foreground)] group-hover:text-primary line-clamp-2">{post.title}</h3>
                <p className="mt-1.5 sm:mt-2 line-clamp-2 text-xs sm:text-sm text-[var(--gray-500)]">{post.excerpt}</p>
                <div className="mt-3 sm:mt-4 flex items-center justify-between">
                  <time className="text-[10px] sm:text-xs text-[var(--gray-400)]">{post.pubDate}</time>
                  <span className="text-xs sm:text-sm font-medium text-accent group-hover:underline">Read more</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
