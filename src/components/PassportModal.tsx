import React, { useState } from 'react';
import { 
  X, 
  Stamp, 
  Award, 
  LogOut, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { Establishment, CheckIn, UserProfile } from '../types';
import { logoutUser, deleteCheckInAsync } from '../services/passport';
import { ImageLightbox } from './ImageLightbox';

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  checkIns: CheckIn[];
  establishments: Establishment[];
  onOpenCheckIn: (establishment: Establishment) => void;
  onRequestAuth: () => void;
  onUpdateCheckIns: (updated: CheckIn[]) => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  onClose,
  user,
  checkIns,
  establishments,
  onOpenCheckIn,
  onRequestAuth,
  onUpdateCheckIns,
}) => {
  const [filter, setFilter] = useState<'all' | 'visited' | 'pending'>('all');
  const [selectedEstablishmentDetail, setSelectedEstablishmentDetail] = useState<Establishment | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const approvedEstablishments = establishments.filter((e) => e.status === 'approved' || !e.status);
  
  // Calculate visited establishment IDs
  const visitedEstablishmentIds = new Set(checkIns.map((c) => c.establishmentId));
  const visitedCount = visitedEstablishmentIds.size;
  const totalCount = approvedEstablishments.length;
  const percentage = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  // Level title based on visits
  const getExplorerTitle = (count: number) => {
    if (count === 0) return 'Novo(a) Companheiro(a)';
    if (count < 3) return 'Explorador(a) Iniciante';
    if (count < 6) return 'Ativista do Circuito';
    if (count < 10) return 'Guardião(ã) da Gastronomia';
    return 'Mestre da Luta & Sabor';
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      onClose();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const handleDeleteCheckIn = async (checkInId: string) => {
    if (!user) return;
    if (window.confirm('Deseja remover este registro de visita do seu passaporte?')) {
      const updated = await deleteCheckInAsync(checkInId, user.uid);
      onUpdateCheckIns(updated);
    }
  };

  // Filter establishments list
  const filteredList = approvedEstablishments.filter((est) => {
    const isVisited = visitedEstablishmentIds.has(est.id);
    if (filter === 'visited') return isVisited;
    if (filter === 'pending') return !isVisited;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      {lightboxImage && (
        <ImageLightbox images={[lightboxImage]} onClose={() => setLightboxImage(null)} />
      )}
      <div className="relative w-full max-w-4xl bg-[#f7f4ee] border-2 border-stone-400 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
        
        {/* Passaporte Caderneta Cover Top Header */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-6 relative border-b-2 border-stone-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-full transition-colors z-10"
            title="Fechar Passaporte"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-900 text-amber-200 rounded-xl border border-red-700 shadow-inner">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-widest text-red-400">
                  Caderneta Oficial de Memória
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-amber-100">
                  Passaporte Sabor & Luta
                </h2>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-3 bg-stone-800/80 p-2.5 rounded-xl border border-stone-700 w-full sm:w-auto">
                <div className="w-9 h-9 bg-red-950 text-amber-200 rounded-full flex items-center justify-center font-serif font-bold border border-red-800 text-sm">
                  {user.displayName?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1 sm:flex-none">
                  <p className="text-xs font-semibold text-stone-100 truncate">
                    {user.displayName || user.email}
                  </p>
                  <span className="text-[10px] text-amber-300 font-medium block">
                    {getExplorerTitle(visitedCount)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-stone-400 hover:text-red-300 hover:bg-stone-700 rounded-lg transition-colors ml-auto sm:ml-2"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRequestAuth();
                }}
                className="px-4 py-2 bg-red-900 hover:bg-red-950 text-amber-100 text-xs font-semibold rounded-xl border border-red-700 shadow transition-all flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Conectar ao Meu Passaporte
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4 bg-stone-950/60 p-3 sm:p-4 rounded-xl border border-stone-800/80">
            <div className="text-center border-r border-stone-800">
              <span className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider block">
                Locais Visitados
              </span>
              <span className="font-serif text-lg sm:text-2xl font-bold text-amber-300 tabular-nums">
                {visitedCount} <span className="text-stone-500 text-xs sm:text-sm font-sans font-normal">/ {totalCount}</span>
              </span>
            </div>

            <div className="text-center border-r border-stone-800">
              <span className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider block">
                Conclusão
              </span>
              <span className="font-serif text-lg sm:text-2xl font-bold text-red-400 tabular-nums">
                {percentage}%
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider block">
                Nível Atual
              </span>
              <span className="text-xs sm:text-sm font-semibold text-stone-200 truncate block mt-1">
                {getExplorerTitle(visitedCount)}
              </span>
            </div>
          </div>

          {/* User Stats Card */}
          {user && checkIns.length > 0 && (
            <div className="mt-4 bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex gap-4 text-stone-800">
              <div className="flex flex-col items-center justify-center p-2 bg-amber-100 rounded-lg text-amber-900 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-500">Total Visitados</p>
                  <p className="text-sm font-bold">{visitedCount} estabelecimentos</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-500">Estados Percorridos</p>
                  <p className="text-sm font-bold">
                    {Array.from(new Set(checkIns.map(c => establishments.find(e => e.id === c.establishmentId)?.state).filter(Boolean))).length} estados
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-500">Primeira Visita</p>
                  <p className="text-sm font-bold">
                    {new Date(Math.min(...checkIns.map(c => new Date(c.visitDate).getTime()))).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Filter Navigation Bar */}
        <div className="bg-[#ebe6df] border-b border-stone-300 px-4 py-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-lg border border-stone-300">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos os Locais ({approvedEstablishments.length})
            </button>
            <button
              onClick={() => setFilter('visited')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === 'visited'
                  ? 'bg-white text-red-900 shadow-sm border border-stone-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Carimbados ({visitedCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === 'pending'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Faltam Visitar ({totalCount - visitedCount})
            </button>
          </div>

          <span className="hidden sm:inline-block text-[11px] font-mono text-stone-500 uppercase tracking-widest">
            SABOR & LUTA · PORTO ALEGRE
          </span>
        </div>

        {/* Passaporte Caderneta Main Page Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#fbf9f5] space-y-4">
          
          {!user && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
                <span>
                  Conecte-se para que seus carimbos e histórias fiquem salvos em nuvem permanentemente no seu e-mail!
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onRequestAuth();
                }}
                className="px-4 py-2 bg-red-900 text-amber-50 text-xs font-semibold rounded-lg hover:bg-red-950 shrink-0 shadow"
              >
                Entrar com E-mail
              </button>
            </div>
          )}

          {filteredList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-stone-300 rounded-2xl p-6">
              <Stamp className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <p className="font-serif text-lg text-stone-700">Nenhum estabelecimento encontrado nesta aba.</p>
              <p className="text-xs text-stone-500 mt-1">
                Explore os locais listados e marque suas experiências no circuito gastronômico.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((establishment) => {
                const estCheckIns = checkIns.filter((c) => c.establishmentId === establishment.id);
                const isVisited = estCheckIns.length > 0;
                const lastCheckIn = estCheckIns[0];

                return (
                  <div
                    key={establishment.id}
                    className={`relative rounded-xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                      isVisited
                        ? 'bg-[#fdfbf7] border-stone-300 shadow-sm hover:shadow-md'
                        : 'bg-stone-100/60 border-stone-200 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Top Bar on Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-stone-500 block">
                            {establishment.city}, {establishment.state}
                          </span>
                          <h3 className="font-serif text-base font-bold text-stone-900 mt-0.5 leading-snug">
                            {establishment.name}
                          </h3>
                        </div>

                        {/* Stamp Icon / Badge */}
                        {isVisited ? (
                          <div className="shrink-0 flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full border-2 border-dashed border-red-900/80 bg-red-50/50 flex flex-col items-center justify-center p-1 transform rotate-[-6deg] shadow-sm">
                              <Stamp className="w-4 h-4 text-red-900" />
                              <span className="text-[8px] font-serif font-black text-red-900 uppercase tracking-tighter mt-0.5">
                                CARIMBADO
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="shrink-0 w-12 h-12 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center opacity-40">
                            <Stamp className="w-5 h-5 text-stone-400" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 mt-2">
                        {establishment.description}
                      </p>

                      {/* Display visit dates & summary if visited */}
                      {isVisited && lastCheckIn && (
                        <div className="mt-3 p-3 bg-stone-100/80 rounded-lg border border-stone-200 text-xs text-stone-700 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-red-800" />
                              {new Date(lastCheckIn.visitDate).toLocaleDateString('pt-BR')}
                            </span>
                            {estCheckIns.length > 1 && (
                              <span className="bg-red-100 text-red-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {estCheckIns.length} visitas
                              </span>
                            )}
                          </div>
                          <p className="italic text-stone-800 line-clamp-2">
                            "{lastCheckIn.experienceNote}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedEstablishmentDetail(establishment)}
                        className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
                      >
                        Ver Memórias e Fotos ({estCheckIns.length})
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenCheckIn(establishment)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                          isVisited
                            ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                            : 'bg-red-900 hover:bg-red-950 text-amber-50'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isVisited ? 'Novo Carimbo' : 'Carimbar Visita'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Detail for Establishment Check-in Memories */}
        {selectedEstablishmentDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-lg bg-stone-50 border-2 border-stone-400 rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
              <button
                onClick={() => setSelectedEstablishmentDetail(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
                {selectedEstablishmentDetail.name}
              </h3>
              <p className="text-xs text-stone-500 mb-4 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-800" />
                {selectedEstablishmentDetail.address}, {selectedEstablishmentDetail.city}
              </p>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {checkIns.filter((c) => c.establishmentId === selectedEstablishmentDetail.id).length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-xs">
                    Você ainda não possui carimbos registrados neste local.
                  </div>
                ) : (
                  checkIns
                    .filter((c) => c.establishmentId === selectedEstablishmentDetail.id)
                    .map((c) => (
                      <div key={c.id} className="p-4 bg-white border border-stone-200 rounded-xl shadow-sm space-y-2 relative">
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span className="font-mono font-medium text-red-900 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(c.visitDate).toLocaleDateString('pt-BR')}
                          </span>
                          {user && (
                            <button
                              onClick={() => handleDeleteCheckIn(c.id)}
                              className="text-stone-400 hover:text-red-700 p-1"
                              title="Excluir este carimbo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-stone-800 whitespace-pre-wrap">
                          {c.experienceNote}
                        </p>
                        {(() => {
                          const photos = c.photoUrls && c.photoUrls.length > 0 ? c.photoUrls : (c.photoUrl ? [c.photoUrl] : []);
                          if (photos.length === 0) return null;
                          return (
                            <div className={`grid gap-2 mt-2 ${photos.length > 1 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                              {photos.map((pUrl, pIdx) => (
                                <div key={pIdx} className="rounded-lg overflow-hidden h-32 border border-stone-200 bg-stone-100">
                                  <img
                                    src={pUrl}
                                    alt={`Foto ${pIdx + 1} da visita`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => setLightboxImage(pUrl)}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                      </div>
                    ))
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex gap-2">
                <button
                  onClick={() => setSelectedEstablishmentDetail(null)}
                  className="flex-1 py-2.5 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-100"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    const target = selectedEstablishmentDetail;
                    setSelectedEstablishmentDetail(null);
                    onOpenCheckIn(target);
                  }}
                  className="flex-1 py-2.5 bg-red-900 text-amber-50 text-xs font-semibold rounded-xl hover:bg-red-950 shadow flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Carimbar Nova Visita
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
