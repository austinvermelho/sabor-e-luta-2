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
  Clock,
  Calendar,
  UserCheck,
  Stamp
} from 'lucide-react';
import { Establishment, OperatingHours, CheckIn } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatOperatingHoursPT, getOpeningStatusPT, formatDatePT } from '../utils/hours';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ImageLightbox } from './ImageLightbox';
import { fetchEstablishmentCheckInsAsync } from '../services/passport';


import { calculateDistanceKm, formatDistancePT } from '../utils/geo';

interface EstablishmentModalProps {
  establishment: Establishment | null;
  onClose: () => void;
  onFocusOnMap: (lat: number, lng: number) => void;
  onEdit: (item: Establishment) => void;
  onDelete: (id: string) => void;
  onOpenCheckIn?: (item: Establishment) => void;
  isVisited?: boolean;
  isAdmin?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

export const EstablishmentModal: React.FC<EstablishmentModalProps> = ({
  establishment,
  onClose,
  onFocusOnMap,
  onEdit,
  onDelete,
  onOpenCheckIn,
  isVisited = false,
  isAdmin = false,
  userLocation,
}) => {

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [communityCheckIns, setCommunityCheckIns] = useState<CheckIn[]>([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(false);

  React.useEffect(() => {
    if (establishment) {
      setLoadingCheckIns(true);
      fetchEstablishmentCheckInsAsync(establishment.id)
        .then((items) => setCommunityCheckIns(items))
        .catch(() => setCommunityCheckIns([]))
        .finally(() => setLoadingCheckIns(false));
    }
  }, [establishment?.id]);

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

  const openStatus = getOpeningStatusPT(establishment.operatingHours);

  const fullAddressQuery = `${establishment.address}, ${establishment.city} - ${establishment.state}, Brasil`;
  const mapExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressQuery)}`;
  const mapRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddressQuery)}`;

  const formattedHours = formatOperatingHoursPT(establishment.operatingHours);

  const modalDistanceKm = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, establishment.latitude, establishment.longitude)
    : null;
  const modalDistanceStr = modalDistanceKm !== null && modalDistanceKm !== Infinity ? formatDistancePT(modalDistanceKm) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {lightboxImage && (
          <ImageLightbox images={[lightboxImage]} onClose={() => setLightboxImage(null)} />
        )}
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
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
                {establishment.name}
              </h2>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${openStatus.badgeColor}`}>
                {openStatus.label}
              </span>
            </div>

            <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-800 bg-[#f3ede2] px-3.5 py-2.5 rounded-lg border border-[#e4dcce]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#b91c1c] shrink-0" />
                <span><strong>Horário:</strong> {formattedHours}</span>
              </div>
              <span className="text-[10px] text-neutral-600 italic">
                * Recomendamos sempre confirmar horários diretamente com o estabelecimento.
              </span>
            </div>

            {/* Social Contact Links (Below Schedule) */}
            {(establishment.instagram || establishment.whatsapp || establishment.website) && (
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                {establishment.instagram && (
                  <a
                    href={
                      establishment.instagram.startsWith('http')
                        ? establishment.instagram
                        : `https://instagram.com/${establishment.instagram.replace('@', '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-800 hover:text-[#d32f2f] font-medium bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <span>{establishment.instagram}</span>
                  </a>
                )}

                {establishment.whatsapp && (
                  <a
                    href={`https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-800 hover:text-emerald-700 font-medium bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>WhatsApp</span>
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
                    className="inline-flex items-center gap-1 text-neutral-800 hover:text-blue-700 font-medium bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Site Oficial</span>
                  </a>
                )}
              </div>
            )}



            {/* Map Navigation Buttons (Moved Higher Up) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
              <button
                onClick={() => {
                  onFocusOnMap(establishment.latitude, establishment.longitude);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <Navigation2 className="w-3.5 h-3.5 text-[#d32f2f]" />
                <span>Mapa da Plataforma</span>
              </button>

              <a
                href={mapExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 text-xs font-semibold transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
                <span>Ver no Google Maps</span>
              </a>

              <a
                href={mapRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-red-200 bg-red-50/70 text-red-900 hover:bg-red-100 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Navigation2 className="w-3.5 h-3.5 text-[#d32f2f]" />
                <span>Traçar Rota GPS</span>
              </a>
            </div>



            {/* Passaporte Check-in CTA Banner */}
            {onOpenCheckIn && (
              <div className="mt-3.5 p-3.5 bg-stone-900 text-amber-100 rounded-xl border border-stone-800 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-red-900 text-amber-200 rounded-lg shrink-0 border border-red-800">
                    <Stamp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-amber-100 uppercase tracking-wide">
                      Passaporte Sabor & Luta
                    </h4>
                    <p className="text-[11px] text-stone-300">
                      {isVisited ? 'Você já possui carimbo neste local!' : 'Já visitou este espaço? Registre no seu passaporte.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCheckIn(establishment)}
                  className="px-3.5 py-2 bg-red-900 hover:bg-red-950 text-amber-50 text-xs font-bold rounded-lg transition-all shadow shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Stamp className="w-4 h-4 text-amber-300" />
                  <span>{isVisited ? 'Novo Carimbo' : 'Carimbar Visita'}</span>
                </button>
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

          {/* Community Passport Experiences Summary */}
          <div className="bg-[#fcfaf7] rounded-xl p-4.5 border border-[#e4dcce] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e4dcce] pb-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-red-900 flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-red-800" />
                <span>Experiências & Relatos da Comunidade ({communityCheckIns.length})</span>
              </h4>
              <span className="text-[11px] text-stone-500 font-mono">
                Passaporte Sabor & Luta
              </span>
            </div>

            {loadingCheckIns ? (
              <div className="text-center py-4 text-xs text-stone-500 animate-pulse">
                Carregando relatos do passaporte...
              </div>
            ) : communityCheckIns.length === 0 ? (
              <p className="text-xs text-stone-600 italic py-2">
                Ainda não há relatos registrados por companheiros neste local. Seja o primeiro a carimbar sua visita e deixar sua experiência!
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {communityCheckIns.map((c) => (
                  <div key={c.id} className="p-3 bg-white border border-stone-200 rounded-lg shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-800">
                        {c.userEmail ? c.userEmail.split('@')[0] : 'Companheiro(a)'}
                      </span>
                      <span className="font-mono">
                        {new Date(c.visitDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 italic">
                      "{c.experienceNote}"
                    </p>
                    {(() => {
                      const photos = c.photoUrls && c.photoUrls.length > 0 ? c.photoUrls : (c.photoUrl ? [c.photoUrl] : []);
                      if (photos.length === 0) return null;
                      return (
                        <div className={`grid gap-1.5 mt-2 ${photos.length > 1 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                          {photos.map((pUrl, pIdx) => (
                            <div key={pIdx} className="rounded-md overflow-hidden h-28 border border-stone-200 bg-stone-100">
                              <img 
                                src={pUrl} 
                                alt={`Foto ${pIdx + 1} da visita`} 
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                                onClick={() => setLightboxImage(pUrl)}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                  </div>
                ))}
              </div>
            )}
          </div>




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

          {/* Audit Trail: Date and Author of Last Modification */}
          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-[11px] text-neutral-600 gap-2 bg-[#f8f5ee] px-3.5 py-2.5 rounded-lg border border-[#e4dcce]">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#b91c1c] shrink-0" />
              <span>
                <strong>Última atualização:</strong> {formatDatePT(establishment.updatedAt || establishment.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>
                <strong>Autor:</strong> {establishment.updatedBy || (isAdmin ? 'Curadoria (ordinario8054)' : 'Curadoria Sabor & Luta')}
              </span>
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
