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
  ArrowRight,
  LocateFixed,
  Loader2,
  Navigation
} from 'lucide-react';
import { calculateDistanceKm } from './utils/geo';
import { Establishment, AdSenseConfig, ProjectSupportConfig, Volunteer } from './types';
import { 
  getEstablishments, 
  fetchEstablishmentsAsync,
  subscribeToEstablishments,
  saveEstablishments, 
  saveEstablishmentAsync,
  approveEstablishmentAsync,
  rejectEstablishmentAsync,
  deleteEstablishmentAsync,
  fetchVolunteersAsync,
  saveVolunteerAsync,
  updateVolunteerStatusAsync,
  deleteVolunteerAsync,
  subscribeToVolunteers,
  getAdSenseConfig,
  getProjectSupportConfig,
  getAdminPin,
  setAdminPin,
  clearLocalCacheAndReload
} from './services/storage';
import { Header } from './components/Header';
import { Map } from './components/Map';
import { EstablishmentCard } from './components/EstablishmentCard';
import { EstablishmentModal } from './components/EstablishmentModal';
import { RegistrationModal } from './components/RegistrationModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PendingApprovalModal } from './components/PendingApprovalModal';
import { VolunteerModal } from './components/VolunteerModal';
import { VolunteerListModal } from './components/VolunteerListModal';
import { EmptyState } from './components/EmptyState';

import { MissionSection } from './components/MissionSection';
import { SiteDisclaimer } from './components/SiteDisclaimer';
import { AuthModal } from './components/AuthModal';
import { PassportModal } from './components/PassportModal';
import { CheckInModal } from './components/CheckInModal';

import { subscribeToAuth, subscribeToUserCheckIns } from './services/passport';
import { UserProfile, CheckIn } from './types';
import { CATEGORIES } from './utils/categories';


export default function App() {
  // Establishments state - initialized from local storage then updated from central API
  const [establishments, setEstablishments] = useState<Establishment[]>(getEstablishments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<Establishment | null>(null);
  
  // Volunteers state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isVolunteerListModalOpen, setIsVolunteerListModalOpen] = useState(false);

  // User Passport & Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userCheckIns, setUserCheckIns] = useState<CheckIn[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [targetEstablishmentForCheckIn, setTargetEstablishmentForCheckIn] = useState<Establishment | null>(null);


  
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
  
  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'distance' | 'name'>('default');

  // User Geolocation GPS
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      showToast('Seu navegador não suporta geolocalização.');
      return;
    }
    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(userLoc);
        setSortBy('distance');
        showToast('Localização obtida! Ordenando por proximidade.');
      },
      (err) => {
        setIsLocatingUser(false);
        showToast('Não foi possível obter sua localização. Verifique a permissão do GPS.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

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

  // Real-time synchronization of establishments from Firestore with server fallback
  useEffect(() => {
    let isMounted = true;
    const unsubscribeEst = subscribeToEstablishments((items) => {
      if (isMounted && Array.isArray(items)) {
        setEstablishments(items);
      }
    });

    const unsubscribeVol = subscribeToVolunteers((vItems) => {
      if (isMounted && Array.isArray(vItems)) {
        setVolunteers(vItems);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeEst();
      unsubscribeVol();
    };
  }, []);

  // Real-time synchronization of Firebase Auth & User Check-ins
  useEffect(() => {
    let isMounted = true;
    let unsubscribeCheckIns = () => {};

    const unsubscribeAuth = subscribeToAuth((usr) => {
      if (isMounted) {
        setCurrentUser(usr);
        if (usr) {
          unsubscribeCheckIns();
          unsubscribeCheckIns = subscribeToUserCheckIns(usr.uid, (cItems) => {
            if (isMounted && Array.isArray(cItems)) {
              setUserCheckIns(cItems);
            }
          });
        } else {
          unsubscribeCheckIns();
          setUserCheckIns([]);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      unsubscribeCheckIns();
    };
  }, []);


  // Volunteer Handlers
  const handleSaveVolunteer = async (vData: Volunteer) => {
    const updated = await saveVolunteerAsync(vData);
    setVolunteers(updated);
    showToast('Inscrição de voluntário(a) recebida com sucesso!');
  };

  const handleUpdateVolunteerStatus = async (id: string, status: Volunteer['status']) => {
    const updated = await updateVolunteerStatusAsync(id, status);
    setVolunteers(updated);
    showToast('Status do voluntário atualizado!');
  };

  const handleDeleteVolunteer = async (id: string) => {
    const updated = await deleteVolunteerAsync(id);
    setVolunteers(updated);
    showToast('Voluntário removido.');
  };


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
  const filteredEstablishments = approvedEstablishments
    .filter((item) => {
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
    })
    .sort((a, b) => {
      if (sortBy === 'distance' && userLocation) {
        const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distA - distB;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      return 0;
    });

  const availableStates = Array.from(new Set(approvedEstablishments.map((e) => e.state))).sort();

  // Handlers for establishments
  const handleSaveEstablishment = async (data: Establishment) => {
    const isEdit = Boolean(editingItem);
    const updated = await saveEstablishmentAsync(data, isEdit);

    if (isEdit) {
      showToast(`"${data.name}" atualizado com sucesso.`);
    } else {
      if (isAdmin) {
        showToast(`"${data.name}" cadastrado e publicado no guia!`);
      } else {
        showToast(`"${data.name}" enviado com sucesso para a aprovação da moderação!`);
      }
    }

    setEstablishments(updated);
    if (activeModalItem && activeModalItem.id === data.id) {
      setActiveModalItem(data);
    }
    if (data.status === 'approved') {
      setSelectedId(data.id);
    }
    setEditingItem(null);
    setIsPickingCoord(false);
    setPickedCoordinates(null);
  };

  const handleApproveEstablishment = async (id: string) => {
    const updated = await approveEstablishmentAsync(id);
    setEstablishments(updated);
    if (activeModalItem && activeModalItem.id === id) {
      const target = updated.find((e) => e.id === id);
      if (target) setActiveModalItem(target);
    }
    setSelectedId(id);
    resetFilters();
    showToast('Espaço aprovado com sucesso! Publicado no mapa e catálogo público.');
  };

  const handleRejectEstablishment = async (id: string) => {
    const updated = await rejectEstablishmentAsync(id);
    setEstablishments(updated);
    if (activeModalItem?.id === id) setActiveModalItem(null);
    showToast('Cadastro recusado e removido da moderação.');
  };

  const handleDeleteEstablishment = async (id: string) => {
    const updated = await deleteEstablishmentAsync(id);
    setEstablishments(updated);
    if (selectedId === id) setSelectedId(null);
    if (activeModalItem?.id === id) setActiveModalItem(null);
    showToast('Espaço removido do mapa.');
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
    <div className="min-h-screen bg-[#fbf8f3] text-[#141210] flex flex-col font-sans selection:bg-[#b91c1c] selection:text-white transition-colors">
      
      {/* WCAG 2.1 AA Skip to Content Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#b91c1c] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl focus:ring-4 focus:ring-amber-300 transition-all"
      >
        Pular para o conteúdo principal
      </a>

      {/* Live Site Version Update Alert */}
      {hasNewVersion && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#b91c1c] text-white py-2 px-4 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-md border-b border-[#7f1d1d] z-50 animate-in slide-in-from-top duration-300"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" aria-hidden="true" />
          <span>Uma nova versão do <strong>Sabor &amp; Luta</strong> está disponível!</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 bg-white hover:bg-amber-50 text-[#b91c1c] font-bold px-3 py-1 rounded-md text-[11px] shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-300"
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
        onOpenPending={() => {
          fetchEstablishmentsAsync().then((items) => {
            if (Array.isArray(items)) setEstablishments(items);
          });
          setIsPendingModalOpen(true);
        }}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenVolunteerModal={() => setIsVolunteerModalOpen(true)}
        onOpenVolunteerListModal={() => {
          fetchVolunteersAsync().then((vItems) => {
            if (Array.isArray(vItems)) setVolunteers(vItems);
          });
          setIsVolunteerListModalOpen(true);
        }}
        pendingVolunteerCount={volunteers.filter((v) => v.status === 'pending').length}
        onOpenPassport={() => setIsPassportModalOpen(true)}
        passportStampCount={new Set(userCheckIns.map((c) => c.establishmentId)).size}
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
          <div className="bg-[#f3ede2] rounded-xl border border-[#e4dcce] p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#b91c1c] text-white flex items-center justify-center shrink-0">
                <Quote className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#141210] leading-snug">
                  “Cada mesa é um espaço de debate. Cada brinde, um ato de resistência.”
                </p>
                <p className="text-[11px] text-[#57534e] hidden sm:block">
                  Conectar você a lugares que compartilham dos seus ideais é a nossa forma de transformar a cidade.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('mission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b91c1c] hover:text-white bg-white hover:bg-[#b91c1c] px-3.5 py-1.5 rounded-lg border border-[#e4dcce] transition-colors shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
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
            onOpenVolunteerModal={() => setIsVolunteerModalOpen(true)}
          />
        ) : (

          <>
            {/* Minimalist Filter Bar with WCAG contrast */}
            <div className="bg-white rounded-xl border border-[#e4dcce] p-3 sm:p-3.5 shadow-2xs">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#b91c1c] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <label htmlFor="search-input" className="sr-only">Buscar estabelecimentos no guia</label>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Buscar por nome, bairro, cidade ou proposta (ex: agroecologia, autogestão, samba)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-[#e4dcce] focus:outline-none focus:border-[#b91c1c] focus:ring-2 focus:ring-[#b91c1c]/30 transition-all bg-[#fbf8f3] text-[#141210] placeholder:text-[#78716c]"
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
                    className="px-3 py-2 text-xs rounded-lg border border-[#e4dcce] bg-white font-medium text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
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
                        className="px-3 py-2 text-xs rounded-lg border border-[#e4dcce] bg-white font-medium text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
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

                  {/* GPS Proximity Button */}
                  <button
                    onClick={handleGetUserLocation}
                    disabled={isLocatingUser}
                    title="Ativar meu GPS para calcular distâncias e ordenar por proximidade"
                    className={`px-3 py-2 text-xs rounded-lg font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      userLocation
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-[#f3ede2] text-[#141210] border-[#e4dcce] hover:bg-[#e8decb]'
                    }`}
                  >
                    {isLocatingUser ? (
                      <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    ) : (
                      <LocateFixed className={`w-3.5 h-3.5 ${userLocation ? 'text-emerald-600' : 'text-[#b91c1c]'}`} />
                    )}
                    <span>{userLocation ? 'GPS Ativo' : 'Meu GPS'}</span>
                  </button>

                  {/* Sort Select */}
                  <label htmlFor="sort-select" className="sr-only">Ordenar estabelecimentos</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => {
                      const newSort = e.target.value as 'default' | 'distance' | 'name';
                      if (newSort === 'distance' && !userLocation) {
                        handleGetUserLocation();
                      } else {
                        setSortBy(newSort);
                      }
                    }}
                    className="px-3 py-2 text-xs rounded-lg border border-[#e4dcce] bg-white font-medium text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                  >
                    <option value="default">Ordem Padrão</option>
                    <option value="distance">📍 Mais Próximos (GPS)</option>
                    <option value="name">🔤 Ordem Alfabética (A-Z)</option>
                  </select>

                  {/* Reset filter if active */}
                  {(searchQuery || selectedCategory !== 'all' || selectedState !== 'all' || sortBy !== 'default') && (
                    <button
                      onClick={() => {
                        resetFilters();
                        setSortBy('default');
                      }}
                      aria-label="Limpar todos os filtros de busca"
                      title="Limpar filtros"
                      className="p-2 text-[#b91c1c] hover:text-[#991b1b] rounded-lg hover:bg-[#f3ede2] transition-colors focus-visible:ring-2 focus-visible:ring-[#b91c1c]"
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
                      Exibindo <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-100/80 text-rose-900 font-bold text-[11px]">{filteredEstablishments.length}</span> de {approvedEstablishments.length} locais
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
                          onOpenCheckIn={(item) => {
                            setTargetEstablishmentForCheckIn(item);
                            setIsCheckInModalOpen(true);
                          }}
                          isVisited={userCheckIns.some((c) => c.establishmentId === item.id)}
                          userLocation={userLocation}
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
                    Mapa com <strong>{filteredEstablishments.length}</strong> locais
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
                          onOpenCheckIn={(item) => {
                            setTargetEstablishmentForCheckIn(item);
                            setIsCheckInModalOpen(true);
                          }}
                          isVisited={userCheckIns.some((c) => c.establishmentId === item.id)}
                          userLocation={userLocation}
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

      {/* Clean Minimalist Footer with print/woodcut styling */}
      <footer className="mt-16 bg-[#f3ede2] border-t border-[#e4dcce] py-8 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] ring-2 ring-[#b91c1c]/20" />
            <span className="font-display font-bold text-[#141210] tracking-tight">
              SABOR & LUTA
            </span>
            <span aria-hidden="true" className="text-[#e4dcce]">·</span>
            <span className="text-neutral-600">O guia da gastronomia progressista</span>
          </div>

          {/* Clean User-Facing Links */}
          <div className="flex items-center gap-5 text-neutral-700 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('mission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#b91c1c] font-semibold transition-colors cursor-pointer"
            >
              Nossa Missão
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setIsRegisterOpen(true);
              }}
              className="hover:text-[#b91c1c] font-semibold transition-colors cursor-pointer"
            >
              Cadastrar Espaço
            </button>

            <a
              href="mailto:saboreluta@gmail.com"
              className="hover:text-[#b91c1c] font-semibold transition-colors flex items-center gap-1 text-[#b91c1c]"
            >
              <span>Contato: saboreluta@gmail.com</span>
            </a>

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
                  onClick={() => {
                    fetchEstablishmentsAsync().then((items) => {
                      if (Array.isArray(items)) setEstablishments(items);
                    });
                    setIsPendingModalOpen(true);
                  }}
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
        onOpenCheckIn={(item) => {
          setTargetEstablishmentForCheckIn(item);
          setIsCheckInModalOpen(true);
        }}
        isVisited={activeModalItem ? userCheckIns.some((c) => c.establishmentId === activeModalItem.id) : false}
        isAdmin={isAdmin}
        userLocation={userLocation}
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
        onRefresh={() => {
          fetchEstablishmentsAsync().then((items) => {
            if (Array.isArray(items)) setEstablishments(items);
          });
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

      {/* Volunteer Registration Modal (Public) */}
      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        onSave={handleSaveVolunteer}
      />

      {/* Volunteer Management List Modal (Curator/Admin) */}
      <VolunteerListModal
        isOpen={isVolunteerListModalOpen}
        onClose={() => setIsVolunteerListModalOpen(false)}
        volunteers={volunteers}
        onUpdateStatus={handleUpdateVolunteerStatus}
        onDelete={handleDeleteVolunteer}
        onRefresh={() => {
          fetchVolunteersAsync().then((vItems) => {
            if (Array.isArray(vItems)) setVolunteers(vItems);
          });
        }}
      />

      {/* Auth Modal (Email / Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(usr) => {
          setCurrentUser(usr);
          showToast('Conectado ao seu Passaporte!');
        }}
      />

      {/* Passport Booklet Modal */}
      <PassportModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        user={currentUser}
        checkIns={userCheckIns}
        establishments={establishments}
        onOpenCheckIn={(item) => {
          setTargetEstablishmentForCheckIn(item);
          setIsCheckInModalOpen(true);
        }}
        onRequestAuth={() => setIsAuthModalOpen(true)}
        onUpdateCheckIns={(updated) => setUserCheckIns(updated)}
      />

      {/* Check-In Visit Registration Modal */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        establishment={targetEstablishmentForCheckIn}
        user={currentUser}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setTargetEstablishmentForCheckIn(null);
        }}
        onSuccess={(updated) => {
          setUserCheckIns(updated);
          showToast('Carimbo registrado com sucesso!');
        }}
        onRequestAuth={() => setIsAuthModalOpen(true)}
      />

    </div>

  );
}

