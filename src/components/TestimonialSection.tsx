'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import 'swiper/css';

const testimonials = [
  {
    name: 'Sarah M.',
    initials: 'SM',
    color: 'bg-pink-500',
    rating: 5,
    text: 'Great selection and fast discreet shipping. The product quality exceeded my expectations. Will definitely be ordering again!',
  },
  {
    name: 'James R.',
    initials: 'JR',
    color: 'bg-blue-500',
    rating: 5,
    text: 'Excellent customer service and the best prices I\'ve found online. The packaging was completely discreet which I really appreciated.',
  },
  {
    name: 'Emily K.',
    initials: 'EK',
    color: 'bg-purple-500',
    rating: 5,
    text: 'Love the variety of brands available. Free shipping over $69 is a great deal. My order arrived faster than expected!',
  },
  {
    name: 'Michael T.',
    initials: 'MT',
    color: 'bg-green-500',
    rating: 5,
    text: 'Bought as a gift and the quality is amazing. Afterpay option made it easy to manage. Highly recommend this store!',
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-[var(--gray-50)] py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <h2 className="mb-6 sm:mb-8 md:mb-12 text-center text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          What Our Customers Say
        </h2>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          loop
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.name}>
              <div className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 md:p-6 shadow-sm h-full">
                <Quote className="mb-3 sm:mb-4 h-6 w-6 sm:h-8 sm:w-8 text-primary/20" />
                <p className="mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed text-[var(--gray-600)]">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold text-white ${t.color}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                      {t.name}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[var(--warning)] text-[var(--warning)]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
