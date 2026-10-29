import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Edit3, 
  UserCheck, 
  Search, 
  LogIn,
  X,
  Send
} from 'lucide-react';
import { Establishment, UserProfile } from '../types';
import { CATEGORIES } from '../utils/categories';
import { claimEstablishmentAsync } from '../services/storage';

interface MySpacesViewProps {
  user: UserProfile | null;
  establishments: Establishment[];
  onRequestAuth: () => void;
  onOpenRegister: () => void;
  onOpenEdit: (establishment: Establishment) => void;
  onViewPublicPage: (establishment: Establishment) => void;
  onSuccessClaim: (updatedEstablishments: Establishment[]) => void;
  onShowToast: (msg: string) => void;
}

export const MySpacesView: React.FC<MySpacesViewProps> = ({
  user,
  establishments,
  onRequestAuth,
  onOpenRegister,
  onOpenEdit,
  onViewPublicPage,
  onSuccessClaim,
  onShowToast,
}) => {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSearch, setClaimSearch] = useState('');
  const [selectedEstablishmentForClaim, setSelectedEstablishmentForClaim] = useState<Establishment | null>(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Filter establishments owned by current user
  const myEstablishments = useMemo(() => {
    if (!user) return [];
    return establishments.filter(
      (e) => e.ownerUid === user.uid || (user.email && e.ownerEmail === user.email)
    );
  }, [establishments, user]);

  // Candidates for claiming (approved establishments not currently owned by this user)
  const availableToClaim = useMemo(() => {
    if (!user) return [];
    return establishments.filter((e) => {
      if (e.ownerUid === user.uid) return false;
      if (claimSearch.trim()) {
        const q = claimSearch.toLowerCase().trim();
        const matchesName = e.name.toLowerCase().includes(q);
        const matchesCity = e.city.toLowerCase().includes(q);
        const matchesAddress = e.address.toLowerCase().includes(q);
        return matchesName || matchesCity || matchesAddress;
      }
      return true;
    }).slice(0, 15);
  }, [establishments, user, claimSearch]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEstablishmentForClaim) return;

    setClaiming(true);
    setClaimError(null);

    try {
      const updatedList = await claimEstablishmentAsync(
        selectedEstablishmentForClaim.id,
        user,
        claimMessage.trim()
      );
      onSuccessClaim(updatedList);
      onShowToast('Solicitação de posse enviada à curadoria com sucesso!');
      setIsClaimModalOpen(false);
      setSelectedEstablishmentForClaim(null);
      setClaimMessage('');
    } catch (err) {
      console.error('Erro ao solicitar posse:', err);
      setClaimError('Não foi possível enviar a solicitação. Tente novamente.');
    } finally {
      setClaiming(false);
    }
  };

  // State 1: User is not logged in
  if (!user) {
    return (
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-[#fcfbf9] border border-[#e4dcce] rounded-3xl p-6 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-900 text-amber-50 flex items-center justify-center mx-auto shadow-md">
            <Store className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Gestão do Seu Espaço Solidário
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Você é dono(a), gestor(a) ou membro de uma cooperativa, bar popular, livraria cultural ou cozinha solidária?
              Conecte-se com sua conta de companheiro(a) para atualizar seus horários de funcionamento, cardápio, fotos e dados de contato.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onRequestAuth}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-900 hover:bg-red-950 text-amber-50 text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar / Criar Conta</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-xl border border-stone-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-900" />
              <span>Cadastrar Novo Espaço</span>
            </button>
          </div>

          {/* Guidelines box */}
          <div className="mt-8 pt-8 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-stone-600">
            <div className="space-y-1">
              <strong className="text-stone-900 block font-serif text-sm">Autonomia do Espaço</strong>
              Mantenha horários, dias de abertura, telefone e redes sociais sempre atualizados para quem busca seu espaço.
            </div>
            <div className="space-y-1">
              <strong className="text-stone-900 block font-serif text-sm">Revisão Solidária</strong>
              Todas as edições passam pelo olhar fraterno da curadoria antes da publicação, garantindo confiabilidade.
            </div>
            <div className="space-y-1">
              <strong className="text-stone-900 block font-serif text-sm">Passaporte Coletivo</strong>
              Os carimbos e depoimentos dos companheiros são preservados de forma autônoma pela comunidade.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // State 2: User is logged in
  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-[#fbf8f3] border-b border-[#e4dcce] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Meus Espaços Cadastrados
            </h1>
            <span className="text-xs font-mono font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full">
              {myEstablishments.length} {myEstablishments.length === 1 ? 'espaço' : 'espaços'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Espaços sob sua responsabilidade na rede Sabor &amp; Luta. Edite horários, fotos e informações institucionais.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 transition-colors shadow-2xs cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-red-900" />
            <span>Reivindicar Espaço Existente</span>
          </button>
          <button
            onClick={onOpenRegister}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-900 hover:bg-red-950 text-amber-50 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Novo Espaço</span>
          </button>
        </div>
      </div>

      {/* Zero State for logged user with no spaces */}
      {myEstablishments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center mx-auto border border-amber-200">
            <Store className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Nenhum espaço vinculado à sua conta ainda
            </h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              Olá, <strong>{user.displayName || user.email}</strong>! Se o seu bar, restaurante ou cooperativa já está no mapa, você pode reivindicar a posse para administrá-lo, ou cadastrar um novo espaço solidário agora mesmo.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-900 text-amber-50 text-xs font-bold rounded-xl hover:bg-red-950 shadow-sm cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Reivindicar Posse do Meu Espaço</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 hover:bg-stone-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-900" />
              <span>Cadastrar Novo Estabelecimento</span>
            </button>
          </div>
        </div>
      ) : (
        /* List of user's claimed spaces */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myEstablishments.map((est) => {
            const categoryInfo = CATEGORIES[est.category] || {
              label: 'Espaço Progressista',
              icon: '🚩',
            };
            const isClaimPending = est.claimStatus === 'pending';
            const hasPendingEdit = !!est.pendingEdit;

            return (
              <div
                key={est.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col"
              >
                {/* Space Card Top Header */}
                <div className="relative h-44 bg-stone-100 overflow-hidden shrink-0">
                  {est.imageUrl ? (
                    <img
                      src={est.imageUrl}
                      alt={est.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
                      <Store className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-xs mt-1">Sem foto cadastrada</span>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <span>{categoryInfo.icon}</span>
                    <span>{categoryInfo.label}</span>
                  </div>

                  {/* Verification Status Pill */}
                  <div className="absolute top-3 right-3">
                    {isClaimPending ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-400 text-neutral-950 shadow-sm">
                        <Clock className="w-3 h-3" /> Posse em análise
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-sm">
                        <CheckCircle2 className="w-3 h-3" /> Responsável Verificado
                      </span>
                    )}
                  </div>
                </div>

                {/* Space Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        {est.name}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-red-900 shrink-0" />
                        <span>{est.address} — {est.city}/{est.state}</span>
                      </p>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {est.description}
                    </p>

                    {/* Pending Edit Notice */}
                    {hasPendingEdit && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edição submetida aguardando revisão da curadoria</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Enviada em {new Date(est.pendingEdit!.submittedAt).toLocaleString('pt-BR')}. Seus dados públicos atuais continuam no ar até aprovação.
                        </p>
                        {est.pendingEdit!.notes && (
                          <p className="text-[11px] italic text-amber-700">
                            Nota: "{est.pendingEdit!.notes}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onViewPublicPage(est)}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Página Pública</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenEdit(est)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-900 hover:bg-red-950 text-amber-50 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Meu Espaço</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div 
            className="relative bg-[#fbf8f3] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#e4dcce] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#fbf8f3] border-b border-[#e4dcce] px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-red-900 text-amber-50 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif text-base font-bold text-neutral-900">
                    Reivindicar Espaço na Rede
                  </h3>
                  <p className="text-[11px] text-stone-600">
                    Associe seu usuário à gestão do seu bar, restaurante ou coletivo
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsClaimModalOpen(false);
                  setSelectedEstablishmentForClaim(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleClaimSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {claimError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {claimError}
                </div>
              )}

              {/* Step 1: Select Establishment */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  1. Localize o espaço que você representa:
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Digite o nome, cidade ou bairro..."
                    value={claimSearch}
                    onChange={(e) => setClaimSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100 bg-white">
                  {availableToClaim.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400">
                      Nenhum estabelecimento encontrado com esses termos.
                    </div>
                  ) : (
                    availableToClaim.map((item) => {
                      const isSelected = selectedEstablishmentForClaim?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedEstablishmentForClaim(item)}
                          className={`p-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-50 border-l-4 border-l-red-900 text-red-950 font-bold'
                              : 'hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-[11px] text-stone-500 font-normal">
                              {item.city}/{item.state} — {item.address}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-red-900 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Step 2: Justification */}
              {selectedEstablishmentForClaim && (
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                    Espaço selecionado: <strong>{selectedEstablishmentForClaim.name}</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      2. Mensagem para a curadoria (Comprovação de Vínculo):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Sou o proprietário / sócio da cooperativa. Nosso WhatsApp oficial é o mesmo cadastrado na página..."
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                    />
                    <span className="text-[11px] text-stone-500 mt-0.5 block">
                      A curadoria analisará sua solicitação para confirmar a titularidade e ativar suas permissões de edição.
                    </span>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={claiming || !selectedEstablishmentForClaim}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-900 hover:bg-red-950 text-amber-50 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{claiming ? 'Enviando...' : 'Enviar Solicitação de Posse'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
