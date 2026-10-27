import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Compass, 
  Map, 
  BookOpen, 
  Heart,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenRegister: () => void;
  activeTab: 'all' | 'map' | 'catalog' | 'mission';
  setActiveTab: (tab: 'all' | 'map' | 'catalog' | 'mission') => void;
  count: number;
  isAdmin?: boolean;
  pendingCount?: number;
  onOpenPending?: () => void;
  onLogoutAdmin?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegister,
  activeTab,
  setActiveTab,
  count,
  isAdmin = false,
  pendingCount = 0,
  onOpenPending,
  onLogoutAdmin,
  darkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'all' | 'map' | 'catalog' | 'mission') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-rose-200/70 dark:border-neutral-800 transition-colors">
      
      {/* Curator Admin Bar (Only when logged in as admin) */}
      {isAdmin && (
        <div className="bg-neutral-900 text-white text-xs py-1.5 px-3 sm:px-4 font-medium border-b border-neutral-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#fbc02d] shrink-0" />
              <span className="font-semibold text-[11px] sm:text-xs">Modo Curadoria Ativo</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenPending && (
                <button
                  onClick={onOpenPending}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all ${
                    pendingCount > 0
                      ? 'bg-amber-400 text-neutral-950 animate-pulse'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    {pendingCount > 0 ? `${pendingCount} Pendentes` : 'Moderação (0)'}
                  </span>
                </button>
              )}

              {onLogoutAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  className="text-neutral-400 hover:text-white underline text-[11px] flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-6 h-16 sm:h-18">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a href="/" className="flex items-center gap-2 group">
              <span className="w-3 h-3 rounded-full bg-[#d32f2f] ring-4 ring-[#d32f2f]/20 shrink-0" />
              <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-[#d32f2f] transition-colors">
                SABOR &amp; LUTA
              </span>
            </a>
            <span className="hidden lg:inline-block text-[11px] font-medium text-rose-800/80 dark:text-rose-400 pl-2 border-l border-rose-200 dark:border-neutral-700">
              Guia da Gastronomia Progressista
            </span>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile) */}
          <nav className="hidden md:flex items-center p-1 bg-rose-50/70 dark:bg-neutral-800 rounded-lg border border-rose-200/70 dark:border-neutral-700">
            <button
              onClick={() => handleTabClick('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => handleTabClick('map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => handleTabClick('catalog')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Catálogo {count > 0 && <span className="ml-1 text-rose-700/80 dark:text-rose-400 font-normal">({count})</span>}
            </button>
            <button
              onClick={() => handleTabClick('mission')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'mission'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Missão
            </button>
          </nav>

          {/* Right Actions: Dark Mode + Register Button + Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Dark Mode Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg border border-rose-200/70 dark:border-neutral-700 bg-rose-50/50 dark:bg-neutral-800 hover:bg-rose-100/60 dark:hover:bg-neutral-700 text-neutral-700 dark:text-amber-400 transition-colors"
              aria-label="Alternar modo escuro"
              title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>

            {/* Direct Cadastrar Espaço Button */}
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Cadastrar Espaço</span>
              <span className="xs:hidden">Cadastrar</span>
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-rose-200/70 dark:border-neutral-700 bg-rose-50/70 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
              aria-label="Abrir menu mobile"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#d32f2f]" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Quick Scrollable Tab Bar (Always accessible on mobile without opening menu) */}
        <div className="md:hidden flex items-center pb-2.5 overflow-x-auto gap-1.5 no-scrollbar scroll-smooth">
          <button
            onClick={() => handleTabClick('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-xs'
                : 'bg-rose-50/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-rose-200/80 dark:border-neutral-700'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => handleTabClick('map')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 ${
              activeTab === 'map'
                ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-xs'
                : 'bg-rose-50/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-rose-200/80 dark:border-neutral-700'
            }`}
          >
            Mapa
          </button>
          <button
            onClick={() => handleTabClick('catalog')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-xs'
                : 'bg-rose-50/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-rose-200/80 dark:border-neutral-700'
            }`}
          >
            Catálogo {count > 0 && `(${count})`}
          </button>
          <button
            onClick={() => handleTabClick('mission')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 ${
              activeTab === 'mission'
                ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-xs'
                : 'bg-rose-50/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-rose-200/80 dark:border-neutral-700'
            }`}
          >
            Missão
          </button>
        </div>

      </div>

      {/* Mobile Expandable Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rose-200/80 dark:border-neutral-800 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="px-4 py-4 space-y-3 max-w-7xl mx-auto">
            
            <p className="text-[11px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider px-1">
              Navegação do Guia
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTabClick('all')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  activeTab === 'all'
                    ? 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-[#d32f2f] dark:text-rose-300'
                    : 'bg-rose-50/50 dark:bg-neutral-800/60 border-rose-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <Compass className="w-4 h-4 text-[#d32f2f] dark:text-rose-400 shrink-0" />
                <span>Visão Geral</span>
              </button>

              <button
                onClick={() => handleTabClick('map')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  activeTab === 'map'
                    ? 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-[#d32f2f] dark:text-rose-300'
                    : 'bg-rose-50/50 dark:bg-neutral-800/60 border-rose-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <Map className="w-4 h-4 text-[#d32f2f] dark:text-rose-400 shrink-0" />
                <span>Mapa Interativo</span>
              </button>

              <button
                onClick={() => handleTabClick('catalog')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  activeTab === 'catalog'
                    ? 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-[#d32f2f] dark:text-rose-300'
                    : 'bg-rose-50/50 dark:bg-neutral-800/60 border-rose-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#d32f2f] dark:text-rose-400 shrink-0" />
                <span>Catálogo ({count})</span>
              </button>

              <button
                onClick={() => handleTabClick('mission')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  activeTab === 'mission'
                    ? 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-[#d32f2f] dark:text-rose-300'
                    : 'bg-rose-50/50 dark:bg-neutral-800/60 border-rose-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <Heart className="w-4 h-4 text-[#d32f2f] dark:text-rose-400 shrink-0" />
                <span>Nossa Missão</span>
              </button>
            </div>

            {/* Quick action button inside drawer */}
            <div className="pt-2 border-t border-rose-100 dark:border-neutral-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Cadastrar Novo Espaço</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
