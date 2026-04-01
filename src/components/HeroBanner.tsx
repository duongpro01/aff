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
    title: 'Vợt Pickleball Chính Hãng',
    subtitle: 'Khám phá bộ sưu tập vợt từ các thương hiệu hàng đầu thế giới',
    gradient: 'from-primary to-primary-light',
  },
  {
    title: 'Trang Bị Tốt Nhất Cho Bạn',
    subtitle: 'Giày, phụ kiện và quần áo pickleball chất lượng cao',
    gradient: 'from-accent to-amber-600',
  },
  {
    title: 'Chơi Pickleball Cùng YeuPick',
    subtitle: 'Giá tốt nhất - Bảo hành chính hãng - Ship toàn quốc',
    gradient: 'from-gray-900 to-gray-700',
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
            <div
              className={`relative flex items-center justify-center h-screen min-h-[600px] bg-gradient-to-br ${slide.gradient}`}
            >
              <div className="text-center text-white px-4 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90">
                  {slide.subtitle}
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-white text-primary font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors"
                >
                  Mua sắm ngay
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
