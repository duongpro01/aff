'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const slides = [
  {
    title: 'Adult Toys & Accessories',
    subtitle: 'Premium products from top brands worldwide',
    gradient: 'from-purple-900 to-pink-700',
  },
  {
    title: 'Discreet & Fast Delivery',
    subtitle: 'Free shipping on orders over A$69',
    gradient: 'from-gray-900 to-gray-700',
  },
  {
    title: 'Best Price Guarantee',
    subtitle: 'Shop with confidence - we match any price',
    gradient: 'from-rose-700 to-red-900',
  },
];

export default function HeroBanner() {
  return (
    <div className="swiper-hero">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={`relative flex items-center justify-center h-[70vh] min-h-[400px] md:h-[80vh] md:min-h-[500px] lg:h-screen lg:min-h-[600px] bg-gradient-to-br ${slide.gradient}`}>
              <div className="text-center text-white px-4 sm:px-6 max-w-3xl mx-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">{slide.title}</h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90">{slide.subtitle}</p>
                <Link href="/products" className="inline-block bg-white text-purple-900 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg hover:bg-gray-100 transition-colors">
                  Shop Now
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
