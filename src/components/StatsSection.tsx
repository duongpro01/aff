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
    <section ref={sectionRef} className="bg-primary py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-3xl font-bold sm:text-4xl">
                  {formatNumber(counts[i])}
                  {stat.suffix}
                </div>
                <div className="mt-1 text-sm text-white/80">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
