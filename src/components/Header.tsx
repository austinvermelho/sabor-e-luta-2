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
  Heart,
  Lock
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
  onOpenAdminLogin?: () => void;
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
  onOpenAdminLogin,
  darkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'all' | 'map' | 'catalog' | 'mission') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header role="banner" className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-rose-200/70 dark:border-neutral-800 transition-colors">
      
      {/* Curator Admin Bar (Only when logged in as admin) */}
      {isAdmin && (
        <div role="region" aria-label="Barra de Moderação do Curador" className="bg-neutral-900 text-white text-xs py-1.5 px-3 sm:px-4 font-medium border-b border-neutral-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#fbc02d] shrink-0" aria-hidden="true" />
              <span className="font-semibold text-[11px] sm:text-xs">Modo Curadoria Ativo</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenPending && (
                <button
                  onClick={onOpenPending}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-amber-300 ${
                    pendingCount > 0
                      ? 'bg-amber-400 text-neutral-950 animate-pulse'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>
                    {pendingCount > 0 ? `${pendingCount} Pendentes` : 'Moderação (0)'}
                  </span>
                </button>
              )}

              {onLogoutAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  className="text-neutral-400 hover:text-white underline text-[11px] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  <LogOut className="w-3 h-3" aria-hidden="true" />
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
            <a href="/" className="flex items-center gap-2 group rounded-lg focus-visible:ring-2 focus-visible:ring-[#d32f2f] focus-visible:outline-none">
              <span className="w-3 h-3 rounded-full bg-[#d32f2f] ring-4 ring-[#d32f2f]/20 shrink-0" aria-hidden="true" />
              <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-[#d32f2f] transition-colors">
                SABOR &amp; LUTA
              </span>
            </a>
            <span className="hidden lg:inline-block text-[11px] font-medium text-rose-800/80 dark:text-rose-400 pl-2 border-l border-rose-200 dark:border-neutral-700">
              Guia da Gastronomia Progressista
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav aria-label="Navegação principal" className="hidden md:flex items-center p-1 bg-rose-50/70 dark:bg-neutral-800 rounded-lg border border-rose-200/70 dark:border-neutral-700">
            <button
              onClick={() => handleTabClick('all')}
              aria-current={activeTab === 'all' ? 'page' : undefined}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#d32f2f] ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => handleTabClick('map')}
              aria-current={activeTab === 'map' ? 'page' : undefined}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#d32f2f] ${
                activeTab === 'map'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => handleTabClick('catalog')}
              aria-current={activeTab === 'catalog' ? 'page' : undefined}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#d32f2f] ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Catálogo {count > 0 && <span className="ml-1 text-rose-800 dark:text-rose-400 font-normal">({count})</span>}
            </button>
            <button
              onClick={() => handleTabClick('mission')}
              aria-current={activeTab === 'mission' ? 'page' : undefined}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#d32f2f] ${
                activeTab === 'mission'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
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
              aria-pressed={darkMode}
              aria-label={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              className="p-2 rounded-lg border border-rose-200/70 dark:border-neutral-700 bg-rose-50/50 dark:bg-neutral-800 hover:bg-rose-100/60 dark:hover:bg-neutral-700 text-neutral-800 dark:text-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-[#d32f2f]"
              title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" /> : <Moon className="w-4 h-4 text-neutral-800" aria-hidden="true" />}
            </button>

            {/* Direct Cadastrar Espaço Button */}
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" aria-hidden="true" />
              <span className="hidden xs:inline">Cadastrar Espaço</span>
              <span className="xs:hidden">Cadastrar</span>
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer-menu"
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              className="md:hidden p-2 rounded-lg border border-rose-200/70 dark:border-neutral-700 bg-rose-50/70 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#d32f2f]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#d32f2f]" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>

          </div>

        </div>

        {/* Mobile Quick Scrollable Tab Bar */}
        <div role="navigation" aria-label="Navegação rápida em abas" className="md:hidden flex items-center pb-2.5 overflow-x-auto gap-1.5 no-scrollbar scroll-smooth">
          <button
            onClick={() => handleTabClick('all')}
            aria-current={activeTab === 'all' ? 'page' : undefined}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#d32f2f] ${
              activeTab === 'all'
                ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-xs'
                : 'bg-rose-50/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-rose-200/80 dark:border-neutral-700'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => handleTabClick('map')}
            aria-current={activeTab === 'map' ? 'page' : undefined}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#d32f2f] ${
              activeTab === 'map'
                ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-xs'
                : 'bg-rose-50/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-rose-200/80 dark:border-neutral-700'
            }`}
          >
            Mapa
          </button>
          <button
            onClick={() => handleTabClick('catalog')}
            aria-current={activeTab === 'catalog' ? 'page' : undefined}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#d32f2f] ${
              activeTab === 'catalog'
                ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-xs'
                : 'bg-rose-50/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-rose-200/80 dark:border-neutral-700'
            }`}
          >
            Catálogo {count > 0 && `(${count})`}
          </button>
          <button
            onClick={() => handleTabClick('mission')}
            aria-current={activeTab === 'mission' ? 'page' : undefined}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#d32f2f] ${
              activeTab === 'mission'
                ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-xs'
                : 'bg-rose-50/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-rose-200/80 dark:border-neutral-700'
            }`}
          >
            Missão
          </button>
        </div>

      </div>

      {/* Mobile Expandable Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-drawer-menu" className="md:hidden border-t border-rose-200/80 dark:border-neutral-800 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="px-4 py-4 space-y-3.5 max-w-7xl mx-auto">
            
            {/* Primary Action Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] text-white rounded-xl shadow-md transition-all active:scale-[0.99] text-left focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight">Cadastrar Novo Espaço</div>
                  <div className="text-[11px] text-rose-100 font-normal">Indique um restaurante, bar ou café progressista</div>
                </div>
              </div>
            </button>

            {/* Supplementary Options & Controls */}
            <div className="space-y-2 pt-1 border-t border-rose-100 dark:border-neutral-800">
              
              {/* Dark Mode Row */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 dark:bg-neutral-800/60 border border-rose-200/50 dark:border-neutral-700/60">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" /> : <Moon className="w-4 h-4 text-neutral-700 dark:text-neutral-300" aria-hidden="true" />}
                  <span>Aparência</span>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  aria-pressed={darkMode}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border border-rose-200 dark:border-neutral-600 shadow-2xs hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#d32f2f]"
                >
                  {darkMode ? 'Modo Escuro' : 'Modo Claro'}
                </button>
              </div>

              {/* Curator / Admin Section */}
              {isAdmin ? (
                <div className="p-3 rounded-xl bg-neutral-900 text-white border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-amber-400">
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                      Modo Curadoria Ativo
                    </span>
                    {onLogoutAdmin && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onLogoutAdmin();
                        }}
                        className="text-neutral-400 hover:text-white underline text-[11px] focus-visible:ring-2 focus-visible:ring-white"
                      >
                        Sair
                      </button>
                    )}
                  </div>
                  {onOpenPending && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPending();
                      }}
                      className="w-full flex items-center justify-between bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold py-2 px-3 rounded-lg text-amber-300 transition-colors focus-visible:ring-2 focus-visible:ring-amber-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        Aprovações Pendentes
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-[10px]">
                        {pendingCount}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                onOpenAdminLogin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 dark:bg-neutral-800/60 border border-rose-200/50 dark:border-neutral-700/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-rose-100/70 transition-colors focus-visible:ring-2 focus-visible:ring-[#d32f2f]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                      <span>Área do Curador (Moderação)</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-rose-800 dark:text-rose-400">Entrar</span>
                  </button>
                )
              )}

              {/* Quick Mission Shortcut */}
              <button
                onClick={() => handleTabClick('mission')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 dark:bg-neutral-800/60 border border-rose-200/50 dark:border-neutral-700/60 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-rose-100/70 transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#d32f2f]"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-[#d32f2f] shrink-0" aria-hidden="true" />
                  <span>Conhecer a Missão &amp; Manifesto</span>
                </div>
                <span className="text-[11px] text-rose-800 dark:text-rose-400 font-bold">Ver &rarr;</span>
              </button>

            </div>

          </div>
        </div>
      )}

    </header>
  );
};

