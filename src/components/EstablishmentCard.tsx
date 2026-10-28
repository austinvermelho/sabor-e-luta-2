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

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${establishment.address}, ${establishment.city} - ${establishment.state}, Brasil`)}`;


  return (
    <div
      onClick={() => onSelect(establishment.id)}
      className={`group cursor-pointer rounded-xl bg-white border p-4.5 transition-all duration-150 flex flex-col justify-between ${
        isSelected
          ? 'border-[#b91c1c] ring-2 ring-[#b91c1c]/20 shadow-xs bg-[#fbf8f3]'
          : 'border-[#e4dcce] hover:border-[#141210] hover:shadow-xs'
      }`}
    >
      <div>
        {/* Unboxed Metadata with woodcut/print accents */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-2 font-medium">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#141210] font-bold flex items-center gap-1 bg-[#f3ede2] px-2 py-0.5 rounded-md border border-[#e4dcce]">
              <span>{categoryInfo.icon}</span>
              <span>{categoryInfo.shortLabel}</span>
            </span>
            <span aria-hidden="true" className="text-[#e4dcce]">·</span>
            <span className="flex items-center gap-0.5 text-neutral-700">
              <MapPin className="w-3 h-3 text-[#b91c1c]" />
              {establishment.city} - {establishment.state}
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-[#b91c1c] hover:text-[#991b1b] flex items-center gap-1 hover:underline font-semibold"
            title="Abrir rota no Google Maps"
          >
            <Compass className="w-3 h-3 text-[#b91c1c]" />
            <span>Google Maps</span>
          </a>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-[#141210] group-hover:text-[#b91c1c] transition-colors leading-tight mb-1.5">
          {establishment.name}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-[#44403c] line-clamp-2 leading-relaxed mb-3">
          {establishment.description}
        </p>

        {/* Tags with ink badge accents */}
        {establishment.tags && establishment.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600 mb-3 font-normal">
            {establishment.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[#f3ede2] text-[#141210] border border-[#e4dcce] text-[11px] font-medium"
              >
                {tag}
              </span>
            ))}
            {establishment.tags.length > 3 && (
              <span className="text-neutral-400 text-[10px] pl-0.5">+{establishment.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Observação / Informação ao público sobre horários */}
        <div className="mb-3 p-2 bg-[#fef3c7]/70 border border-[#fde68a] rounded-lg text-[10.5px] text-[#78350f] italic leading-tight flex items-start gap-1.5">
          <span className="font-bold shrink-0">*</span>
          <span>Recomendamos sempre confirmar horários diretamente com o estabelecimento antes de visitar, pois podem sofrer alterações sem aviso prévio.</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-[#e4dcce] flex items-center justify-between gap-3 text-xs">
        <span className="text-neutral-500 text-[11px] truncate max-w-[200px]">
          {establishment.address}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(establishment);
          }}
          className="inline-flex items-center gap-1 font-bold text-[#b91c1c] hover:text-[#991b1b] hover:bg-[#f3ede2] px-2 py-1 rounded-md transition-colors text-xs shrink-0 cursor-pointer"
        >
          <span>Ver Detalhes</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
