import Link from 'next/link';
import { Target, Circle, Footprints, Package, Shirt } from 'lucide-react';

const categories = [
  {
    name: 'Vợt Pickleball',
    slug: 'vot',
    description: 'Đa dạng thương hiệu hàng đầu',
    icon: Target,
    gradient: 'from-primary to-primary-light',
  },
  {
    name: 'Bóng Pickleball',
    slug: 'bong',
    description: 'Bóng indoor & outdoor chất lượng',
    icon: Circle,
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Giày Pickleball',
    slug: 'giay',
    description: 'Giày chuyên dụng bám sân tốt',
    icon: Footprints,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Phụ kiện',
    slug: 'phu-kien',
    description: 'Grip, túi, bảo vệ và nhiều hơn',
    icon: Package,
    gradient: 'from-accent to-amber-600',
  },
  {
    name: 'Quần áo',
    slug: 'quan-ao',
    description: 'Trang phục thể thao thoáng mát',
    icon: Shirt,
    gradient: 'from-pink-500 to-rose-600',
  },
];

export default function CategorySection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
          Danh mục sản phẩm
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group"
              >
                <div
                  className={`bg-gradient-to-br ${cat.gradient} rounded-xl p-6 text-white text-center transition-transform duration-300 group-hover:scale-105 h-full flex flex-col items-center justify-center gap-3`}
                >
                  <Icon size={40} strokeWidth={1.5} />
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                  <p className="text-sm opacity-90 leading-snug">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
