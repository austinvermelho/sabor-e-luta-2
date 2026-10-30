import React, { useState } from 'react';
import { X, Search, Phone, Mail, MapPin, Trash2, CheckCircle2, Clock, Archive, Sparkles, Filter } from 'lucide-react';
import { Volunteer, VolunteerSkill } from '../types';

interface VolunteerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteers: Volunteer[];
  onUpdateStatus: (id: string, status: Volunteer['status']) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

const SKILL_LABELS: Record<VolunteerSkill, { label: string; icon: string }> = {
  curadoria: { label: 'Curadoria', icon: '📍' },
  design: { label: 'Design & Vídeo', icon: '🎨' },
  dev: { label: 'Desenvolvimento', icon: '💻' },
  agroecologia: { label: 'Agroecologia', icon: '🌾' },
  comunicacao: { label: 'Comunicação', icon: '📣' },
  mapeamento: { label: 'Mapeamento', icon: '🗺️' },
  eventos: { label: 'Eventos', icon: '🎪' },
  traducao: { label: 'Acessibilidade', icon: '🌐' },
};

export const VolunteerListModal: React.FC<VolunteerListModalProps> = ({
  isOpen,
  onClose,
  volunteers,
  onUpdateStatus,
  onDelete,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'contacted' | 'archived'>('pending');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = volunteers.filter((v) => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCity = v.city.toLowerCase().includes(q);
      const matchEmail = v.email.toLowerCase().includes(q);
      const matchSkills = v.skills.some((s) => SKILL_LABELS[s]?.label.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchEmail && !matchSkills) return false;
    }
    return true;
  });

  const pendingCount = volunteers.filter((v) => v.status === 'pending').length;

  const formatWhatsappUrl = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const number = cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(`Olá, ${name}! Sou da curadoria do Sabor & Luta. Vi sua inscrição como voluntário(a) e gostaria de conversar!`);
    return `https://wa.me/${number}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#fbf8f3] border-b border-[#e4dcce] px-6 sm:px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#b91c1c] ring-4 ring-[#b91c1c]/20" />
            <div>
              <h3 className="font-display text-xl font-bold text-neutral-900 tracking-tight">
                Gestão de Voluntários(as)
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                {volunteers.length} apoio(s) cadastrado(s) · {pendingCount} pendente(s) de contato
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-neutral-50 p-3.5 border-b border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-neutral-200/70 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-white text-rose-950 shadow-2xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('contacted')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'contacted'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              Contatados ({volunteers.filter((v) => v.status === 'contacted').length})
            </button>
            <button
              onClick={() => setFilterStatus('archived')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'archived'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              Arquivados ({volunteers.filter((v) => v.status === 'archived').length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              Todos ({volunteers.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por nome, cidade ou habilidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:border-[#b91c1c]"
            />
          </div>

        </div>

        {/* Volunteers List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 bg-[#fbf8f3]">
          {filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2 bg-white rounded-xl border border-neutral-200">
              <p className="text-sm font-semibold text-neutral-700">
                Nenhum voluntário encontrado nesta aba.
              </p>
              <p className="text-xs text-neutral-500">
                {filterStatus === 'pending'
                  ? 'Não há inscrições pendentes aguardando contato.'
                  : 'Tente alterar os filtros de busca acima.'}
              </p>
            </div>
          ) : (
            filtered.map((vol) => (
              <div
                key={vol.id}
                className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-2xs space-y-3 hover:border-neutral-300 transition-all"
              >
                {/* Top Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base text-neutral-900">{vol.name}</h4>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        vol.status === 'pending'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : vol.status === 'contacted'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}>
                        {vol.status === 'pending' ? '⏳ Pendente' : vol.status === 'contacted' ? '✅ Contatado' : '📁 Arquivado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-600 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-neutral-800">
                        <MapPin className="w-3.5 h-3.5 text-[#b91c1c]" />
                        {vol.city} - {vol.state}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-neutral-600">
                        <Mail className="w-3.5 h-3.5" />
                        {vol.email}
                      </span>
                      <span>·</span>
                      <span className="text-neutral-500">
                        Disp: <strong>{vol.availability}</strong>
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp Direct Action Button */}
                  <a
                    href={formatWhatsappUrl(vol.whatsapp, vol.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp ({vol.whatsapp})</span>
                  </a>
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {vol.skills.map((sk) => {
                    const info = SKILL_LABELS[sk] || { label: sk, icon: '⭐' };
                    return (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-900 border border-rose-200/80"
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Message presentation if any */}
                {vol.message && (
                  <p className="text-xs text-neutral-700 italic bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 leading-relaxed">
                    “{vol.message}”
                  </p>
                )}

                {/* Action status bar */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-neutral-400">
                    Inscrito em {new Date(vol.createdAt).toLocaleDateString('pt-BR')}
                  </span>

                  <div className="flex items-center gap-2">
                    {vol.status !== 'contacted' && (
                      <button
                        onClick={() => onUpdateStatus(vol.id, 'contacted')}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marcar Contatado</span>
                      </button>
                    )}

                    {vol.status !== 'archived' && (
                      <button
                        onClick={() => onUpdateStatus(vol.id, 'archived')}
                        className="text-neutral-600 hover:text-neutral-900 font-medium text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Arquivar</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(vol.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-xs flex items-center gap-1 ml-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-100 px-6 py-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600 shrink-0">
          <span>
            Gestão restrita aos curadores e moderadores do Sabor &amp; Luta.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
