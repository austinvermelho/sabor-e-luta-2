import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Instagram, 
  Phone, 
  Globe, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Navigation2,
  Heart,
  Share2,
  Copy,
  Check,
  Clock
} from 'lucide-react';
import { Establishment } from '../types';
import { CATEGORIES } from '../utils/categories';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface EstablishmentModalProps {
  establishment: Establishment | null;
  onClose: () => void;
  onFocusOnMap: (lat: number, lng: number) => void;
  onEdit: (item: Establishment) => void;
  onDelete: (id: string) => void;
  isAdmin?: boolean;
}

export const EstablishmentModal: React.FC<EstablishmentModalProps> = ({
  establishment,
  onClose,
  onFocusOnMap,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!establishment) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}#est-${establishment.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const categoryInfo = CATEGORIES[establishment.category] || {
    label: 'Espaço Progressista',
    shortLabel: 'Progressista',
    icon: '🚩',
    description: 'Espaço comunitário e comprometido socialmente.',
  };

  const getOpenStatus = (hoursStr?: string) => {
    if (!hoursStr) return { isOpen: true, label: 'Horário sob consulta', badgeColor: 'bg-neutral-100 text-neutral-700 border-neutral-200' };

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Dom, 1 = Seg, ..., 6 = Sáb
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    const lower = hoursStr.toLowerCase();

    if (lower.includes('24h') || lower.includes('24 horas')) {
      return { isOpen: true, label: 'Aberto 24h', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }

    let isDayOpen = true;
    if (lower.includes('segunda a sexta') || lower.includes('seg. a sex')) {
      if (currentDay === 0 || currentDay === 6) isDayOpen = false;
    } else if (lower.includes('terça a domingo') || lower.includes('terça a dom') || lower.includes('ter a dom')) {
      if (currentDay === 1) isDayOpen = false;
    } else if (lower.includes('segunda a sábado') || lower.includes('seg a sáb')) {
      if (currentDay === 0) isDayOpen = false;
    }

    if (!isDayOpen) {
      return { isOpen: false, label: 'Fechado hoje', badgeColor: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
    }

    const regex = /(\d{1,2})(?:[h:](\d{2}))?/g;
    const matches = [...hoursStr.matchAll(regex)];

    if (matches.length >= 2) {
      const startH = parseInt(matches[0][1], 10);
      const startM = matches[0][2] ? parseInt(matches[0][2], 10) : 0;
      const endH = parseInt(matches[1][1], 10);
      const endM = matches[1][2] ? parseInt(matches[1][2], 10) : 0;

      const startTimeVal = startH * 60 + startM;
      let endTimeVal = endH * 60 + endM;

      if (endTimeVal <= startTimeVal) {
        endTimeVal += 24 * 60;
      }
      
      const adjustedCurrent = currentTimeVal < startTimeVal && endTimeVal > 24 * 60 ? currentTimeVal + 24 * 60 : currentTimeVal;

      const open = adjustedCurrent >= startTimeVal && adjustedCurrent <= endTimeVal;
      return open
        ? { isOpen: true, label: 'Aberto agora', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
        : { isOpen: false, label: 'Fechado no momento', badgeColor: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
    }

    return { isOpen: true, label: 'Horário regular', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const openStatus = getOpenStatus(establishment.operatingHours);

  const fullAddressQuery = `${establishment.address}, ${establishment.city} - ${establishment.state}, Brasil`;
  const mapExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressQuery)}`;
  const mapRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddressQuery)}`;



  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Main Title & Location */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight mb-2">
              {establishment.name}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-neutral-800">
                <MapPin className="w-4 h-4 text-[#d32f2f]" />
                {establishment.address}
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span>{establishment.city} - {establishment.state}</span>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${openStatus.badgeColor}`}>
                <span className={`w-2 h-2 rounded-full ${openStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                <span>{openStatus.label}</span>
              </span>
            </div>

            {establishment.operatingHours && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                <Clock className="w-4 h-4 text-[#d32f2f] shrink-0" />
                <span><strong>Horário de Funcionamento:</strong> {establishment.operatingHours}</span>
              </div>
            )}
          </div>

          {/* Curadoria: Categoria Sugerida */}
          {establishment.suggestedCategory && isAdmin && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-center gap-2">
              <span className="text-sm" aria-hidden="true">💡</span>
              <span>
                <strong>Sugestão original de categoria:</strong> "{establishment.suggestedCategory}"
              </span>
            </div>
          )}

          {/* Social / Solidarity Manifesto */}
          <div className="bg-neutral-50 rounded-xl p-4.5 border border-neutral-200">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#d32f2f] mb-1.5">
              Manifesto & Propósito da Casa
            </h4>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
              {establishment.description}
            </p>
          </div>

          {/* History / Trajectory */}
          {establishment.history && (
            <div className="bg-red-50/50 rounded-xl p-4.5 border border-red-200/60">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#d32f2f] mb-1.5 flex items-center gap-1.5">
                <span aria-hidden="true">📜</span>
                <span>História & Trajetória de Luta</span>
              </h4>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {establishment.history}
              </p>
            </div>
          )}

          {/* Progressive Flags & Tags */}
          {establishment.tags && establishment.tags.length > 0 && (
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-2">
                Bandeiras & Práticas
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {establishment.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md border border-neutral-200/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Map Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => {
                onFocusOnMap(establishment.latitude, establishment.longitude);
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Navigation2 className="w-3.5 h-3.5 text-[#d32f2f]" />
              <span>Mapa da Plataforma</span>
            </button>

            <a
              href={mapExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
              <span>Ver no Google Maps</span>
            </a>

            <a
              href={mapRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-red-200 bg-red-50/70 text-red-900 hover:bg-red-100 text-xs font-semibold transition-colors"
            >
              <Navigation2 className="w-3.5 h-3.5 text-[#d32f2f]" />
              <span>Traçar Rota GPS</span>
            </a>
          </div>


          {/* Social Contact Buttons */}
          {(establishment.instagram || establishment.whatsapp || establishment.website) && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100 text-xs">
              {establishment.instagram && (
                <a
                  href={
                    establishment.instagram.startsWith('http')
                      ? establishment.instagram
                      : `https://instagram.com/${establishment.instagram.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-neutral-700 hover:text-[#d32f2f] font-medium"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>{establishment.instagram}</span>
                </a>
              )}

              {establishment.whatsapp && (
                <a
                  href={`https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-neutral-700 hover:text-emerald-700 font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp: {establishment.whatsapp}</span>
                </a>
              )}

              {establishment.website && (
                <a
                  href={
                    establishment.website.startsWith('http')
                      ? establishment.website
                      : `https://${establishment.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-neutral-700 hover:text-blue-700 font-medium"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Site Oficial</span>
                </a>
              )}
            </div>
          )}

          {/* Share Section */}
          <div className="pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#d32f2f]" />
                <span>Divulgar este Espaço de Luta</span>
              </h4>
              {copied && (
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 animate-fade-in">
                  <Check className="w-3 h-3" /> Link copiado!
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Conheça o ${establishment.name} (${establishment.city}-${establishment.state}), um espaço de gastronomia progressista cadastrado no Sabor & Luta! 🚩\n\nConfira: ${window.location.origin}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Conheça o ${establishment.name} (${establishment.city}-${establishment.state}) - Gastronomia Progressista e Resistência no Sabor & Luta!`)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100 text-xs font-semibold transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-neutral-600" />
                <span>X / Twitter</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 text-xs font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>



          {/* Edit / Remove Management (VISIBLE ONLY FOR ADMIN/CURATORS) */}
          {isAdmin && (
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/50">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Gestão do Espaço</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onEdit(establishment);
                    onClose();
                  }}
                  className="text-xs text-neutral-700 hover:text-neutral-900 font-medium inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-neutral-200 hover:bg-neutral-50"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-red-200 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          )}

          {/* Confirm Delete Accessible Modal */}
          <ConfirmDeleteModal
            isOpen={confirmDelete}
            establishmentName={establishment.name}
            onConfirm={() => {
              onDelete(establishment.id);
              onClose();
            }}
            onClose={() => setConfirmDelete(false)}
          />

        </div>
      </div>
    </div>
  );
};
