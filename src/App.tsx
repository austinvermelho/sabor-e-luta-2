import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  Plus, 
  MapPin, 
  Sparkles,
  Heart,
  Lock,
  Clock,
  Quote,
  ArrowRight
} from 'lucide-react';
import { Establishment, AdSenseConfig, ProjectSupportConfig } from './types';
import { 
  getEstablishments, 
  fetchEstablishmentsAsync,
  saveEstablishments, 
  addEstablishment, 
  updateEstablishment, 
  deleteEstablishment,
  approveEstablishment,
  rejectEstablishment,
  getAdSenseConfig,
  getProjectSupportConfig,
  getAdminPin,
  setAdminPin,
  clearLocalCacheAndReload,
  SUGGESTED_EXAMPLES
} from './services/storage';
import { Header } from './components/Header';
import { Map } from './components/Map';
import { EstablishmentCard } from './components/EstablishmentCard';
import { EstablishmentModal } from './components/EstablishmentModal';
import { RegistrationModal } from './components/RegistrationModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PendingApprovalModal } from './components/PendingApprovalModal';
import { EmptyState } from './components/EmptyState';
import { MissionSection } from './components/MissionSection';
import { SiteDisclaimer } from './components/SiteDisclaimer';
import { CATEGORIES } from './utils/categories';

export default function App() {
  // Establishments state - strictly loads from localStorage, starts empty if new
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<Establishment | null>(null);
  
  // Registration Form State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Establishment | null>(null);

  // Curator / Admin mode
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') return true;
      return sessionStorage.getItem('sabor_luta_admin_logged') === 'true';
    }
    return false;
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [adminPin, setAdminPinState] = useState(getAdminPin());
  

  // Navigation & View tabs: 'all' (visão geral), 'map' (mapa), 'catalog' (catálogo), 'mission' (missão & valores)
  const [activeTab, setActiveTab] = useState<'all' | 'map' | 'catalog' | 'mission'>('all');
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sabor_luta_dark') === 'true';
    }
    return false;
  });

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('sabor_luta_dark', String(next));
  };
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');

  // Map interactive coordinate picking mode
  const [isPickingCoord, setIsPickingCoord] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live version checking state
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [initialVersion, setInitialVersion] = useState<number | null>(null);

  // Poll /api/version to detect new site deployments
  useEffect(() => {
    let isMounted = true;

    const checkVersion = async () => {
      try {
        const res = await fetch('/api/version');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.version) {
          if (initialVersion === null) {
            setInitialVersion(data.version);
          } else if (data.version > initialVersion && isMounted) {
            setHasNewVersion(true);
          }
        }
      } catch (err) {
        // Silent catch for network hiccups
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 45000);

    const handleFocus = () => {
      checkVersion();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [initialVersion]);

  // Load from central API server with localStorage fallback on mount
  useEffect(() => {
    const initial = getEstablishments();
    if (initial.length > 0) {
      setEstablishments(initial);
    }
    fetchEstablishmentsAsync().then((items) => {
      if (items && items.length > 0) {
        setEstablishments(items);
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('sabor_luta_admin_logged', 'true');
    showToast('Modo Curadoria desbloqueado: aprovação, edição e exclusão ativas.');
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('sabor_luta_admin_logged');
    showToast('Modo curadoria encerrado.');
  };

  const handleUpdateAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    setAdminPinState(newPin);
    showToast('Nova senha de curadoria salva!');
  };

  // Separation: Approved vs Pending
  const approvedEstablishments = establishments.filter((e) => e.status === 'approved');
  const pendingEstablishments = establishments.filter((e) => e.status === 'pending');

  // Public Catalog & Map strictly list approved items only
  const filteredEstablishments = approvedEstablishments.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesCity = item.city.toLowerCase().includes(q);
      const matchesAddress = item.address.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchesName && !matchesCity && !matchesAddress && !matchesDesc && !matchesTags) {
        return false;
      }
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    if (selectedState !== 'all' && item.state !== selectedState) {
      return false;
    }

    return true;
  });

  const availableStates = Array.from(new Set(approvedEstablishments.map((e) => e.state))).sort();

  // Handlers for establishments
  const handleSaveEstablishment = (data: Establishment) => {
    let updated: Establishment[];
    if (editingItem) {
      updated = updateEstablishment(data);
      showToast(`"${data.name}" atualizado.`);
    } else {
      updated = addEstablishment(data);
      if (isAdmin) {
        showToast(`"${data.name}" cadastrado e aprovado no mapa!`);
      } else {
        showToast(`"${data.name}" enviado com sucesso para a aprovação da moderação!`);
      }
    }
    setEstablishments(updated);
    if (data.status === 'approved') {
      setSelectedId(data.id);
    }
    setEditingItem(null);
    setIsPickingCoord(false);
    setPickedCoordinates(null);
  };

  const handleApproveEstablishment = (id: string) => {
    const updated = approveEstablishment(id);
    setEstablishments(updated);
    setSelectedId(id);
    resetFilters();
    showToast('Espaço aprovado com sucesso! Publicado no mapa e catálogo público.');
  };

  const handleRejectEstablishment = (id: string) => {
    const updated = rejectEstablishment(id);
    setEstablishments(updated);
    showToast('Cadastro recusado e removido da moderação.');
  };

  const handleDeleteEstablishment = (id: string) => {
    const updated = deleteEstablishment(id);
    setEstablishments(updated);
    if (selectedId === id) setSelectedId(null);
    if (activeModalItem?.id === id) setActiveModalItem(null);
    showToast('Espaço removido do mapa.');
  };

  // Load samples on explicit user click
  const handleLoadSamples = () => {
    saveEstablishments(SUGGESTED_EXAMPLES);
    setEstablishments(SUGGESTED_EXAMPLES);
    showToast('3 estabelecimentos sugeridos foram carregados e aprovados.');
  };

  // Interactive Pin Picking on Map
  const handleStartPickOnMap = () => {
    setIsRegisterOpen(false);
    setIsPickingCoord(true);
    showToast('Clique no mapa onde fica o espaço.');
  };

  const handleCoordinatesPicked = (lat: number, lng: number) => {
    setPickedCoordinates({ lat, lng });
    setIsPickingCoord(false);
    setIsRegisterOpen(true);
    showToast(`Ponto selecionado: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleFocusOnMap = (lat: number, lng: number) => {
    setActiveTab('all');
    const mapElement = document.getElementById('interactive-map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedState('all');
  };

  return (
    <div className={darkMode ? 'dark min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-900 selection:text-rose-100 transition-colors' : 'min-h-screen bg-[#faf5f5] bg-gradient-to-b from-rose-50/25 via-[#faf5f5] to-rose-50/15 flex flex-col font-sans text-neutral-900 selection:bg-rose-200 selection:text-rose-950 transition-colors'}>
      
      {/* WCAG 2.1 AA Skip to Content Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#d32f2f] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl focus:ring-4 focus:ring-amber-300 transition-all"
      >
        Pular para o conteúdo principal
      </a>

      {/* Live Site Version Update Alert */}
      {hasNewVersion && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#d32f2f] text-white py-2 px-4 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-md border-b border-rose-900 z-50 animate-in slide-in-from-top duration-300"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" aria-hidden="true" />
          <span>Uma nova versão do <strong>Sabor &amp; Luta</strong> está disponível!</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 bg-white hover:bg-rose-50 text-[#d32f2f] font-bold px-3 py-1 rounded-md text-[11px] shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Atualizar Agora
          </button>
        </div>
      )}

      {/* Clean Minimalist Header */}
      <Header
        onOpenRegister={() => {
          setEditingItem(null);
          setIsRegisterOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        count={approvedEstablishments.length}
        isAdmin={isAdmin}
        pendingCount={pendingEstablishments.length}
        onOpenPending={() => setIsPendingModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Accessible Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-neutral-900/95 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-rose-900/60 flex items-center gap-2 animate-in slide-in-from-bottom-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#fbc02d]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 focus:outline-none">
        
        {/* Top Site Explanation Disclaimer */}
        <SiteDisclaimer
          onOpenRegister={() => {
            setEditingItem(null);
            setIsRegisterOpen(true);
          }}
          onOpenMission={() => {
            setActiveTab('mission');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Picking Coordinates Floating Banner */}
        {isPickingCoord && (
          <div className="bg-[#fbc02d] text-neutral-950 p-3 rounded-xl border border-amber-300 shadow-sm flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <MapPin className="w-4 h-4 text-[#d32f2f]" />
              <span>Clique no mapa abaixo para marcar a localização exata do espaço.</span>
            </div>
            <button
              onClick={() => {
                setIsPickingCoord(false);
                setIsRegisterOpen(true);
              }}
              className="bg-neutral-900 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-neutral-800 transition-colors shrink-0"
            >
              Voltar ao Formulário
            </button>
          </div>
        )}

        {/* Curator Alert Banner if pending items exist */}
        {isAdmin && pendingEstablishments.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Há <strong>{pendingEstablishments.length}</strong> cadastro(s) aguardando sua aprovação para entrar no ar.
              </span>
            </div>
            <button
              onClick={() => setIsPendingModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Revisar Cadastros
            </button>
          </div>
        )}

        {/* Manifesto Callout Banner (Frase Destaque na Home) */}
        {activeTab === 'all' && (
          <div className="bg-gradient-to-r from-rose-50/90 via-white to-rose-50/70 rounded-xl border border-rose-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-100 text-[#d32f2f] flex items-center justify-center shrink-0 border border-rose-200/80">
                <Quote className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug">
                  “Cada mesa é um espaço de debate. Cada brinde, um ato de resistência.”
                </p>
                <p className="text-[11px] text-neutral-500 hidden sm:block">
                  Conectar você a lugares que compartilham dos seus ideais é a nossa forma de transformar a cidade.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('mission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d32f2f] hover:text-[#b71c1c] bg-white hover:bg-rose-50/80 px-3 py-1.5 rounded-lg border border-rose-200/80 transition-colors shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>Conhecer a Missão</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dedicated Mission Section View */}
        {activeTab === 'mission' ? (
          <MissionSection
            onOpenRegister={() => {
              setEditingItem(null);
              setIsRegisterOpen(true);
            }}
            onExploreMap={() => {
              setActiveTab('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            establishments={establishments}
          />
        ) : (
          <>
            {/* Minimalist Filter Bar with WCAG contrast */}
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs rounded-xl border border-rose-200/70 dark:border-neutral-800 p-3 sm:p-3.5 shadow-2xs">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-rose-500 dark:text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <label htmlFor="search-input" className="sr-only">Buscar estabelecimentos no guia</label>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Buscar por nome, bairro, cidade ou proposta (ex: agroecologia, autogestão, samba)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-rose-200/80 dark:border-neutral-700 focus:outline-none focus:border-[#d32f2f] dark:focus:border-rose-400 focus:ring-2 focus:ring-[#d32f2f]/30 transition-all bg-rose-50/25 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Select */}
                  <label htmlFor="category-select" className="sr-only">Filtrar por Categoria</label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-rose-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]"
                  >
                    <option value="all">Todas as Categorias</option>
                    {Object.values(CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.shortLabel}
                      </option>
                    ))}
                  </select>

                  {/* State Select */}
                  {availableStates.length > 0 && (
                    <>
                      <label htmlFor="state-select" className="sr-only">Filtrar por Estado</label>
                      <select
                        id="state-select"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-rose-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]"
                      >
                        <option value="all">Todos os Estados</option>
                        {availableStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {/* Reset filter if active */}
                  {(searchQuery || selectedCategory !== 'all' || selectedState !== 'all') && (
                    <button
                      onClick={resetFilters}
                      aria-label="Limpar todos os filtros de busca"
                      title="Limpar filtros"
                      className="p-2 text-rose-600 dark:text-rose-400 hover:text-[#d32f2f] rounded-lg hover:bg-rose-50 dark:hover:bg-neutral-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#d32f2f]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

              </div>
            </div>

        {/* Empty State when no approved establishments exist */}
        {approvedEstablishments.length === 0 ? (
          <EmptyState
            onOpenRegister={() => {
              setEditingItem(null);
              setIsRegisterOpen(true);
            }}
            onLoadSamples={handleLoadSamples}
          />
        ) : (
          <>
            {/* View Tab 1: Visão Geral (Split: Left Catalog + Sidebar Ad; Right Leaflet Map) */}
            {activeTab === 'all' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Left Side (5 columns) */}
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-neutral-600 font-medium px-1">
                    <span className="flex items-center gap-1.5">
                      Exibindo <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-100/80 text-rose-900 font-bold text-[11px]">{filteredEstablishments.length}</span> de {approvedEstablishments.length} locais aprovados
                    </span>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsRegisterOpen(true);
                      }}
                      className="text-[#d32f2f] hover:text-[#b71c1c] hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cadastrar Espaço</span>
                    </button>
                  </div>

                  {filteredEstablishments.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200/80 p-8 text-center space-y-3">
                      <p className="text-xs text-neutral-500">
                        Nenhum espaço encontrado com os filtros selecionados.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="text-xs font-semibold text-[#d32f2f] hover:underline"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
                      {filteredEstablishments.map((item) => (
                        <EstablishmentCard
                          key={item.id}
                          establishment={item}
                          isSelected={item.id === selectedId}
                          onSelect={(id) => setSelectedId(id)}
                          onOpenDetails={(item) => setActiveModalItem(item)}
                        />
                      ))}
                    </div>
                  )}

                </div>

                {/* Right Side: Sticky Interactive Leaflet Map (7 columns) */}
                <div id="interactive-map-section" className="lg:col-span-7 lg:sticky lg:top-22 h-[520px] lg:h-[720px]">
                  <Map
                    establishments={filteredEstablishments}
                    selectedId={selectedId}
                    onSelectEstablishment={(id) => setSelectedId(id)}
                    onOpenDetails={(item) => setActiveModalItem(item)}
                    interactiveSelectMode={isPickingCoord}
                    onCoordinatesPicked={handleCoordinatesPicked}
                    pickedCoordinates={pickedCoordinates}
                  />
                </div>

              </div>
            )}

            {/* View Tab 2: Mapa Full-Width */}
            {activeTab === 'map' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>
                    Mapa com <strong>{filteredEstablishments.length}</strong> locais aprovados
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    OpenStreetMap livre e integrado ao Google Maps
                  </span>
                </div>
                <div className="h-[75vh] w-full">
                  <Map
                    establishments={filteredEstablishments}
                    selectedId={selectedId}
                    onSelectEstablishment={(id) => setSelectedId(id)}
                    onOpenDetails={(item) => setActiveModalItem(item)}
                    interactiveSelectMode={isPickingCoord}
                    onCoordinatesPicked={handleCoordinatesPicked}
                    pickedCoordinates={pickedCoordinates}
                  />
                </div>
              </div>
            )}

            {/* View Tab 3: Catálogo em Grade */}
            {activeTab === 'catalog' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                <div className="lg:col-span-3 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      Mostrando <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-100/80 text-rose-900 font-bold text-[11px]">{filteredEstablishments.length}</span> estabelecimentos
                    </span>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsRegisterOpen(true);
                      }}
                      className="text-[#d32f2f] hover:text-[#b71c1c] hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cadastrar Novo Espaço</span>
                    </button>
                  </div>

                  {filteredEstablishments.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200/80 p-8 text-center space-y-3">
                      <p className="text-xs text-neutral-500">
                        Nenhum estabelecimento corresponde à sua busca.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="text-xs font-semibold text-[#d32f2f] hover:underline"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {filteredEstablishments.map((item) => (
                        <EstablishmentCard
                          key={item.id}
                          establishment={item}
                          isSelected={item.id === selectedId}
                          onSelect={(id) => setSelectedId(id)}
                          onOpenDetails={(item) => setActiveModalItem(item)}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}
      </>
    )}

      </main>

      {/* Clean Minimalist Footer with soft red undertone */}
      <footer className="mt-16 bg-gradient-to-b from-white/80 to-rose-50/40 dark:from-neutral-900 dark:to-neutral-950 border-t border-rose-200/70 dark:border-neutral-800 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d32f2f] ring-2 ring-[#d32f2f]/20" />
            <span className="font-display font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              SABOR & LUTA
            </span>
            <span aria-hidden="true" className="text-rose-200 dark:text-neutral-700">·</span>
            <span className="text-neutral-500 dark:text-neutral-400">O guia da gastronomia progressista</span>
          </div>

          {/* Clean User-Facing Links */}
          <div className="flex items-center gap-5 text-neutral-600 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('mission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-rose-950 font-medium transition-colors cursor-pointer"
            >
              Nossa Missão
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setIsRegisterOpen(true);
              }}
              className="hover:text-rose-950 transition-colors cursor-pointer"
            >
              Cadastrar Espaço
            </button>


            <a
              href="mailto:saboreluta@gmail.com"
              className="hover:text-rose-950 font-medium transition-colors flex items-center gap-1 text-rose-900 dark:text-rose-400"
            >
              <span>Contato: saboreluta@gmail.com</span>
            </a>

            <button
              onClick={clearLocalCacheAndReload}
              className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors inline-flex items-center gap-1 text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#d32f2f] rounded"
              title="Limpar o armazenamento local e buscar os dados mais recentes do servidor"
            >
              <RotateCcw className="w-3 h-3 text-[#d32f2f]" aria-hidden="true" />
              <span>Sincronizar / Limpar Cache</span>
            </button>

            {/* Discreet Curator Entry */}
            {!isAdmin ? (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors inline-flex items-center gap-1"
                title="Acesso de moderação e curadoria"
              >
                <Lock className="w-3 h-3" />
                <span>Curadoria</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPendingModalOpen(true)}
                  className="text-amber-800 font-bold hover:underline"
                >
                  Moderação ({pendingEstablishments.length})
                </button>
                <button
                  onClick={handleLogoutAdmin}
                  className="text-neutral-500 hover:text-neutral-800 underline"
                >
                  Sair da Curadoria
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Details Modal */}
      <EstablishmentModal
        establishment={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onFocusOnMap={handleFocusOnMap}
        onEdit={(item) => {
          setEditingItem(item);
          setIsRegisterOpen(true);
        }}
        onDelete={handleDeleteEstablishment}
        isAdmin={isAdmin}
      />

      {/* The Beloved Spacious Registration Form Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEstablishment}
        initialData={editingItem}
        onStartPickOnMap={handleStartPickOnMap}
        pickedCoordinates={pickedCoordinates}
        isAdmin={isAdmin}
      />

      {/* Pending Moderation Queue Modal (Admin Only) */}
      <PendingApprovalModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        pendingList={pendingEstablishments}
        onApprove={handleApproveEstablishment}
        onReject={handleRejectEstablishment}
        onEdit={(item) => {
          setEditingItem(item);
          setIsRegisterOpen(true);
        }}
      />


      {/* Admin / Curator Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        currentPin={adminPin}
        onUpdatePin={handleUpdateAdminPin}
      />

    </div>
  );
}
