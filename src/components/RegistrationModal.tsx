import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Check, AlertCircle, Sparkles, LocateFixed, Loader2, Lock } from 'lucide-react';
import { Establishment, CategoryType, OperatingHours, UserProfile } from '../types';
import { CATEGORIES, POPULAR_TAGS } from '../utils/categories';
import { OperatingHoursSelector } from './OperatingHoursSelector';
import { searchAddressCoordinates } from '../services/geocoding';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Establishment) => void;
  initialData?: Establishment | null;
  onStartPickOnMap?: () => void;
  pickedCoordinates?: { lat: number; lng: number } | null;
  isAdmin?: boolean;
  currentUser?: UserProfile | null;
  onRequestAuth?: () => void;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  onStartPickOnMap,
  pickedCoordinates,
  isAdmin = false,
  currentUser,
  onRequestAuth,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('bar_popular');
  const [tags, setTags] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState('');
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isOpen: false, open: '09:00', close: '18:00' },
    tuesday: { isOpen: false, open: '09:00', close: '18:00' },
    wednesday: { isOpen: false, open: '09:00', close: '18:00' },
    thursday: { isOpen: false, open: '09:00', close: '18:00' },
    friday: { isOpen: false, open: '09:00', close: '18:00' },
    saturday: { isOpen: false, open: '09:00', close: '18:00' },
    sunday: { isOpen: false, open: '09:00', close: '18:00' },
  });
  const [submittedPublic, setSubmittedPublic] = useState(false);

  // Contato & Redes
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');

  // Geocoding helper states
  const [isSearchingCoord, setIsSearchingCoord] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [coordError, setCoordError] = useState<string | null>(null);
  const [coordSuccess, setCoordSuccess] = useState<string | null>(null);


  // Form error validation
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setTags(initialData.tags || []);
      setCity(initialData.city);
      setState(initialData.state);
      setAddress(initialData.address);
      setLatitude(initialData.latitude?.toString() || '');
      setLongitude(initialData.longitude?.toString() || '');
      setDescription(initialData.description);
      setHistory(initialData.history || '');
      setOperatingHours(typeof initialData.operatingHours === 'object' ? initialData.operatingHours : {
        monday: { isOpen: false, open: '09:00', close: '18:00' },
        tuesday: { isOpen: false, open: '09:00', close: '18:00' },
        wednesday: { isOpen: false, open: '09:00', close: '18:00' },
        thursday: { isOpen: false, open: '09:00', close: '18:00' },
        friday: { isOpen: false, open: '09:00', close: '18:00' },
        saturday: { isOpen: false, open: '09:00', close: '18:00' },
        sunday: { isOpen: false, open: '09:00', close: '18:00' },
      });
      setInstagram(initialData.instagram || '');
      setWhatsapp(initialData.whatsapp || '');
      setWebsite(initialData.website || '');
      setSubmittedPublic(false);
    } else {
      setName('');
      setCategory('bar_popular');
      setTags(['Espaço LGBTQIA+ Acolhedor', 'Preço Popular & Solidário']);
      setCity('');
      setState('SP');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setDescription('');
      setHistory('');
      setOperatingHours({
        monday: { isOpen: false, open: '09:00', close: '18:00' },
        tuesday: { isOpen: false, open: '09:00', close: '18:00' },
        wednesday: { isOpen: false, open: '09:00', close: '18:00' },
        thursday: { isOpen: false, open: '09:00', close: '18:00' },
        friday: { isOpen: false, open: '09:00', close: '18:00' },
        saturday: { isOpen: false, open: '09:00', close: '18:00' },
        sunday: { isOpen: false, open: '09:00', close: '18:00' },
      });
      setInstagram('');
      setWhatsapp('');
      setWebsite('');
      setSubmittedPublic(false);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (pickedCoordinates) {
      setLatitude(pickedCoordinates.lat.toFixed(6));
      setLongitude(pickedCoordinates.lng.toFixed(6));
      setCoordSuccess('Coordenadas capturadas diretamente do clique no mapa!');
    }
  }, [pickedCoordinates]);

  if (!isOpen) return null;

  if (!currentUser && !isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-stone-50 border-2 border-[#b91c1c]/40 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-red-100 text-[#b91c1c] rounded-full flex items-center justify-center mx-auto border border-red-200">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="font-serif text-xl font-bold text-stone-900">
            Identificação Necessária
          </h3>

          <p className="text-xs text-stone-600 leading-relaxed">
            Para cadastrar um novo estabelecimento no guia <strong>Sabor &amp; Luta</strong>, você precisa estar conectado à sua conta de Companheiro(a).
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onRequestAuth?.();
              }}
              className="w-full py-2.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Entrar ou Criar Conta de Companheiro(a)
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleGetDeviceGPS = () => {
    if (!navigator.geolocation) {
      setCoordError('Geolocalização GPS não é suportada neste navegador.');
      return;
    }

    setIsLocatingGPS(true);
    setCoordError(null);
    setCoordSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        setCoordSuccess(`📍 GPS de Alta Precisão capturado! Lat ${lat}, Lng ${lng} (Precisão de ~${Math.round(pos.coords.accuracy || 5)}m)`);
      },
      (err) => {
        setIsLocatingGPS(false);
        setCoordError('Não foi possível obter a posição GPS do dispositivo. Certifique-se de autorizar a localização.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleLookupCoordinates = async () => {
    if (!address && !city) {
      setCoordError('Preencha ao menos o endereço ou a cidade para buscar.');
      return;
    }

    setIsSearchingCoord(true);
    setCoordError(null);
    setCoordSuccess(null);

    const query = `${address}, ${city} - ${state}, Brasil`;
    const results = await searchAddressCoordinates(query);

    setIsSearchingCoord(false);
    if (results.length > 0) {
      const best = results[0];
      setLatitude(best.latitude.toFixed(6));
      setLongitude(best.longitude.toFixed(6));
      const badge = best.precisionType === 'exact_street'
        ? '📍 Precisão Nível de Rua/Número'
        : '⚠️ Precisão Aproximada (Centro da Cidade) — Ajuste clicando no mapa';
      setCoordSuccess(`${badge}: ${best.displayName.slice(0, 80)}`);
    } else {
      const cityResults = await searchAddressCoordinates(`${city} - ${state}, Brasil`);
      if (cityResults.length > 0) {
        setLatitude(cityResults[0].latitude.toFixed(6));
        setLongitude(cityResults[0].longitude.toFixed(6));
        setCoordSuccess(`Coordenadas aproximadas da cidade de ${city}! Use a opção "Marcar com clique no mapa" para ajustar no portão exato.`);
      } else {
        setCoordError('Não encontramos coordenadas para este endereço. Tente usar GPS, preencher manualmente ou clicar no mapa.');
      }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Por favor, informe o nome do estabelecimento.');
      return;
    }

    if (!city.trim() || !address.trim()) {
      setFormError('Por favor, informe a cidade e o endereço do espaço.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setFormError('As coordenadas de latitude e longitude são obrigatórias para exibir o local no mapa.');
      return;
    }

    if (!description.trim() || description.length < 15) {
      setFormError('Por favor, escreva uma breve descrição ou manifesto sobre os valores do espaço (mínimo 15 caracteres).');
      return;
    }

    const hasOpenDay = Object.values(operatingHours).some(day => day.isOpen);
    if (!hasOpenDay) {
      setFormError('Por favor, informe ao menos um dia de funcionamento.');
      return;
    }

    const nowIso = new Date().toISOString();
    const currentAuthor = isAdmin ? 'Curadoria (ordinario8054)' : 'Colaborador (Comunidade)';

    const payload: Establishment = {
      id: initialData?.id || `est-${Date.now()}`,
      name: name.trim(),
      category,
      tags,
      city: city.trim(),
      state,
      address: address.trim(),
      latitude: latNum,
      longitude: lngNum,
      description: description.trim(),
      operatingHours,
      status: initialData ? initialData.status : (isAdmin ? 'approved' : 'pending'),
      createdAt: initialData?.createdAt || nowIso,
      updatedAt: nowIso,
      updatedBy: currentAuthor,
      ...(history.trim() ? { history: history.trim() } : {}),
      ...(instagram.trim() ? { instagram: instagram.trim() } : {}),
      ...(whatsapp.trim() ? { whatsapp: whatsapp.trim() } : {}),
      ...(website.trim() ? { website: website.trim() } : {}),
    };

    onSave(payload);

    if (!isAdmin) {
      setSubmittedPublic(true);
      setTimeout(() => {
        setSubmittedPublic(false);
        onClose();
      }, 3000);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#d32f2f]" />
            <h3 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              {initialData ? 'Editar Espaço Cadastrado' : 'Cadastrar Espaço no Guia Progressista'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedPublic ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-display text-2xl font-bold text-neutral-900">
              Cadastro Enviado para Moderação!
            </h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Obrigado por fortalecer a gastronomia progressista. Para garantir a veracidade e os valores do guia, o espaço foi enviado para a moderação e aparecerá no mapa assim que for aprovado pela curadoria.
            </p>
          </div>
        ) : (
          /* Form Container */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* Informative Approval Notice for Public Users */}
            {!isAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-center gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Nota de Moderação:</strong> Seu cadastro será revisado pela equipe de curadoria do Sabor & Luta antes de ser publicado oficialmente no mapa.
                </span>
              </div>
            )}

            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Seção 1: Identificação Básica */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-[#d32f2f] tracking-wider pb-1 border-b border-neutral-100">
                1. Identificação do Espaço
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nome do Estabelecimento / Coletivo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Armazém do Povo, Coletivo Agro, Bar do Zé..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#d32f2f] focus:ring-1 focus:ring-[#d32f2f] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Categoria Principal *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#d32f2f] focus:ring-1 focus:ring-[#d32f2f] text-sm bg-white"
                  >
                    {Object.values(CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bandeiras & Práticas (Tags) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Bandeiras, Práticas & Diferenciais Progressistas
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TAGS.map((tag) => {
                    const selected = tags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1.5 rounded-md transition-colors font-medium border cursor-pointer ${
                          selected
                            ? 'bg-[#d32f2f] text-white border-[#d32f2f]'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Seção 2: Localização & Coordenadas */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-[#d32f2f] tracking-wider pb-1 border-b border-neutral-100">
                2. Localização & Ponto no Mapa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo, Rio de Janeiro, Curitiba..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#d32f2f] focus:ring-1 focus:ring-[#d32f2f] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Estado (UF) *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#d32f2f] focus:ring-1 focus:ring-[#d32f2f] text-sm bg-white"
                  >
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Endereço Completo (Rua, Número, Bairro) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua Augusta, 123 - Consolação"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#d32f2f] focus:ring-1 focus:ring-[#d32f2f] text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleLookupCoordinates}
                    disabled={isSearchingCoord}
                    title="Buscar Latitude e Longitude automaticamente pelo OpenStreetMap"
                    className="bg-neutral-800 hover:bg-neutral-900 text-white px-3.5 py-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
                  >
                    <Search className={`w-3.5 h-3.5 ${isSearchingCoord ? 'animate-spin' : ''}`} />
                    <span>{isSearchingCoord ? 'Buscando...' : 'Buscar no Mapa'}</span>
                  </button>
                </div>
              </div>

              {/* Geocode feedback notices */}
              {coordSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{coordSuccess}</span>
                </div>
              )}
              {coordError && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{coordError}</span>
                </div>
              )}

              {/* Coordenadas manuais e botões de alta precisão */}
              <div className="space-y-2 bg-neutral-50 p-3.5 rounded-lg border border-neutral-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      Latitude (6 casas decimais) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="-23.550520"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded border border-neutral-300 bg-white focus:ring-1 focus:ring-[#d32f2f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      Longitude (6 casas decimais) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="-46.633308"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded border border-neutral-300 bg-white focus:ring-1 focus:ring-[#d32f2f]"
                    />
                  </div>
                </div>

                {/* Accuracy Tools */}
                <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleGetDeviceGPS}
                    disabled={isLocatingGPS}
                    className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer"
                    title="Obter coordenadas com sub-metro de precisão do GPS do seu dispositivo"
                  >
                    {isLocatingGPS ? (
                      <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5 text-sky-600" />
                    )}
                    <span>{isLocatingGPS ? 'Obtendo GPS...' : 'Usar meu GPS Atual (Alta Precisão)'}</span>
                  </button>

                  {onStartPickOnMap && (
                    <button
                      type="button"
                      onClick={onStartPickOnMap}
                      className="text-[#d32f2f] hover:underline font-bold flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Marcar com clique no mapa principal</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Seção 3: Descrição & Manifesto */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-[#d32f2f] tracking-wider pb-1 border-b border-neutral-100">
                3. Manifesto & História da Casa
              </h4>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Por que este espaço faz parte da luta e gastronomia progressista? *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Conte a história do espaço, valores políticos, origem dos ingredientes, compromisso com os trabalhadores e seu papel na comunidade..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#d32f2f] focus:ring-1 focus:ring-[#d32f2f] text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  História / Trajetória de Luta (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Conte brevemente a trajetória do estabelecimento, anos de resistência, fundação ou momentos marcantes..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#d32f2f] focus:ring-1 focus:ring-[#d32f2f] text-sm leading-relaxed"
                />
              </div>

              <div>
                <OperatingHoursSelector 
                  value={operatingHours} 
                  onChange={setOperatingHours} 
                />
              </div>
            </div>

            {/* Seção 4: Redes & Contato */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-[#d32f2f] tracking-wider pb-1 border-b border-neutral-100">
                4. Redes Sociais & Contato (Opcional)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    placeholder="@espaco_solidario"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Site Oficial
                  </label>
                  <input
                    type="text"
                    placeholder="www.espaco.org.br"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-neutral-300"
                  />
                </div>
              </div>
            </div>

            {/* Footer Submit Buttons */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#d32f2f] hover:bg-[#b71c1c] active:scale-95 rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{initialData ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
