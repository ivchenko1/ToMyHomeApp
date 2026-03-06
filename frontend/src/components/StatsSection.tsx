import { useEffect, useRef, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

interface StatItemProps {
  value: string;
  label: string;
  isLoading: boolean;
}

const StatItem = ({ value, label, isLoading }: StatItemProps) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated && !isLoading) {
          setHasAnimated(true);
          animateValue();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, isLoading, value]);

  const animateValue = () => {
    const numericPart = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const suffix = value.replace(/[0-9]/g, ''); // np. "+", "%"
    
    const duration = 1500;
    const steps = 40;
    const increment = numericPart / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericPart) {
        setDisplayValue(value); 
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current).toLocaleString() + suffix);
      }
    }, duration / steps);
  };

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl lg:text-5xl font-black text-white mb-2">
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : (
          displayValue
        )}
      </div>
      <div className="text-white/80">{label}</div>
    </div>
  );
};

const formatStatNumber = (num: number, suffix: string = '+'): string => {
  if (num === 0) return `0${suffix}`;
  
  if (num < 10) {
    return `${num}${suffix}`;
  } else if (num < 100) {
    const rounded = Math.floor(num / 5) * 5;
    return `${rounded}${suffix}`;
  } else if (num < 1000) {
    const rounded = Math.floor(num / 50) * 50;
    return `${rounded}${suffix}`;
  } else {
    const rounded = Math.floor(num / 500) * 500;
    return `${rounded.toLocaleString()}${suffix}`;
  }
};

const calculatePositivePercentage = (reviews: any[]): string => {
  if (reviews.length === 0) return '0%';
  const positive = reviews.filter(r => r.rating >= 4).length;
  const percentage = Math.round((positive / reviews.length) * 100);
  return `${percentage}%`;
};

const countUniqueCities = (providers: any[]): number => {
  const cities = new Set<string>();
  providers.forEach(p => {
    if (p.location?.city) {
      cities.add(p.location.city.toLowerCase());
    } else if (p.locationString) {
      const city = p.locationString.split(',')[0]?.trim();
      if (city) cities.add(city.toLowerCase());
    }
  });
  return cities.size;
};

const StatsSection = () => {
  const [stats, setStats] = useState([
    { value: '0+', label: 'Zadowolonych klientów' },
    { value: '0+', label: 'Specjalistów' },
    { value: '0', label: 'Miast w Polsce' },
    { value: '0%', label: 'Pozytywnych opinii' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const clientsCount = usersSnapshot.docs.filter(
          doc => doc.data().accountType === 'client'
        ).length;

        const providersSnapshot = await getDocs(collection(db, 'providers'));
        const providers = providersSnapshot.docs.map(doc => doc.data());
        const providersCount = providers.length;

        const citiesCount = countUniqueCities(providers);

        const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());

        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('status', '==', 'completed')
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const completedBookings = bookingsSnapshot.size;

        const happyCustomers = Math.max(clientsCount, completedBookings);

        setStats([
          { 
            value: formatStatNumber(happyCustomers), 
            label: 'Zadowolonych klientów' 
          },
          { 
            value: formatStatNumber(providersCount), 
            label: 'Specjalistów' 
          },
          { 
            value: citiesCount > 0 ? formatStatNumber(citiesCount, '') : '1', 
            label: 'Miast w Polsce' 
          },
          { 
            value: calculatePositivePercentage(reviews), 
            label: 'Pozytywnych opinii' 
          },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats([
          { value: '0+', label: 'Zadowolonych klientów' },
          { value: '0+', label: 'Specjalistów' },
          { value: '1', label: 'Miast w Polsce' },
          { value: '100%', label: 'Pozytywnych opinii' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-primary to-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              label={stat.label}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
