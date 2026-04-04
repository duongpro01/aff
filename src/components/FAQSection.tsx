'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Is my order discreet?',
    answer: 'Yes! All orders are shipped in plain, unmarked packaging with no indication of the contents. Your bank statement will show a generic business name.',
  },
  {
    question: 'What is your shipping policy?',
    answer: 'We offer free shipping on orders over A$69. Standard delivery takes 2-7 business days. Express delivery (1-3 business days) is also available.',
  },
  {
    question: 'Can I return a product?',
    answer: 'We accept returns within 30 days for unopened items in original packaging. For hygiene reasons, opened intimate products cannot be returned unless faulty.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay, and Buy Now Pay Later options including Afterpay, Zip, and Klarna.',
  },
  {
    question: 'Do you offer a price match guarantee?',
    answer: 'Yes! If you find a lower price on an identical product from an Australian retailer, we will match it. Simply contact our customer service team.',
  },
  {
    question: 'Are all products authentic?',
    answer: 'All products are 100% authentic and sourced directly from manufacturers or authorized distributors. We never sell counterfeit items.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-3 sm:px-4 md:px-6 lg:px-8">
        <h2 className="mb-6 sm:mb-8 md:mb-12 text-center text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Frequently Asked Questions
        </h2>

        <div className="space-y-2 sm:space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-lg sm:rounded-xl border border-[var(--gray-200)] bg-white"
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left transition-colors hover:bg-[var(--gray-50)]"
                >
                  <span className="pr-3 sm:pr-4 text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[var(--gray-400)] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                  <p className="px-4 sm:px-6 pb-3 sm:pb-4 text-xs sm:text-sm leading-relaxed text-[var(--gray-600)]">
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
