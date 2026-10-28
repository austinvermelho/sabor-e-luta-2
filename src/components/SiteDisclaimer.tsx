import React, { useState } from 'react';
import { Sparkles, MapPin, Heart, Users, X, Info, Plus, ArrowRight } from 'lucide-react';

interface SiteDisclaimerProps {
  onOpenRegister: () => void;
  onOpenMission: () => void;
}

export const SiteDisclaimer: React.FC<SiteDisclaimerProps> = ({
  onOpenRegister,
  onOpenMission,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sabor_luta_disclaimer_dismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('sabor_luta_disclaimer_dismissed', 'true');
  };

  const handleRestore = () => {
    setIsDismissed(false);
    localStorage.removeItem('sabor_luta_disclaimer_dismissed');
  };

  if (isDismissed) {
    return (
      <div className="flex justify-end -mb-1">
        <button
          onClick={handleRestore}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#b91c1c] hover:text-[#7f1d1d] bg-[#f3ede2] hover:bg-[#ebe2d3] px-3 py-1 rounded-full border border-[#e4dcce] transition-all cursor-pointer shadow-2xs"
          title="Ver explicação sobre o site"
        >
          <Info className="w-3.5 h-3.5 text-[#b91c1c]" />
          <span>O que é o Sabor &amp; Luta?</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] p-4 sm:p-5.5 shadow-md border border-[#7f1d1d] transition-all text-white">
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        {/* Left Side */}
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-[11px] font-bold tracking-wide uppercase border border-white/30 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Guia Colaborativo &amp; Independente
            </span>
            <span className="hidden sm:inline-block text-amber-200/80 text-xs">•</span>
            <span className="text-xs text-amber-100 font-medium hidden sm:inline-block">
              Gastronomia, Cultura &amp; Economia Solidária
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug drop-shadow-2xs">
            Mapeamos bares, restaurantes, cafés e coletivos compromissados com a transformação social.
          </h2>

          <p className="text-xs sm:text-sm text-amber-50 font-normal leading-relaxed max-w-2xl">
            O <strong className="text-white font-bold underline decoration-amber-300/60 underline-offset-2">Sabor &amp; Luta</strong> é um mapa comunitário para conectar você a estabelecimentos que praticam preços justos, autogestão, sustentabilidade agroecológica e defesa ativa dos direitos humanos.
          </p>

          {/* Key pillars */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-xs text-white px-2.5 py-1 rounded-md border border-white/25 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-amber-200" /> Autogestão &amp; Coletivos
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-xs text-white px-2.5 py-1 rounded-md border border-white/25 shadow-2xs">
              <Heart className="w-3.5 h-3.5 text-amber-200" /> Direitos Humanos &amp; Diversidade
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-xs text-white px-2.5 py-1 rounded-md border border-white/25 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-amber-300" /> Mapeamento Colaborativo
            </span>
          </div>
        </div>

        {/* Right Side: CTA buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/20 md:border-transparent">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-amber-50 text-[#b91c1c] text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Espaço</span>
            </button>

            <button
              onClick={onOpenMission}
              className="inline-flex items-center justify-center gap-1.5 bg-black/30 hover:bg-black/40 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/30 transition-all shadow-xs cursor-pointer"
            >
              <span>Nossa Missão</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="text-[11px] text-white/80 hover:text-white flex items-center justify-center md:justify-end gap-1 transition-colors pt-0.5 cursor-pointer font-medium"
            title="Ocultar esta explicação"
          >
            <X className="w-3.5 h-3.5 text-white/80" />
            <span>Entendi, ocultar aviso</span>
          </button>
        </div>

      </div>
    </div>
  );
};
