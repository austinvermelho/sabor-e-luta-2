import React from 'react';
import { Mail, ArrowUpRight } from 'lucide-react';
import { AdSenseConfig } from '../types';

interface SidebarAdProps {
  config: AdSenseConfig;
  onOpenConfig: () => void;
}

export const SidebarAd: React.FC<SidebarAdProps> = ({ config, onOpenConfig }) => {
  if (config.enabled && config.clientId) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
          <span>Publicidade</span>
          <button onClick={onOpenConfig} className="hover:text-neutral-600 underline">
            Editar
          </button>
        </div>
        <div className="min-h-[220px] flex items-center justify-center bg-neutral-50 rounded border border-dashed border-neutral-200 text-xs text-neutral-400">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '220px' }}
            data-ad-client={config.clientId}
            data-ad-slot={config.slotIdSidebar || '0987654321'}
            data-ad-format="rectangle"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-5 shadow-2xs space-y-3.5 transition-all">
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-[#d32f2f] uppercase tracking-wider block">
          Apoio Cultural & Parcerias
        </span>
        <h4 className="font-display text-base font-bold text-neutral-900 leading-snug">
          Anuncie no Sabor & Luta
        </h4>
      </div>

      <p className="text-xs text-neutral-600 leading-relaxed">
        Divulgue sua cooperativa, editora independente, selo ou iniciativa popular para uma comunidade engajada e solidária.
      </p>

      <a
        href="mailto:contato@ordinario.bar?subject=Apoio%20e%20An%C3%BAncio%20no%20Sabor%20%26%20Luta"
        className="inline-flex items-center justify-between w-full bg-white hover:bg-rose-50/80 text-neutral-900 border border-rose-200/80 text-xs font-semibold px-3.5 py-2.5 rounded-lg transition-colors shadow-2xs group"
      >
        <span>Falar com a Equipe</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-rose-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
};
