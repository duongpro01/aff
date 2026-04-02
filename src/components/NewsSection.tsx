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
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--foreground)]">Latest News</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post: any, i: number) => (
            <Link key={post.slug} href={`/tin-tuc/${post.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className={`flex h-48 items-center justify-center bg-gradient-to-br ${gradients[i % gradients.length]}`}>
                <span className="text-4xl font-bold text-white/30">WS</span>
              </div>
              <div className="p-5">
                <span className="badge bg-primary/10 text-primary">{post.category}</span>
                <h3 className="mt-3 text-base font-semibold leading-snug text-[var(--foreground)] group-hover:text-primary">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--gray-500)]">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <time className="text-xs text-[var(--gray-400)]">{post.pubDate}</time>
                  <span className="text-sm font-medium text-accent group-hover:underline">Read more</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
