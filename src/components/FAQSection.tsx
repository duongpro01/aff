'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Làm sao chọn vợt pickleball phù hợp?',
    answer:
      'Việc chọn vợt phụ thuộc vào trình độ, phong cách chơi và ngân sách của bạn. Người mới nên chọn vợt có mặt rộng, trọng lượng trung bình (7.5-8.2 oz). Bạn có thể liên hệ đội ngũ tư vấn của YeuPick để được hỗ trợ chọn vợt phù hợp nhất.',
  },
  {
    question: 'Chính sách bảo hành như thế nào?',
    answer:
      'Tất cả sản phẩm tại YeuPick đều được bảo hành theo chính sách của nhà sản xuất. Vợt pickleball được bảo hành từ 6-12 tháng tùy thương hiệu. Chúng tôi hỗ trợ khách hàng trong suốt quá trình bảo hành.',
  },
  {
    question: 'Thời gian giao hàng bao lâu?',
    answer:
      'Đơn hàng nội thành TP.HCM được giao trong 1-2 ngày. Các tỉnh thành khác từ 2-5 ngày làm việc. Với đơn hàng trên 500.000đ, bạn được miễn phí giao hàng toàn quốc.',
  },
  {
    question: 'Có hỗ trợ đổi trả không?',
    answer:
      'YeuPick hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi từ nhà sản xuất hoặc không đúng mô tả. Sản phẩm đổi trả cần còn nguyên tem mác và chưa qua sử dụng.',
  },
  {
    question: 'Thanh toán bằng những hình thức nào?',
    answer:
      'Chúng tôi chấp nhận nhiều hình thức thanh toán: chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay), thanh toán khi nhận hàng (COD), và thanh toán qua thẻ tín dụng/ghi nợ.',
  },
  {
    question: 'Sản phẩm có bảo đảm chính hãng không?',
    answer:
      'Tất cả sản phẩm tại YeuPick đều là hàng chính hãng 100%, được nhập khẩu trực tiếp từ nhà sản xuất hoặc nhà phân phối ủy quyền. Mỗi sản phẩm đều có tem chống hàng giả và giấy chứng nhận xuất xứ.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--foreground)]">
          Câu hỏi thường gặp
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-[var(--gray-200)] bg-white"
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[var(--gray-50)]"
                >
                  <span className="pr-4 text-sm font-semibold text-[var(--foreground)]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[var(--gray-400)] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                  <p className="px-6 pb-4 text-sm leading-relaxed text-[var(--gray-600)]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
