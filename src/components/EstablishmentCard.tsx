import React from 'react';
import { MapPin, ArrowUpRight, Compass } from 'lucide-react';
import { Establishment } from '../types';
import { CATEGORIES } from '../utils/categories';

interface EstablishmentCardProps {
  establishment: Establishment;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpenDetails: (item: Establishment) => void;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({
  establishment,
  isSelected,
  onSelect,
  onOpenDetails,
}) => {
  const categoryInfo = CATEGORIES[establishment.category] || {
    label: 'Espaço Progressista',
    shortLabel: 'Progressista',
    icon: '🚩',
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${establishment.latitude},${establishment.longitude}`;

  return (
    <div
      onClick={() => onSelect(establishment.id)}
      className={`group cursor-pointer rounded-xl bg-white border p-4.5 transition-all duration-150 flex flex-col justify-between ${
        isSelected
          ? 'border-[#d32f2f] ring-2 ring-[#d32f2f]/20 shadow-xs bg-rose-50/25'
          : 'border-rose-100/90 hover:border-rose-300 hover:bg-rose-50/15 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Unboxed Metadata with soft red accents */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-2 font-medium">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-rose-950 font-semibold flex items-center gap-1 bg-rose-50/80 px-2 py-0.5 rounded-md border border-rose-200/60">
              <span>{categoryInfo.icon}</span>
              <span>{categoryInfo.shortLabel}</span>
            </span>
            <span aria-hidden="true" className="text-rose-200">·</span>
            <span className="flex items-center gap-0.5 text-neutral-600">
              <MapPin className="w-3 h-3 text-[#d32f2f]" />
              {establishment.city} - {establishment.state}
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-rose-700/80 hover:text-[#d32f2f] flex items-center gap-1 hover:underline"
            title="Abrir rota no Google Maps"
          >
            <Compass className="w-3 h-3 text-[#d32f2f]" />
            <span>Google Maps</span>
          </a>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-neutral-900 group-hover:text-[#d32f2f] transition-colors leading-tight mb-1.5">
          {establishment.name}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-3">
          {establishment.description}
        </p>

        {/* Tags with soft red badge accents */}
        {establishment.tags && establishment.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600 mb-3 font-normal">
            {establishment.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-rose-50/60 text-rose-900 border border-rose-100/80 text-[11px]"
              >
                {tag}
              </span>
            ))}
            {establishment.tags.length > 3 && (
              <span className="text-neutral-400 text-[10px] pl-0.5">+{establishment.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-rose-100/80 flex items-center justify-between gap-3 text-xs">
        <span className="text-neutral-500 text-[11px] truncate max-w-[200px]">
          {establishment.address}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(establishment);
          }}
          className="inline-flex items-center gap-1 font-semibold text-[#d32f2f] hover:text-[#b71c1c] hover:bg-rose-50 px-2 py-1 rounded-md transition-colors text-xs shrink-0"
        >
          <span>Ver Detalhes</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
