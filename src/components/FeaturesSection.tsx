import { Shield, Award, Truck, MessageCircle, RefreshCw, Tag } from 'lucide-react';

const features = [
  {
    title: '100% Authentic',
    description: 'All products are genuine and sourced directly from authorized distributors.',
    icon: Shield,
  },
  {
    title: 'Best Price Guarantee',
    description: 'We match any lower price from Australian retailers. Shop with confidence.',
    icon: Tag,
  },
  {
    title: 'Free Shipping',
    description: 'Free discreet shipping on all orders over A$69. Express delivery available.',
    icon: Truck,
  },
  {
    title: 'Expert Support',
    description: 'Our friendly team is available via phone, email, and live chat to help you.',
    icon: MessageCircle,
  },
  {
    title: 'Easy Returns',
    description: '30-day return policy on unopened items. Hassle-free refund process.',
    icon: RefreshCw,
  },
  {
    title: 'Top Quality Brands',
    description: 'Curated selection from 100+ premium brands you know and trust.',
    icon: Award,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10 text-foreground">
          Why Shop With Us
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 sm:gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 text-foreground">{feature.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
