import { Link } from 'react-router-dom';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Link
      to={`/uslugodawcy/${service.slug}`}
      className="block bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
        <span className="text-3xl">{service.icon}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
      {service.price > 0 ? (
        <p className="text-sm text-gray-500">od {service.price} zł</p>
      ) : (
        <p className="text-sm text-gray-500">Zobacz wszystkie</p>
      )}
    </Link>
  );
};

export default ServiceCard;
