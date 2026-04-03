import HeroBanner from '@/components/HeroBanner';
import CategorySection from '@/components/CategorySection';
import BrandSection from '@/components/BrandSection';
import FeaturesSection from '@/components/FeaturesSection';
import ProductSection from '@/components/ProductSection';
import StatsSection from '@/components/StatsSection';
import TestimonialSection from '@/components/TestimonialSection';
import NewsSection from '@/components/NewsSection';
import FAQSection from '@/components/FAQSection';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategorySection />
      <BrandSection />
      <FeaturesSection />
      <ProductSection />
      <StatsSection />
      <TestimonialSection />
      <NewsSection />
      <FAQSection />
    </>
  );
}
