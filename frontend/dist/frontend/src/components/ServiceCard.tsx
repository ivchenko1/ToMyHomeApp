import { Link } from 'react-router-dom';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Link
      to={`/uslugodawcy/${service.slug}`}
      className="card card-hover p-6 text-center group cursor-pointer"
    >
      <div className="relative mb-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center transition-transform group-hover:scale-110">
          <span className="text-3xl">{service.icon}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
      <p className="text-sm text-gray-500">od {service.price} zł</p>
    </Link>
  );
};

export default ServiceCard;
