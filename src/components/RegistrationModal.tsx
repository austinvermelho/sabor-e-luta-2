import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Establishment, CategoryType } from '../types';
import { CATEGORIES, POPULAR_TAGS } from '../utils/categories';
import { searchAddressCoordinates } from '../services/geocoding';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Establishment) => void;
  initialData?: Establishment | null;
  onStartPickOnMap?: () => void;
  pickedCoordinates?: { lat: number; lng: number } | null;
  isAdmin?: boolean;
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
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('bar_popular');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSuggestingTag, setIsSuggestingTag] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [submittedPublic, setSubmittedPublic] = useState(false);

  // Contato & Redes
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');

  // Geocoding helper states
  const [isSearchingCoord, setIsSearchingCoord] = useState(false);
  const [coordError, setCoordError] = useState<string | null>(null);
  const [coordSuccess, setCoordSuccess] = useState<string | null>(null);

  // Form error validation
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setSuggestedCategory(initialData.suggestedCategory || '');
      setIsSuggestingCategory(Boolean(initialData.suggestedCategory));
      setTags(initialData.tags || []);
      setSuggestedTags(initialData.suggestedTags || []);
      setNewTagInput('');
      setIsSuggestingTag(false);
      setCity(initialData.city);
      setState(initialData.state);
      setAddress(initialData.address);
      setLatitude(initialData.latitude?.toString() || '');
      setLongitude(initialData.longitude?.toString() || '');
      setDescription(initialData.description);
      setHistory(initialData.history || '');
      setOperatingHours(initialData.operatingHours || '');
      setInstagram(initialData.instagram || '');
      setWhatsapp(initialData.whatsapp || '');
      setWebsite(initialData.website || '');
      setSubmittedPublic(false);
    } else {
      setName('');
      setCategory('bar_popular');
      setSuggestedCategory('');
      setIsSuggestingCategory(false);
      setTags(['Espaço LGBTQIA+ Acolhedor', 'Preço Popular & Solidário']);
      setSuggestedTags([]);
      setNewTagInput('');
      setIsSuggestingTag(false);
      setCity('');
      setState('SP');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setDescription('');
      setHistory('');
      setOperatingHours('');
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

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddSuggestedTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;

    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    if (!suggestedTags.includes(trimmed)) {
      setSuggestedTags([...suggestedTags, trimmed]);
    }
    setNewTagInput('');
  };

  const handleRemoveCustomTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setSuggestedTags(suggestedTags.filter((t) => t !== tagToRemove));
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
      setCoordSuccess(`Ponto encontrado: ${best.displayName.slice(0, 75)}...`);
    } else {
      const cityResults = await searchAddressCoordinates(`${city} - ${state}, Brasil`);
      if (cityResults.length > 0) {
        setLatitude(cityResults[0].latitude.toFixed(6));
        setLongitude(cityResults[0].longitude.toFixed(6));
        setCoordSuccess(`Coordenadas aproximadas da cidade de ${city}!`);
      } else {
        setCoordError('Não encontramos coordenadas para este endereço. Tente preencher manualmente ou clicar no mapa.');
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

    if (!operatingHours.trim()) {
      setFormError('Por favor, informe os dias e horário de funcionamento.');
      return;
    }

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
      history: history.trim() || undefined,
      operatingHours: operatingHours.trim() || undefined,
      instagram: instagram.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      website: website.trim() || undefined,
      suggestedCategory: isSuggestingCategory && suggestedCategory.trim() ? suggestedCategory.trim() : undefined,
      suggestedTags: suggestedTags.length > 0 ? suggestedTags : undefined,
      status: initialData ? initialData.status : (isAdmin ? 'approved' : 'pending'),
      createdAt: initialData?.createdAt || new Date().toISOString(),
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
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Categoria Principal *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSuggestingCategory(!isSuggestingCategory)}
                    className="text-[11px] font-semibold text-[#d32f2f] hover:text-[#b71c1c] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isSuggestingCategory ? 'Fechar sugestão' : 'Sugerir categoria'}</span>
                  </button>
                </div>
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

                {/* Bloco de Sugestão de Nova Categoria */}
                {isSuggestingCategory && (
                  <div className="mt-2.5 p-3 bg-amber-50/80 border border-amber-300/80 rounded-lg space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <span aria-hidden="true">💡</span>
                        <span>Sugerir Nova Categoria</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSuggestingCategory(false);
                          setSuggestedCategory('');
                        }}
                        className="text-[11px] text-amber-700 hover:text-amber-950 underline cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: Padaria Comunitária, Empório Agroflorestal, Pizzaria Popular..."
                      value={suggestedCategory}
                      onChange={(e) => setSuggestedCategory(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#d32f2f] focus:border-[#d32f2f]"
                    />
                    <p className="text-[10.5px] text-amber-900 leading-tight">
                      Não encontrou uma categoria que represente seu espaço? Escreva sua sugestão acima. Nossa equipe de curadoria avaliará a inclusão!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bandeiras & Práticas (Tags) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-neutral-700">
                  Bandeiras, Práticas & Diferenciais Progressistas
                </label>
                <button
                  type="button"
                  onClick={() => setIsSuggestingTag(!isSuggestingTag)}
                  className="text-[11px] font-semibold text-[#d32f2f] hover:text-[#b71c1c] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isSuggestingTag ? 'Fechar sugestão' : 'Sugerir bandeira / prática'}</span>
                </button>
              </div>

              {/* Bloco de Sugestão de Nova Bandeira/Prática */}
              {isSuggestingTag && (
                <div className="mb-3 p-3 bg-amber-50/80 border border-amber-300/80 rounded-lg space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span aria-hidden="true">🚩</span>
                      <span>Sugerir Nova Bandeira ou Prática</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuggestingTag(false);
                        setNewTagInput('');
                      }}
                      className="text-[11px] text-amber-700 hover:text-amber-950 underline cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Horta Comunitária, Livros Livres, Cozinha sem Desperdício..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSuggestedTag();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-md border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#d32f2f] focus:border-[#d32f2f]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSuggestedTag}
                      disabled={!newTagInput.trim()}
                      className="px-3 py-1.5 bg-[#d32f2f] hover:bg-[#b71c1c] disabled:opacity-50 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                  <p className="text-[10.5px] text-amber-900 leading-tight">
                    Sua sugestão será incluída no espaço e enviada para a curadoria avaliar se vira uma bandeira oficial no guia!
                  </p>
                </div>
              )}

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

                {/* Exibir tags sugeridas/customizadas pelo usuário */}
                {suggestedTags.map((tag) => {
                  if (POPULAR_TAGS.includes(tag)) return null;
                  const selected = tags.includes(tag);
                  return (
                    <span
                      key={tag}
                      className={`text-xs px-2.5 py-1.5 rounded-md font-medium border flex items-center gap-1.5 ${
                        selected
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      <span>💡 {tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTag(tag)}
                        title="Remover bandeira sugerida"
                        className="hover:opacity-75 cursor-pointer ml-0.5 text-white/90 hover:text-white font-bold"
                      >
                        ×
                      </button>
                    </span>
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
                  className="bg-neutral-800 hover:bg-neutral-900 text-white px-3.5 py-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
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

            {/* Coordenadas manuais e botão de apontamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 p-3.5 rounded-lg border border-neutral-200">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="-23.550520"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-neutral-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="-46.633308"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-neutral-300 bg-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between text-xs text-neutral-500 pt-1">
                <span>Dica: Use "Buscar no Mapa" ou selecione direto:</span>
                {onStartPickOnMap && (
                  <button
                    type="button"
                    onClick={onStartPickOnMap}
                    className="text-[#d32f2f] hover:underline font-semibold flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Marcar com clique no mapa</span>
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
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Dias e Horário de Funcionamento *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Terça a Domingo, das 11h30 às 23h"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#d32f2f] focus:ring-1 focus:ring-[#d32f2f] text-sm"
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
              className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#d32f2f] hover:bg-[#b71c1c] active:scale-95 rounded-lg transition-all shadow-md flex items-center gap-1.5"
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
