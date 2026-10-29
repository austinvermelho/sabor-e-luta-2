import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  MapPin, 
  Clock, 
  Image as ImageIcon, 
  Instagram, 
  Phone, 
  Globe, 
  ShieldAlert, 
  Check, 
  AlertCircle,
  FileText,
  Upload,
  Info
} from 'lucide-react';
import { Establishment, UserProfile, CategoryType, OperatingHours } from '../types';
import { CATEGORIES } from '../utils/categories';
import { OperatingHoursSelector } from './OperatingHoursSelector';
import { submitEstablishmentEditAsync } from '../services/storage';

interface OwnerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: Establishment | null;
  user: UserProfile | null;
  onSuccess: (updatedEstablishments: Establishment[]) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_HOURS: OperatingHours = {
  monday: { isOpen: false, open: '18:00', close: '23:00' },
  tuesday: { isOpen: true, open: '18:00', close: '23:00' },
  wednesday: { isOpen: true, open: '18:00', close: '23:00' },
  thursday: { isOpen: true, open: '18:00', close: '23:00' },
  friday: { isOpen: true, open: '18:00', close: '01:00' },
  saturday: { isOpen: true, open: '12:00', close: '01:00' },
  sunday: { isOpen: true, open: '12:00', close: '20:00' },
};

export const OwnerEditModal: React.FC<OwnerEditModalProps> = ({
  isOpen,
  onClose,
  establishment,
  user,
  onSuccess,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('bar_popular');
  const [tagsInput, setTagsInput] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(DEFAULT_HOURS);
  const [curatorNotes, setCuratorNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (establishment) {
      // Pre-fill with pending edit if exists, or current published data
      const source = establishment.pendingEdit || establishment;
      setName(source.name || establishment.name);
      setCategory(source.category || establishment.category);
      setTagsInput(source.tags ? source.tags.join(', ') : establishment.tags?.join(', ') || '');
      setCity(source.city || establishment.city);
      setState(source.state || establishment.state);
      setAddress(source.address || establishment.address);
      setDescription(source.description || establishment.description);
      setHistory(source.history || establishment.history || '');
      setInstagram(source.instagram || establishment.instagram || '');
      setWhatsapp(source.whatsapp || establishment.whatsapp || '');
      setWebsite(source.website || establishment.website || '');
      setImageUrl(source.imageUrl || establishment.imageUrl || '');
      setOperatingHours(source.operatingHours || establishment.operatingHours || DEFAULT_HOURS);
      setCuratorNotes(establishment.pendingEdit?.notes || '');
      setError(null);
    }
  }, [establishment, isOpen]);

  if (!isOpen || !establishment) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setImageUrl(canvas.toDataURL('image/jpeg', 0.8));
          setError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Você precisa estar autenticado para enviar edições.');
      return;
    }

    if (!name.trim() || !address.trim() || !city.trim() || !description.trim()) {
      setError('Por favor preencha nome, endereço, cidade e descrição do espaço.');
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const proposedEdit: Partial<Establishment> = {
      name: name.trim(),
      category,
      tags: tags.length > 0 ? tags : establishment.tags,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      address: address.trim(),
      description: description.trim(),
      history: history.trim() || undefined,
      instagram: instagram.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      website: website.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      operatingHours,
    };

    try {
      const updatedList = await submitEstablishmentEditAsync(
        establishment.id,
        user,
        proposedEdit,
        curatorNotes.trim()
      );
      onSuccess(updatedList);
      onShowToast('Atualizações enviadas para a curadoria! Elas entrarão no ar após a aprovação.');
      onClose();
    } catch (err) {
      console.error('Erro ao enviar edição:', err);
      setError('Não foi possível salvar a proposta de edição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-[#fbf8f3] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e4dcce] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#fbf8f3] border-b border-[#e4dcce] px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-900 text-amber-50 flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
                  Editar {establishment.name}
                </h3>
                <span className="text-[10px] font-mono uppercase bg-red-100 text-red-900 px-2 py-0.5 rounded-full font-bold">
                  Gestão do Espaço
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Altere horários, fotos, redes e descrição. As mudanças passam por re-aprovação da curadoria antes de ir ao ar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protection Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 sm:px-6 py-3 flex items-start gap-2.5 text-xs text-amber-900 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Governança Solidária &amp; Transparência Comunitária:</span>{' '}
            Você tem total liberdade para atualizar os dados do seu espaço. Os relatos, notas e fotos postados pelos companheiros no passaporte pertencem à comunidade e à curadoria independente, não sendo passíveis de exclusão ou edição pelo responsável.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Identificação & Categoria */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Informações Básicas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nome do Espaço *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                >
                  {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => (
                    <option key={catKey} value={catKey}>
                      {CATEGORIES[catKey]?.icon} {CATEGORIES[catKey]?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tags Progressistas (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Cerveja artesanal, Vegano, Ocupação cultural, Agroecologia"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
              />
            </div>
          </div>

          {/* Section: Localização */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Endereço &amp; Localização
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Logradouro e Número *
                </label>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    UF *
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="SP"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    required
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Descrição & História */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Descrição &amp; Manifesto
            </h4>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Apresentação Resumida *
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                História, Princípios e Enraizamento Comunitário (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Conte a história do espaço, as lutas apoiadas e a proposta política/gastronômica..."
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
              />
            </div>
          </div>

          {/* Section: Imagem de Capa */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Foto Principal
            </h4>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-300 shrink-0">
                  <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carregar foto do computador</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <div className="text-[11px] text-stone-500">Ou informe a URL de uma imagem:</div>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                />
              </div>
            </div>
          </div>

          {/* Section: Canais de Comunicação */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Redes &amp; Contato
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5 text-rose-700" /> Instagram (@ ou URL)
                </label>
                <input
                  type="text"
                  placeholder="@seuespaco"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" /> WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="11999999999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-700" /> Site Oficial
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                />
              </div>
            </div>
          </div>

          {/* Section: Horários de Funcionamento */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Horários de Funcionamento
            </h4>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200">
              <OperatingHoursSelector
                value={operatingHours}
                onChange={(h) => setOperatingHours(h)}
              />
            </div>
          </div>

          {/* Section: Mensagem para a Curadoria */}
          <div className="space-y-2 pt-3 border-t border-stone-200">
            <label className="block text-xs font-bold text-stone-800">
              Mensagem para a Curadoria (O que você atualizou nesta versão?)
            </label>
            <input
              type="text"
              placeholder="Ex: Atualizamos o horário de domingo e adicionamos o cardápio vegano na descrição."
              value={curatorNotes}
              onChange={(e) => setCuratorNotes(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-900 hover:bg-red-950 text-amber-50 rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Enviando...' : 'Enviar Atualizações para Revisão'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
