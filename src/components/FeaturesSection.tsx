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
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
          Why Shop With Us
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-foreground">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
