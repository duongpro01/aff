import Link from 'next/link';
import { Heart, Zap, Lock, Droplets, Sparkles, ShoppingBag } from 'lucide-react';

const categories = [
  { name: 'Vibrators', slug: 'vibrators', description: 'Vibrators & Massagers', icon: Zap, gradient: 'from-pink-500 to-rose-600' },
  { name: 'Dildos', slug: 'dildos', description: 'Dildos, Dongs & Strap Ons', icon: Heart, gradient: 'from-purple-500 to-indigo-600' },
  { name: 'Anal Toys', slug: 'anal-toys', description: 'Plugs, Beads & Prostate', icon: Sparkles, gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Bondage', slug: 'bondage', description: 'Restraints, Cuffs & More', icon: Lock, gradient: 'from-gray-700 to-gray-900' },
  { name: 'Lubes', slug: 'lubes', description: 'Lubricants & Essentials', icon: Droplets, gradient: 'from-green-500 to-emerald-600' },
  { name: 'Lingerie', slug: 'lingerie', description: 'Lingerie & Costumes', icon: ShoppingBag, gradient: 'from-rose-400 to-pink-600' },
];

export default function CategorySection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="group">
                <div className={`bg-gradient-to-br ${cat.gradient} rounded-xl p-6 text-white text-center transition-transform duration-300 group-hover:scale-105 h-full flex flex-col items-center justify-center gap-3`}>
                  <Icon size={36} strokeWidth={1.5} />
                  <h3 className="font-semibold text-base">{cat.name}</h3>
                  <p className="text-xs opacity-90 leading-snug">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
