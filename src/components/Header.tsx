import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Heart,
  Lock,
  HandHeart,
  Users,
  Stamp,
  MessageSquare
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
  onOpenVolunteerModal?: () => void;
  onOpenVolunteerListModal?: () => void;
  pendingVolunteerCount?: number;
  onOpenPassport?: () => void;
  passportStampCount?: number;
  onOpenCuratorPanel?: () => void;
  pendingRelatosCount?: number;
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
  onOpenVolunteerModal,
  onOpenVolunteerListModal,
  pendingVolunteerCount = 0,
  onOpenPassport,
  passportStampCount = 0,
  onOpenCuratorPanel,
  pendingRelatosCount = 0,
}) => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'all' | 'map' | 'catalog' | 'mission') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header role="banner" className="sticky top-0 z-40 bg-[#fbf8f3]/95 backdrop-blur-md border-b border-[#e4dcce] transition-colors">
      
      {/* Curator Admin Bar (Only when logged in as admin) */}
      {isAdmin && (
        <div role="region" aria-label="Barra de Moderação do Curador" className="bg-neutral-900 text-white text-xs py-1.5 px-3 sm:px-4 font-medium border-b border-neutral-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#fbc02d] shrink-0" aria-hidden="true" />
              <span className="font-semibold text-[11px] sm:text-xs">Modo Curadoria Ativo</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenCuratorPanel && (
                <button
                  onClick={onOpenCuratorPanel}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer ${
                    pendingRelatosCount > 0
                      ? 'bg-amber-400 text-neutral-950 animate-pulse font-extrabold'
                      : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 text-amber-300" aria-hidden="true" />
                  <span>
                    Painel da Curadoria {pendingRelatosCount > 0 ? `(${pendingRelatosCount} relatos)` : ''}
                  </span>
                </button>
              )}

              {onOpenPending && (
                <button
                  onClick={onOpenPending}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer ${
                    pendingCount > 0
                      ? 'bg-amber-400 text-neutral-950 animate-pulse'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>
                    {pendingCount > 0 ? `${pendingCount} Espaços` : 'Espaços (0)'}
                  </span>
                </button>
              )}

              {onOpenVolunteerListModal && (
                <button
                  onClick={onOpenVolunteerListModal}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-rose-300 cursor-pointer ${
                    pendingVolunteerCount > 0
                      ? 'bg-[#b91c1c] text-white animate-pulse'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Users className="w-3 h-3" aria-hidden="true" />
                  <span>
                    Voluntários {pendingVolunteerCount > 0 ? `(${pendingVolunteerCount})` : ''}
                  </span>
                </button>
              )}

              {onLogoutAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  className="text-neutral-400 hover:text-white underline text-[11px] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-white rounded cursor-pointer"
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
            <a href="/" className="flex items-center gap-2 group rounded-lg focus-visible:ring-2 focus-visible:ring-[#b91c1c] focus-visible:outline-none">
              <span className="w-3 h-3 rounded-full bg-[#b91c1c] ring-4 ring-[#b91c1c]/20 shrink-0" aria-hidden="true" />
              <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-[#141210] group-hover:text-[#b91c1c] transition-colors">
                SABOR &amp; LUTA
              </span>
            </a>
            <span className="hidden lg:inline-block text-[11px] font-semibold text-[#b91c1c] pl-2 border-l border-[#e4dcce]">
              Guia da Gastronomia Progressista
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav aria-label="Navegação principal" className="hidden md:flex items-center p-1 bg-[#f3ede2] rounded-lg border border-[#e4dcce]">
            <button
              onClick={() => handleTabClick('all')}
              aria-current={activeTab === 'all' ? 'page' : undefined}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#b91c1c] ${
                activeTab === 'all'
                  ? 'bg-white text-[#141210] shadow-xs border border-[#e4dcce]'
                  : 'text-[#141210] hover:text-[#b91c1c] hover:bg-white/60'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => handleTabClick('map')}
              aria-current={activeTab === 'map' ? 'page' : undefined}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#b91c1c] ${
                activeTab === 'map'
                  ? 'bg-white text-[#141210] shadow-xs border border-[#e4dcce]'
                  : 'text-[#141210] hover:text-[#b91c1c] hover:bg-white/60'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => handleTabClick('catalog')}
              aria-current={activeTab === 'catalog' ? 'page' : undefined}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#b91c1c] ${
                activeTab === 'catalog'
                  ? 'bg-white text-[#141210] shadow-xs border border-[#e4dcce]'
                  : 'text-[#141210] hover:text-[#b91c1c] hover:bg-white/60'
              }`}
            >
              Catálogo {count > 0 && <span className="ml-1 text-[#b91c1c] font-normal">({count})</span>}
            </button>
            <button
              onClick={() => handleTabClick('mission')}
              aria-current={activeTab === 'mission' ? 'page' : undefined}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#b91c1c] ${
                activeTab === 'mission'
                  ? 'bg-white text-[#141210] shadow-xs border border-[#e4dcce]'
                  : 'text-[#141210] hover:text-[#b91c1c] hover:bg-white/60'
              }`}
            >
              Missão
            </button>
          </nav>

          {/* Right Actions: Passaporte + Volunteer CTA + Register Button + Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Passaporte Sabor & Luta CTA */}
            {onOpenPassport && (
              <button
                onClick={onOpenPassport}
                className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-950 text-amber-100 border border-stone-800 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 relative"
                title="Abrir Passaporte Sabor & Luta"
              >
                <Stamp className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline font-serif">Passaporte</span>
                <span className="sm:hidden font-serif">Passaporte</span>
                {passportStampCount > 0 && (
                  <span className="bg-red-800 text-amber-100 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-red-700">
                    {passportStampCount}
                  </span>
                )}
              </button>
            )}

            {/* Volunteer CTA */}
            {onOpenVolunteerModal && (
              <button
                onClick={onOpenVolunteerModal}
                className="hidden lg:inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-[#b91c1c] border border-rose-200 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                <HandHeart className="w-3.5 h-3.5 text-[#b91c1c]" aria-hidden="true" />
                <span>Seja Voluntário(a)</span>
              </button>
            )}


            {/* Direct Cadastrar Espaço Button */}
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
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
              className="md:hidden p-2 rounded-lg border border-[#e4dcce] bg-[#f3ede2] hover:bg-[#ebe2d3] text-[#141210] transition-colors focus-visible:ring-2 focus-visible:ring-[#b91c1c] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#b91c1c]" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>

          </div>


        </div>

        {/* Mobile Quick Scrollable Tab Bar */}
        <div role="navigation" aria-label="Navegação rápida em abas" className="md:hidden flex items-center pb-2.5 overflow-x-auto gap-1.5 no-scrollbar scroll-smooth">
          <button
            onClick={() => handleTabClick('all')}
            aria-current={activeTab === 'all' ? 'page' : undefined}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#b91c1c] ${
              activeTab === 'all'
                ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-xs'
                : 'bg-[#f3ede2] text-[#141210] border-[#e4dcce]'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => handleTabClick('map')}
            aria-current={activeTab === 'map' ? 'page' : undefined}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#b91c1c] ${
              activeTab === 'map'
                ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-xs'
                : 'bg-[#f3ede2] text-[#141210] border-[#e4dcce]'
            }`}
          >
            Mapa
          </button>
          <button
            onClick={() => handleTabClick('catalog')}
            aria-current={activeTab === 'catalog' ? 'page' : undefined}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#b91c1c] ${
              activeTab === 'catalog'
                ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-xs'
                : 'bg-[#f3ede2] text-[#141210] border-[#e4dcce]'
            }`}
          >
            Catálogo {count > 0 && `(${count})`}
          </button>
          <button
            onClick={() => handleTabClick('mission')}
            aria-current={activeTab === 'mission' ? 'page' : undefined}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#b91c1c] ${
              activeTab === 'mission'
                ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-xs'
                : 'bg-[#f3ede2] text-[#141210] border-[#e4dcce]'
            }`}
          >
            Missão
          </button>
        </div>

      </div>

      {/* Mobile Expandable Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-drawer-menu" className="md:hidden border-t border-[#e4dcce] bg-[#fbf8f3]/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="px-4 py-4 space-y-3.5 max-w-7xl mx-auto">
            
            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full flex items-center justify-between p-3.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded-xl shadow-md transition-all active:scale-[0.99] text-left focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-tight">Cadastrar Novo Espaço</div>
                    <div className="text-[11px] text-amber-100 font-normal">Indique um local progressista</div>
                  </div>
                </div>
              </button>

              {onOpenVolunteerModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenVolunteerModal();
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-rose-50 hover:bg-rose-100 text-[#b91c1c] border border-rose-200 rounded-xl transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-200/60 flex items-center justify-center shrink-0">
                      <HandHeart className="w-5 h-5 text-[#b91c1c]" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">Seja Voluntário(a)</div>
                      <div className="text-[11px] text-rose-800 font-normal">Ajude na curadoria ou tecnologia</div>
                    </div>
                  </div>
                </button>
              )}
            </div>


            {/* Supplementary Options & Controls */}
            <div className="space-y-2 pt-1 border-t border-[#e4dcce]">

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
                  {onOpenCuratorPanel && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenCuratorPanel();
                      }}
                      className="w-full flex items-center justify-between bg-amber-400 hover:bg-amber-300 text-xs font-bold py-2 px-3 rounded-lg text-neutral-950 transition-colors focus-visible:ring-2 focus-visible:ring-amber-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        Painel da Curadoria
                      </span>
                      {pendingRelatosCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-950 text-amber-300 font-bold text-[10px]">
                          {pendingRelatosCount} pendentes
                        </span>
                      )}
                    </button>
                  )}
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
                        Espaços Pendentes
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

