'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import 'swiper/css';

const testimonials = [
  {
    name: 'Nguyễn Văn Minh',
    initials: 'NM',
    color: 'bg-blue-500',
    rating: 5,
    text: 'Mình mua vợt Selkirk ở YeuPick, hàng chính hãng và giao rất nhanh. Nhân viên tư vấn nhiệt tình, giúp mình chọn được cây vợt phù hợp với trình độ.',
  },
  {
    name: 'Trần Thị Hương',
    initials: 'TH',
    color: 'bg-pink-500',
    rating: 5,
    text: 'Giá cả hợp lý, nhiều chương trình khuyến mãi hấp dẫn. Đặc biệt chính sách đổi trả rất thoải mái, mình rất yên tâm khi mua hàng tại đây.',
  },
  {
    name: 'Lê Hoàng Nam',
    initials: 'LN',
    color: 'bg-green-500',
    rating: 5,
    text: 'YeuPick có đầy đủ phụ kiện từ grip, bóng đến túi đựng vợt. Mình mua nguyên bộ ở đây luôn, chất lượng tuyệt vời và giá tốt hơn nhiều nơi khác.',
  },
  {
    name: 'Phạm Quốc Đạt',
    initials: 'PĐ',
    color: 'bg-orange-500',
    rating: 5,
    text: 'Đã mua 3 cây vợt tại YeuPick cho cả gia đình. Dịch vụ chăm sóc khách hàng rất tốt, luôn theo dõi và hỏi thăm sau khi mua. Chắc chắn sẽ quay lại!',
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-[var(--gray-50)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--foreground)]">
          Khách hàng nói gì?
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
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <Quote className="mb-4 h-8 w-8 text-primary/20" />
                <p className="mb-6 text-sm leading-relaxed text-[var(--gray-600)]">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--foreground)]">
                      {t.name}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-[var(--warning)] text-[var(--warning)]"
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
