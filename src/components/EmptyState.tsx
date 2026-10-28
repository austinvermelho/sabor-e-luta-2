import React from 'react';
import { Plus, Sparkles, MapPin } from 'lucide-react';

interface EmptyStateProps {
  onOpenRegister: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenRegister }) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto my-8">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-[#d32f2f] flex items-center justify-center">
        <MapPin className="w-6 h-6 stroke-[2]" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h3 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
          Nenhum espaço cadastrado ainda
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
          O <strong>Sabor & Luta</strong> é um catálogo comunitário e colaborativo. A plataforma não inclui estabelecimentos fictícios: cada ponto no mapa é adicionado por quem apoia a gastronomia progressista.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left max-w-xl mx-auto pt-1">
        <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100/80">
          <span className="text-sm">🤝</span>
          <h4 className="font-semibold text-xs text-neutral-900 mt-1">Autogestão</h4>
          <p className="text-[11px] text-neutral-500 mt-0.5">Cooperativas e cozinhas solidárias.</p>
        </div>
        <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100/80">
          <span className="text-sm">🌱</span>
          <h4 className="font-semibold text-xs text-neutral-900 mt-1">Agroecologia</h4>
          <p className="text-[11px] text-neutral-500 mt-0.5">Alimentos da agricultura familiar.</p>
        </div>
        <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100/80">
          <span className="text-sm">❤️</span>
          <h4 className="font-semibold text-xs text-neutral-900 mt-1">Apoio via Pix</h4>
          <p className="text-[11px] text-neutral-500 mt-0.5">Contribuição direta aos locais.</p>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onOpenRegister}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-2xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar o Primeiro Espaço</span>
        </button>
      </div>
    </div>
  );
};
