import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { AdPartner, AdSenseConfig } from '../types';

interface AdBannerProps {
  config: AdSenseConfig;
  onOpenConfig: () => void;
}

const PARTNER_ADS: AdPartner[] = [
  {
    id: 'partner-1',
    title: 'Armazém do Campo',
    subtitle: 'Alimentos saudáveis, sem veneno e direto da Reforma Agrária para as mesas do Brasil.',
    tag: 'Agroecologia Popular',
    linkUrl: 'https://armazemdocampo.shop',
    callToAction: 'Conhecer a Loja'
  },
  {
    id: 'partner-2',
    title: 'Editora Expressão Popular',
    subtitle: 'Livros e teoria crítica para compreender o mundo e alimentar a transformação social.',
    tag: 'Cultura & Teoria',
    linkUrl: 'https://expressaopopular.com.br',
    callToAction: 'Ver Catálogo'
  },
  {
    id: 'partner-3',
    title: 'Café Terra e Liberdade',
    subtitle: 'Café 100% arábica de alta qualidade cultivado por cooperativas da agricultura familiar.',
    tag: 'Comércio Justo',
    linkUrl: 'https://armazemdocampo.shop/collections/cafes',
    callToAction: 'Apoiar Cooperativa'
  },
  {
    id: 'partner-4',
    title: 'Campanha Cozinhas Solidárias',
    subtitle: 'Combate à fome nas periferias brasileiras através da auto-organização e cozinhas comunitárias.',
    tag: 'Segurança Alimentar',
    linkUrl: 'https://apoia.se/cozinhasolidaria',
    callToAction: 'Fortalecer a Ação'
  }
];

export const AdBanner: React.FC<AdBannerProps> = ({ config, onOpenConfig }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Rotate partner advertisements smoothly
  useEffect(() => {
    if (config.enabled && config.clientId) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % PARTNER_ADS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [config.enabled, config.clientId]);

  // Google AdSense View
  if (config.enabled && config.clientId) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
          <span>Publicidade</span>
          <button onClick={onOpenConfig} className="hover:text-neutral-600 underline">
            Editar AdSense
          </button>
        </div>
        <div className="min-h-[85px] flex items-center justify-center bg-neutral-50 rounded border border-dashed border-neutral-200 text-xs text-neutral-400">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={config.clientId}
            data-ad-slot={config.slotIdTop || '1234567890'}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  const partner = PARTNER_ADS[currentIdx];

  return (
    <div className="bg-white rounded-xl border border-rose-200/80 p-4 sm:p-4.5 shadow-2xs transition-all hover:border-rose-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#d32f2f] text-[11px] uppercase tracking-wide bg-rose-50/80 px-2 py-0.5 rounded border border-rose-200/60">
              {partner.tag}
            </span>
            <span aria-hidden="true" className="text-rose-200">·</span>
            <span className="text-rose-800/80 text-[11px] font-medium">Parceiro Solidário</span>
          </div>
          
          <h4 className="font-display text-base sm:text-lg font-bold text-neutral-900 leading-snug">
            {partner.title}
          </h4>
          
          <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
            {partner.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={partner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-950 hover:text-[#d32f2f] bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/70 px-3.5 py-2 rounded-lg transition-colors shrink-0 group"
          >
            <span>{partner.callToAction}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

      </div>
    </div>
  );
};
