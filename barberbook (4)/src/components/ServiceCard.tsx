import React from 'react';
import { Service } from '../types';
import { Scissors, Ruler, Sparkles, Package } from 'lucide-react';
import { cn } from '../lib/utils';

interface ServiceCardProps {
  service: Service;
  onSelect?: (service: Service) => void;
}

const categoryIcons = {
  corte: Scissors,
  barba: Ruler,
  finalização: Sparkles,
  combo: Package,
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  const Icon = categoryIcons[service.category] || Scissors;

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onSelect?.(service)}
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={service.imageUrl || `https://picsum.photos/seed/${service.name}/800/450`} 
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
          R$ {service.price.toFixed(2)}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Icon size={16} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {service.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">{service.duration} min</span>
          <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
};
