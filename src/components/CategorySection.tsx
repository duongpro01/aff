import Link from 'next/link';
import { getCategories } from '@/lib/data';
import { Heart, Zap, Lock, Droplets, Sparkles, ShoppingBag, Star, Users, Gift } from 'lucide-react';
import type { Category } from '@/data/types';

const iconMap: Record<string, any> = {
  'vibrators': Zap,
  'dongs-dildos-strapons': Heart,
  'anal-toys': Sparkles,
  'fetish-bondage': Lock,
  'lubes-essentials': Droplets,
  'lingerie': ShoppingBag,
  'his-toys': Star,
  'her-toys': Gift,
  'couples-toys': Users,
};

const gradientMap: Record<string, string> = {
  'vibrators': 'from-pink-500 to-rose-600',
  'dongs-dildos-strapons': 'from-purple-500 to-indigo-600',
  'anal-toys': 'from-blue-500 to-indigo-600',
  'fetish-bondage': 'from-gray-700 to-gray-900',
  'lubes-essentials': 'from-green-500 to-emerald-600',
  'lingerie': 'from-rose-400 to-pink-600',
  'his-toys': 'from-sky-500 to-blue-600',
  'her-toys': 'from-fuchsia-500 to-pink-600',
  'couples-toys': 'from-violet-500 to-purple-600',
};

export default function CategorySection() {
  const categories = getCategories() as Category[];

  if (categories.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10 text-foreground">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6">
          {categories.map((cat) => {
            const Icon = iconMap[cat.slug] || Sparkles;
            const gradient = gradientMap[cat.slug] || 'from-gray-500 to-gray-700';
            return (
              <Link key={cat.slug} href={`/products/${cat.slug}`} className="group">
                <div className={`bg-gradient-to-br ${gradient} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-white text-center transition-transform duration-300 group-hover:scale-105 h-full flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" strokeWidth={1.5} />
                  <h3 className="font-semibold text-xs sm:text-sm md:text-base">{cat.name}</h3>
                  <p className="text-[10px] sm:text-xs opacity-90 leading-snug line-clamp-2 hidden sm:block">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
