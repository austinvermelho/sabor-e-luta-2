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
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#d32f2f] dark:text-rose-300 hover:text-[#b71c1c] bg-rose-50 dark:bg-neutral-800 hover:bg-rose-100 px-3 py-1 rounded-full border border-rose-200 dark:border-neutral-700 transition-all cursor-pointer shadow-2xs"
          title="Ver explicação sobre o site"
        >
          <Info className="w-3.5 h-3.5 text-[#d32f2f]" />
          <span>O que é o Sabor &amp; Luta?</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b71c1c] via-[#d32f2f] via-50% to-white dark:from-[#900c0c] dark:via-rose-950 dark:to-neutral-950 p-4 sm:p-5.5 shadow-md border border-rose-300/80 dark:border-neutral-800 transition-all text-white">
      
      {/* Subtle light overlay to smooth out the gradient to white */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-100/20 to-white/95 dark:to-neutral-950/95 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        {/* Left Side: Vibrant Red Base with Crisp White Text */}
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-[11px] font-bold tracking-wide uppercase border border-white/30 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#fbc02d]" />
              Guia Colaborativo &amp; Independente
            </span>
            <span className="hidden sm:inline-block text-rose-200/80 text-xs">•</span>
            <span className="text-xs text-rose-100 font-medium hidden sm:inline-block">
              Gastronomia, Cultura &amp; Economia Solidária
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug drop-shadow-2xs">
            Mapeamos bares, restaurantes, cafés e coletivos compromissados com a transformação social.
          </h2>

          <p className="text-xs sm:text-sm text-rose-50 font-normal leading-relaxed max-w-2xl">
            O <strong className="text-white font-bold underline decoration-rose-300/60 underline-offset-2">Sabor &amp; Luta</strong> é um mapa comunitário para conectar você a estabelecimentos que praticam preços justos, autogestão, sustentabilidade agroecológica e defesa ativa dos direitos humanos.
          </p>

          {/* Key pillars pill tags */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-xs text-white px-2.5 py-1 rounded-md border border-white/25 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-rose-200" /> Autogestão &amp; Coletivos
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-xs text-white px-2.5 py-1 rounded-md border border-white/25 shadow-2xs">
              <Heart className="w-3.5 h-3.5 text-rose-200" /> Direitos Humanos &amp; Diversidade
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-xs text-white px-2.5 py-1 rounded-md border border-white/25 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#fbc02d]" /> Mapeamento Colaborativo
            </span>
          </div>
        </div>

        {/* Right Side: Gradient transition to white with contrast CTA buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/20 md:border-transparent">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center justify-center gap-1.5 bg-[#b71c1c] hover:bg-[#900c0c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 border border-rose-500/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Espaço</span>
            </button>

            <button
              onClick={onOpenMission}
              className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-rose-50 text-neutral-900 text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white dark:border-neutral-700 transition-all shadow-xs cursor-pointer"
            >
              <span className="text-[#b71c1c] dark:text-rose-300">Nossa Missão</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#b71c1c] dark:text-rose-300" />
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center md:justify-end gap-1 transition-colors pt-0.5 cursor-pointer font-medium"
            title="Ocultar esta explicação"
          >
            <X className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
            <span>Entendi, ocultar aviso</span>
          </button>
        </div>

      </div>
    </div>
  );
};
