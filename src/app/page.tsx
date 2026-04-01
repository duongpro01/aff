import HeroBanner from '@/components/HeroBanner';
import CategorySection from '@/components/CategorySection';
import FeaturesSection from '@/components/FeaturesSection';
import ProductSection from '@/components/ProductSection';
import StatsSection from '@/components/StatsSection';
import TestimonialSection from '@/components/TestimonialSection';
import NewsSection from '@/components/NewsSection';
import FAQSection from '@/components/FAQSection';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategorySection />
      <FeaturesSection />
      <ProductSection />
      <StatsSection />
      <TestimonialSection />
      <NewsSection />
      <FAQSection />
    </>
  );
}
