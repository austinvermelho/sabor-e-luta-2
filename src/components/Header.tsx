import React from 'react';
import { Plus, Heart, Clock, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-rose-200/70 dark:border-neutral-800 transition-colors">
      
      {/* Curator Admin Bar (Only when logged in as admin) */}
      {isAdmin && (
        <div className="bg-neutral-900 text-white text-xs py-1.5 px-4 font-medium border-b border-neutral-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#fbc02d]" />
              <span className="font-semibold">Modo Curadoria Ativo</span>
            </div>

            <div className="flex items-center gap-3">
              {onOpenPending && (
                <button
                  onClick={onOpenPending}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full transition-all ${
                    pendingCount > 0
                      ? 'bg-amber-400 text-neutral-950 animate-pulse'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    {pendingCount > 0 ? `${pendingCount} Cadastros Pendentes` : 'Moderação (0)'}
                  </span>
                </button>
              )}

              {onLogoutAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  className="text-neutral-400 hover:text-white underline text-[11px] flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sair</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6 h-18">
          
          {/* Zone 1: Single clean text brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="/" className="flex items-center gap-2 group">
              <span className="w-3 h-3 rounded-full bg-[#d32f2f] ring-4 ring-[#d32f2f]/20 shrink-0" />
              <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-[#d32f2f] transition-colors">
                SABOR & LUTA
              </span>
            </a>
            <span className="hidden md:inline-block text-[11px] font-medium text-rose-800/80 dark:text-rose-400 pl-2 border-l border-rose-200 dark:border-neutral-700">
              Guia da Gastronomia Progressista
            </span>
          </div>

          {/* Zone 2: Minimalist Segmented Tabs with soft red tones */}
          <nav className="flex items-center p-1 bg-rose-50/70 dark:bg-neutral-800 rounded-lg border border-rose-200/70 dark:border-neutral-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'map'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Catálogo {count > 0 && <span className="ml-1 text-rose-700/80 dark:text-rose-400 font-normal">({count})</span>}
            </button>
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'mission'
                  ? 'bg-white dark:bg-neutral-900 text-rose-950 dark:text-rose-200 font-bold shadow-xs border border-rose-200/80 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              Missão
            </button>
          </nav>

          {/* Zone 3: Actions & Dark Mode Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Dark Mode Toggle */}
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
              className="inline-flex items-center gap-1.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Espaço</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
