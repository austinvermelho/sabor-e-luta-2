import React from 'react';
import { 
  Target, 
  Eye, 
  Flame, 
  Users, 
  HeartHandshake, 
  ShieldCheck, 
  Leaf, 
  Compass, 
  Quote, 
  Plus, 
  Heart, 
  MapPin, 
  Sparkles,
  Building2,
  Globe2,
  HandCoins
} from 'lucide-react';
import { Establishment } from '../types';

interface MissionSectionProps {
  onOpenRegister: () => void;
  onExploreMap: () => void;
  establishments: Establishment[];
}

export const MissionSection: React.FC<MissionSectionProps> = ({
  onOpenRegister,
  onExploreMap,
  establishments = [],
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Editorial Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-900 via-[#b71c1c] to-[#991b1b] text-white p-6 sm:p-10 lg:p-12 shadow-sm border border-rose-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-rose-100 text-xs font-semibold tracking-wide border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Manifesto Sabor & Luta</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Missão, Visão & Valores
          </h2>

          <p className="text-sm sm:text-base text-rose-100/95 leading-relaxed font-normal">
            O <strong>Sabor & Luta</strong> nasceu da convicção de que onde comemos, bebemos e celebramos também é território de disputa cultural e política. Conheça as diretrizes que orientam cada ponto em nosso mapa.
          </p>
        </div>

        {/* Decorative soft glow circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      </div>

      {/* Frase Destaque / Manifesto Curto */}
      <div className="relative bg-white/95 rounded-2xl border border-rose-200/80 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100/80 text-[#d32f2f] flex items-center justify-center shrink-0 border border-rose-200/70">
            <Quote className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-2 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Manifesto Coletivo
            </span>
            <blockquote className="font-display text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 leading-snug">
              “Cada mesa é um espaço de debate. Cada brinde, um ato de resistência. No Sabor & Luta, conectar você a lugares que compartilham dos seus ideais é a nossa forma de transformar a cidade.”
            </blockquote>
          </div>
        </div>
      </div>

      {/* Aggregate Project Stats Counter Section */}
      {(() => {
        const totalEstablishments = establishments.length;
        const coveredStates = new Set(establishments.map((e: Establishment) => e.state)).size;
        const solidarySpacesCount = establishments.filter(
          (e: Establishment) => 
            e.category === 'cooperativa' || 
            e.category === 'agroecologia' || 
            e.category === 'cozinha_solidaria' ||
            e.tags?.some((t: string) => t.toLowerCase().includes('solidária') || t.toLowerCase().includes('agroecologia') || t.toLowerCase().includes('cooperativa'))
        ).length;

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat 1 */}
            <div className="bg-white/95 rounded-2xl border border-rose-200/80 p-6 text-center space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#d32f2f] mx-auto flex items-center justify-center border border-rose-200/60">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="font-display text-3xl font-black text-neutral-900 tracking-tight">
                {totalEstablishments}
              </div>
              <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                Estabelecimentos Cadastrados
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white/95 rounded-2xl border border-rose-200/80 p-6 text-center space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#d32f2f] mx-auto flex items-center justify-center border border-rose-200/60">
                <Globe2 className="w-5 h-5" />
              </div>
              <div className="font-display text-3xl font-black text-neutral-900 tracking-tight">
                {coveredStates}
              </div>
              <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                Estados Cobertos
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white/95 rounded-2xl border border-rose-200/80 p-6 text-center space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#d32f2f] mx-auto flex items-center justify-center border border-rose-200/60">
                <HandCoins className="w-5 h-5" />
              </div>
              <div className="font-display text-3xl font-black text-neutral-900 tracking-tight">
                {solidarySpacesCount}
              </div>
              <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                Espaços de Economia Solidária
              </div>
            </div>
          </div>
        );
      })()}

      {/* Missão e Visão - 2 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 🎯 Nossa Missão */}
        <div className="bg-white/95 rounded-2xl border border-rose-200/70 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4 hover:border-rose-300 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#d32f2f] flex items-center justify-center border border-rose-200/60 shrink-0">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="font-display text-xl font-bold text-neutral-900">
                Nossa Missão
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Mapear, visibilizar e fortalecer bares, restaurantes, cafés e espaços culturais no Brasil que funcionam sob os princípios da democracia, inclusão, direitos trabalhistas e justiça social. Queremos conectar frequentadores engajados a estabelecimentos que alimentam não apenas o corpo, mas também a transformação social e a convivência comunitária.
            </p>
          </div>

          <div className="pt-3 border-t border-rose-100 flex items-center gap-1.5 text-xs font-semibold text-rose-900">
            <span>🎯 Propósito em Ação</span>
          </div>
        </div>

        {/* 👁️ Nossa Visão */}
        <div className="bg-white/95 rounded-2xl border border-rose-200/70 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4 hover:border-rose-300 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#d32f2f] flex items-center justify-center border border-rose-200/60 shrink-0">
                <Eye className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="font-display text-xl font-bold text-neutral-900">
                Nossa Visão
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Ser a principal rede e guia geográfico da gastronomia progressista do Brasil, tornando-se referência nacional em economia solidária, valorização da cultura popular e fortalecimento de territórios acolhedores e livres de qualquer forma de opressão.
            </p>
          </div>

          <div className="pt-3 border-t border-rose-100 flex items-center gap-1.5 text-xs font-semibold text-rose-900">
            <span>👁️ Horizonte Transformador</span>
          </div>
        </div>

      </div>

      {/* 🔥 Nossos Valores */}
      <div className="bg-white/95 rounded-2xl border border-rose-200/70 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100/70 text-[#d32f2f] flex items-center justify-center border border-rose-200/70 shrink-0">
            <Flame className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Princípios Fundamentais
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-neutral-900">
              Nossos Valores
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          
          {/* Valor 1 */}
          <div className="bg-rose-50/30 rounded-xl border border-rose-100/90 p-4.5 space-y-2 hover:bg-rose-50/60 transition-colors">
            <div className="flex items-center gap-2 text-[#d32f2f]">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold text-rose-900">1. Coletividade e Economia Solidária</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Acreditamos no comércio justo, na valorização de pequenos produtores, cooperativas e no trabalho digno para todos os trabalhadores da gastronomia e da boemia.
            </p>
          </div>

          {/* Valor 2 */}
          <div className="bg-rose-50/30 rounded-xl border border-rose-100/90 p-4.5 space-y-2 hover:bg-rose-50/60 transition-colors">
            <div className="flex items-center gap-2 text-[#d32f2f]">
              <HeartHandshake className="w-4 h-4" />
              <span className="text-xs font-bold text-rose-900">2. Diversidade e Acolhimento Incondicional</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Nossos espaços parceiros são territórios seguros e abertos para a comunidade LGBTQIA+, população negra, mulheres, povos originários e todas as pluralidades. Não toleramos preconceito, discriminação ou violência.
            </p>
          </div>

          {/* Valor 3 */}
          <div className="bg-rose-50/30 rounded-xl border border-rose-100/90 p-4.5 space-y-2 hover:bg-rose-50/60 transition-colors">
            <div className="flex items-center gap-2 text-[#d32f2f]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold text-rose-900">3. Defesa da Democracia e Direitos Humanos</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Apoiamos o livre debate de ideias, a cultura popular, a liberdade de expressão e a luta contínua por direitos sociais, ambientais e trabalhistas.
            </p>
          </div>

          {/* Valor 4 */}
          <div className="bg-rose-50/30 rounded-xl border border-rose-100/90 p-4.5 space-y-2 hover:bg-rose-50/60 transition-colors">
            <div className="flex items-center gap-2 text-[#d32f2f]">
              <Leaf className="w-4 h-4" />
              <span className="text-xs font-bold text-rose-900">4. Sustentabilidade e Produção Consciente</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Incentivamos o consumo de alimentos locais, agroecológicos, opções vegetarianas/veganas e práticas que respeitem o meio ambiente e o futuro do planeta.
            </p>
          </div>

          {/* Valor 5 */}
          <div className="bg-rose-50/30 rounded-xl border border-rose-100/90 p-4.5 space-y-2 hover:bg-rose-50/60 transition-colors md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 text-[#d32f2f]">
              <Compass className="w-4 h-4" />
              <span className="text-xs font-bold text-rose-900">5. Independência e Transparência</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Construímos uma plataforma colaborativa, alimentada pela própria comunidade, que valoriza o apoio mútuo e a autonomia dos estabelecimentos independentes.
            </p>
          </div>

        </div>
      </div>

      {/* Chamada para Ação Comunitária */}
      <div className="bg-gradient-to-r from-rose-50 via-white to-rose-50/60 rounded-2xl border border-rose-200/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display text-lg sm:text-xl font-bold text-neutral-900">
            Fortaleça a rede da gastronomia solidária
          </h4>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl leading-relaxed">
            Conhece um bar, café, restaurante ou ponto de cultura que compartilha dessa missão? Adicione ao mapa ou apoie a manutenção do guia.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0">
          <button
            onClick={onExploreMap}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#d32f2f]" />
            <span>Ver no Mapa</span>
          </button>


          <button
            onClick={onOpenRegister}
            className="inline-flex items-center gap-1.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Espaço</span>
          </button>
        </div>
      </div>

    </div>
  );
};
