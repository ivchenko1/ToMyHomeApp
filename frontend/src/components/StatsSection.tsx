import { useEffect, useRef, useState } from 'react';

interface StatItemProps {
  target: number;
  label: string;
  suffix?: string;
}

const StatItem = ({ target, label, suffix = '' }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, target]);

  const animateCount = () => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
  };

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl lg:text-5xl font-black text-white mb-2">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-white/80">{label}</div>
    </div>
  );
};

const StatsSection = () => {
  const stats = [
    { target: 10000, label: 'Zadowolonych klientów', suffix: '+' },
    { target: 500, label: 'Specjalistów', suffix: '+' },
    { target: 50, label: 'Miast w Polsce', suffix: '' },
    { target: 98, label: 'Pozytywnych opinii', suffix: '%' },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-primary to-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              target={stat.target}
              label={stat.label}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
