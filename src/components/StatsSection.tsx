'use client';

import { useEffect, useRef, useState } from 'react';
import { Package, Users, Award, ThumbsUp } from 'lucide-react';

const stats = [
  { icon: Package, target: 1000, suffix: '+', label: 'Products' },
  { icon: Users, target: 50000, suffix: '+', label: 'Customers' },
  { icon: Award, target: 100, suffix: '+', label: 'Brands' },
  { icon: ThumbsUp, target: 99, suffix: '%', label: 'Satisfaction' },
];

function formatNumber(n: number): string {
  return n.toLocaleString('vi-VN');
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounts();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  function animateCounts() {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts(stats.map((s) => Math.round(s.target * eased)));

      if (step >= steps) {
        clearInterval(timer);
        setCounts(stats.map((s) => s.target));
      }
    }, interval);
  }

  return (
    <section ref={sectionRef} className="bg-primary py-10 sm:py-12 md:py-16 text-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-2 sm:mb-3 md:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  {formatNumber(counts[i])}
                  {stat.suffix}
                </div>
                <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-white/80">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
