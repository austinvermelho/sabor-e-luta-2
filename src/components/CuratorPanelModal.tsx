import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Check, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  Clock, 
  RefreshCw, 
  Search, 
  Ban, 
  AlertTriangle, 
  Globe, 
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Calendar,
  MapPin,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Store,
  UserCheck,
  FileText,
  ArrowRight,
  UserMinus
} from 'lucide-react';
import { CheckIn, CuratorUser, BannedIpRecord, Establishment } from '../types';
import { 
  fetchAllCheckInsForCuratorAsync, 
  moderateCheckInStatusAsync, 
  deleteCheckInByCuratorAsync, 
  fetchCuratorUsersAsync, 
  fetchBannedIpsAsync, 
  banIpAsync, 
  unbanIpAsync 
} from '../services/passport';
import { 
  approveEstablishmentEditAsync, 
  rejectEstablishmentEditAsync, 
  manageEstablishmentClaimAsync 
} from '../services/storage';
import { containsInappropriateContent } from '../utils/moderation';
import { ImageLightbox } from './ImageLightbox';

interface CuratorPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishments?: Establishment[];
  onUpdateEstablishments?: (items: Establishment[]) => void;
  onShowToast?: (msg: string) => void;
}

export const CuratorPanelModal: React.FC<CuratorPanelModalProps> = ({
  isOpen,
  onClose,
  establishments = [],
  onUpdateEstablishments,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'relatos' | 'users' | 'banned' | 'edits'>('relatos');
  
  // Data states
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [users, setUsers] = useState<CuratorUser[]>([]);
  const [bannedIps, setBannedIps] = useState<BannedIpRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [relatoFilter, setRelatoFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [relatoSearch, setRelatoSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [bannedSearch, setBannedSearch] = useState('');

  // Selected lightbox photos
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Ban Dialog Modal
  const [banDialogTarget, setBanDialogTarget] = useState<{
    ip: string;
    userId?: string;
    userEmail?: string;
    displayName?: string;
  } | null>(null);
  const [banReason, setBanReason] = useState('Violação das diretrizes e termos de uso da rede.');
  const [isBanning, setIsBanning] = useState(false);

  // Manual IP Ban Form
  const [manualIp, setManualIp] = useState('');
  const [manualReason, setManualReason] = useState('Violação das diretrizes da comunidade.');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cItems, uItems, bItems] = await Promise.all([
        fetchAllCheckInsForCuratorAsync(),
        fetchCuratorUsersAsync(),
        fetchBannedIpsAsync(),
      ]);
      setCheckIns(cItems);
      setUsers(uItems);
      setBannedIps(bItems);
    } catch (err) {
      console.error('Erro ao carregar dados do painel da curadoria:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    onShowToast?.('Dados atualizados com sucesso!');
  };

  // Moderate checkin
  const handleModerate = async (checkInId: string, newStatus: 'approved' | 'rejected') => {
    // Optimistic UI update
    setCheckIns((prev) =>
      prev.map((c) => (c.id === checkInId ? { ...c, status: newStatus } : c))
    );

    const ok = await moderateCheckInStatusAsync(checkInId, newStatus);
    if (ok) {
      onShowToast?.(
        newStatus === 'approved'
          ? 'Relato aprovado e publicado com sucesso!'
          : 'Relato reprovado e ocultado do público.'
      );
    } else {
      onShowToast?.('Não foi possível atualizar o relato. Tente novamente.');
      loadData();
    }
  };

  // Delete checkin
  const handleDeleteCheckIn = async (checkInId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este relato?')) {
      return;
    }
    setCheckIns((prev) => prev.filter((c) => c.id !== checkInId));
    await deleteCheckInByCuratorAsync(checkInId);
    onShowToast?.('Relato removido com sucesso.');
  };

  // Ban IP Confirm
  const handleConfirmBanIp = async () => {
    if (!banDialogTarget || !banDialogTarget.ip) return;
    setIsBanning(true);
    try {
      const updated = await banIpAsync(
        banDialogTarget.ip,
        banReason.trim(),
        banDialogTarget.userId,
        banDialogTarget.userEmail
      );
      setBannedIps(updated);
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.ipAddress === banDialogTarget.ip || (banDialogTarget.userId && u.uid === banDialogTarget.userId)
            ? { ...u, isBanned: true }
            : u
        )
      );

      onShowToast?.(`IP ${banDialogTarget.ip} banido com sucesso!`);
      setBanDialogTarget(null);
      setBanReason('Violação das diretrizes e termos de uso da rede.');
    } catch (err) {
      console.error('Erro ao banir IP:', err);
      onShowToast?.('Falha ao banir IP.');
    } finally {
      setIsBanning(false);
    }
  };

  // Manual Ban Submit
  const handleManualBanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp.trim()) return;
    setIsBanning(true);
    try {
      const updated = await banIpAsync(manualIp.trim(), manualReason.trim());
      setBannedIps(updated);
      setManualIp('');
      setManualReason('Violação das diretrizes da comunidade.');
      onShowToast?.(`IP ${manualIp.trim()} adicionado à lista de bloqueio.`);
    } catch (err) {
      onShowToast?.('Erro ao bloquear IP.');
    } finally {
      setIsBanning(false);
    }
  };

  // Unban IP
  const handleUnbanIp = async (ip: string) => {
    if (!window.confirm(`Deseja desbloquear o acesso para o IP ${ip}?`)) {
      return;
    }
    try {
      const updated = await unbanIpAsync(ip);
      setBannedIps(updated);
      setUsers((prev) =>
        prev.map((u) => (u.ipAddress === ip ? { ...u, isBanned: false } : u))
      );
      onShowToast?.(`IP ${ip} desbloqueado.`);
    } catch {
      onShowToast?.('Falha ao desbanir IP.');
    }
  };

  // Space edits & claims counts
  const pendingSpaceEdits = useMemo(
    () => establishments.filter((e) => !!e.pendingEdit),
    [establishments]
  );

  const pendingSpaceClaims = useMemo(
    () => establishments.filter((e) => e.claimStatus === 'pending'),
    [establishments]
  );

  const totalPendingSpaceActions = pendingSpaceEdits.length + pendingSpaceClaims.length;

  // Space edits approval & claim handlers
  const handleApproveSpaceEdit = async (establishmentId: string) => {
    try {
      const updated = await approveEstablishmentEditAsync(establishmentId);
      onUpdateEstablishments?.(updated);
      onShowToast?.('Edição do espaço aprovada e publicada no catálogo!');
    } catch {
      onShowToast?.('Falha ao aprovar edição.');
    }
  };

  const handleRejectSpaceEdit = async (establishmentId: string) => {
    if (!window.confirm('Deseja recusar esta proposta de alteração?')) return;
    try {
      const updated = await rejectEstablishmentEditAsync(establishmentId);
      onUpdateEstablishments?.(updated);
      onShowToast?.('Proposta de edição rejeitada.');
    } catch {
      onShowToast?.('Falha ao recusar edição.');
    }
  };

  const handleApproveClaim = async (est: Establishment) => {
    try {
      const updated = await manageEstablishmentClaimAsync(est.id, 'approve', {
        uid: est.ownerUid,
        email: est.ownerEmail,
        name: est.ownerName,
      });
      onUpdateEstablishments?.(updated);
      onShowToast?.(`Posse do espaço "${est.name}" atribuída a ${est.ownerEmail || est.ownerName}!`);
    } catch {
      onShowToast?.('Falha ao aprovar posse.');
    }
  };

  const handleRejectClaim = async (establishmentId: string) => {
    if (!window.confirm('Deseja recusar esta solicitação de posse?')) return;
    try {
      const updated = await manageEstablishmentClaimAsync(establishmentId, 'reject');
      onUpdateEstablishments?.(updated);
      onShowToast?.('Reivindicação de posse recusada.');
    } catch {
      onShowToast?.('Falha ao recusar posse.');
    }
  };

  const handleRevokeOwner = async (establishmentId: string) => {
    if (!window.confirm('Tem certeza que deseja desvincular o responsável deste espaço?')) return;
    try {
      const updated = await manageEstablishmentClaimAsync(establishmentId, 'revoke');
      onUpdateEstablishments?.(updated);
      onShowToast?.('Vínculo de responsável desfeito.');
    } catch {
      onShowToast?.('Falha ao desvincular.');
    }
  };

  // Direct assignment form
  const [assignSearch, setAssignSearch] = useState('');
  const [assignSelectedEst, setAssignSelectedEst] = useState<Establishment | null>(null);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignName, setAssignName] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleDirectAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSelectedEst || !assignEmail.trim()) return;
    setIsAssigning(true);
    try {
      const updated = await manageEstablishmentClaimAsync(assignSelectedEst.id, 'approve', {
        email: assignEmail.trim(),
        name: assignName.trim() || assignEmail.split('@')[0],
      });
      onUpdateEstablishments?.(updated);
      onShowToast?.(`Responsável ${assignEmail.trim()} vinculado a "${assignSelectedEst.name}"!`);
      setAssignSelectedEst(null);
      setAssignEmail('');
      setAssignName('');
    } catch {
      onShowToast?.('Erro ao vincular responsável.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter for direct assign search
  const assignEstablishmentsFiltered = useMemo(() => {
    if (!assignSearch.trim()) return establishments.slice(0, 10);
    const q = assignSearch.toLowerCase().trim();
    return establishments.filter(
      (e) => e.name.toLowerCase().includes(q) || e.city.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [establishments, assignSearch]);

  // Counts
  const pendingCheckInsCount = useMemo(
    () => checkIns.filter((c) => c.status === 'pending').length,
    [checkIns]
  );

  // Filtered checkins
  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((item) => {
      if (relatoFilter !== 'all' && item.status !== relatoFilter) {
        return false;
      }
      if (relatoSearch.trim()) {
        const q = relatoSearch.toLowerCase().trim();
        const matchesName = item.authorName?.toLowerCase().includes(q);
        const matchesEmail = item.userEmail?.toLowerCase().includes(q);
        const matchesNote = item.experienceNote?.toLowerCase().includes(q);
        const matchesEst = (item as any).establishmentName?.toLowerCase().includes(q);
        const matchesIp = item.authorIp?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesNote && !matchesEst && !matchesIp) {
          return false;
        }
      }
      return true;
    });
  }, [checkIns, relatoFilter, relatoSearch]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase().trim();
      const matchesName = u.displayName?.toLowerCase().includes(q);
      const matchesEmail = u.email?.toLowerCase().includes(q);
      const matchesUid = u.uid.toLowerCase().includes(q);
      const matchesIp = u.ipAddress?.toLowerCase().includes(q);
      return matchesName || matchesEmail || matchesUid || matchesIp;
    });
  }, [users, userSearch]);

  // Filtered banned IPs
  const filteredBannedIps = useMemo(() => {
    return bannedIps.filter((b) => {
      if (!bannedSearch.trim()) return true;
      const q = bannedSearch.toLowerCase().trim();
      return (
        b.ip.toLowerCase().includes(q) ||
        (b.reason && b.reason.toLowerCase().includes(q)) ||
        (b.userEmail && b.userEmail.toLowerCase().includes(q))
      );
    });
  }, [bannedIps, bannedSearch]);

  // Helper to find establishment name
  const getEstName = (estId: string, fallback?: string) => {
    const found = establishments.find((e) => e.id === estId);
    if (found) return found.name;
    return fallback || 'Espaço Solidário';
  };

  const getEstLocation = (estId: string) => {
    const found = establishments.find((e) => e.id === estId);
    if (found) return `${found.city}/${found.state}`;
    return '';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
        <div 
          className="relative bg-[#fbf8f3] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e4dcce] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#fbf8f3] border-b border-[#e4dcce] px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
                    Painel da Curadoria
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Moderação de relatos do passaporte comunitário e gestão de usuários e segurança de rede.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                title="Recarregar dados"
                className="p-2 text-stone-600 hover:text-red-700 rounded-lg hover:bg-stone-200/50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#f3eee6] border-b border-[#e4dcce] px-5 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setActiveTab('relatos')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'relatos'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white/80 text-stone-700 hover:bg-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Relatos do Passaporte</span>
                {pendingCheckInsCount > 0 && (
                  <span className="bg-amber-400 text-neutral-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {pendingCheckInsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white/80 text-stone-700 hover:bg-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Companheiros ({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('banned')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'banned'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white/80 text-stone-700 hover:bg-white'
                }`}
              >
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>IPs Bloqueados ({bannedIps.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('edits')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'edits'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white/80 text-stone-700 hover:bg-white'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Gestão de Espaços</span>
                {totalPendingSpaceActions > 0 && (
                  <span className="bg-amber-400 text-neutral-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {totalPendingSpaceActions}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* TAB 1: RELATOS */}
            {activeTab === 'relatos' && (
              <div className="space-y-4">
                {/* Filters toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" /> Status:
                    </span>
                    <button
                      onClick={() => setRelatoFilter('pending')}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        relatoFilter === 'pending'
                          ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Pendentes ({pendingCheckInsCount})
                    </button>
                    <button
                      onClick={() => setRelatoFilter('approved')}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        relatoFilter === 'approved'
                          ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Aprovados ({checkIns.filter((c) => c.status === 'approved').length})
                    </button>
                    <button
                      onClick={() => setRelatoFilter('rejected')}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        relatoFilter === 'rejected'
                          ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Rejeitados ({checkIns.filter((c) => c.status === 'rejected').length})
                    </button>
                    <button
                      onClick={() => setRelatoFilter('all')}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        relatoFilter === 'all'
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Todos ({checkIns.length})
                    </button>
                  </div>

                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Buscar autor, texto, IP..."
                      value={relatoSearch}
                      onChange={(e) => setRelatoSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>

                {/* Relatos list */}
                {loading ? (
                  <div className="text-center py-12 text-stone-500 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-stone-400" />
                    Carregando relatos...
                  </div>
                ) : filteredCheckIns.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-stone-200 p-6 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-serif text-base font-bold text-stone-800">
                      Nenhum relato encontrado
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {relatoFilter === 'pending'
                        ? 'Não há relatos pendentes de moderação no momento.'
                        : 'Nenhum registro corresponde aos filtros selecionados.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCheckIns.map((item) => {
                      const isSuspicious = containsInappropriateContent(item.experienceNote);
                      const photos = item.photoUrls || (item.photoUrl ? [item.photoUrl] : []);
                      const isAuthorBanned = item.authorIp && bannedIps.some((b) => b.ip === item.authorIp);

                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-xl border transition-all p-4 sm:p-5 space-y-3.5 ${
                            item.status === 'pending'
                              ? 'border-amber-300 shadow-sm'
                              : item.status === 'rejected'
                              ? 'border-rose-200 opacity-80'
                              : 'border-stone-200'
                          }`}
                        >
                          {/* Card Top: Author, Establishment, Status */}
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-stone-900">
                                  {item.authorName || 'Companheiro(a)'}
                                </span>
                                {item.userEmail && (
                                  <span className="text-xs text-stone-500">
                                    ({item.userEmail})
                                  </span>
                                )}
                                {item.authorIp && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                                    <Globe className="w-3 h-3 text-stone-400" />
                                    IP: {item.authorIp}
                                    {isAuthorBanned && (
                                      <span className="text-[10px] text-rose-600 font-bold ml-1">
                                        (BANIDO)
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-stone-600">
                                <span className="font-semibold text-red-900">
                                  {getEstName(item.establishmentId, (item as any).establishmentName)}
                                </span>
                                {getEstLocation(item.establishmentId) && (
                                  <span>• {getEstLocation(item.establishmentId)}</span>
                                )}
                                <span>• Visita em {item.visitDate}</span>
                              </div>
                            </div>

                            {/* Status badge */}
                            <div>
                              {item.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                  <Clock className="w-3 h-3" /> Pendente
                                </span>
                              )}
                              {item.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  <Check className="w-3 h-3" /> Aprovado
                                </span>
                              )}
                              {item.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                                  <X className="w-3 h-3" /> Rejeitado
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Suspicious words warning banner */}
                          {isSuspicious && (
                            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                <strong>Filtro Automático:</strong> Este relato foi sinalizado previamente por conter possíveis termos ou expressões inadequadas.
                              </span>
                            </div>
                          )}

                          {/* Experience note text */}
                          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-sm text-stone-800 italic relative">
                            "{item.experienceNote}"
                          </div>

                          {/* Photos if attached */}
                          {photos.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                                Fotos anexadas ({photos.length}) - Clique para ampliar:
                              </span>
                              <div className="flex gap-2 flex-wrap">
                                {photos.map((pUrl, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setLightboxImages(photos);
                                      setLightboxIndex(idx);
                                    }}
                                    className="group relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 shadow-2xs hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-red-600"
                                  >
                                    <img
                                      src={pUrl}
                                      alt={`Foto da visita ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                      <Eye className="w-5 h-5" />
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Toolbar */}
                          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {item.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleModerate(item.id, 'approved')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Aprovar</span>
                                </button>
                              )}

                              {item.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleModerate(item.id, 'rejected')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 text-neutral-800 hover:bg-rose-100 hover:text-rose-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Rejeitar</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteCheckIn(item.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-700 rounded-lg hover:bg-stone-100 transition-colors"
                                title="Excluir permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Ban IP trigger */}
                            {item.authorIp && !isAuthorBanned && (
                              <button
                                type="button"
                                onClick={() =>
                                  setBanDialogTarget({
                                    ip: item.authorIp!,
                                    userId: item.userId,
                                    userEmail: item.userEmail,
                                    displayName: item.authorName,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md font-semibold border border-rose-200 transition-colors cursor-pointer"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Banir IP do Autor</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: USUÁRIOS COMPANHEIROS */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Search & stats */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, e-mail, UID ou IP..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-3">
                    <span>
                      Total: <strong className="text-stone-800">{users.length}</strong>
                    </span>
                    <span>
                      Banidos: <strong className="text-rose-700">{users.filter((u) => u.isBanned).length}</strong>
                    </span>
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-stone-200 p-6 space-y-2">
                    <Users className="w-8 h-8 text-stone-400 mx-auto" />
                    <h4 className="font-serif text-base font-bold text-stone-800">
                      Nenhum usuário encontrado
                    </h4>
                    <p className="text-xs text-stone-500">
                      Nenhum companheiro corresponde aos termos da pesquisa.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-[#fbf8f3] border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                          <tr>
                            <th className="py-3 px-4">Companheiro(a)</th>
                            <th className="py-3 px-3">Identificador (UID)</th>
                            <th className="py-3 px-3">Último IP</th>
                            <th className="py-3 px-3 text-center">Visitas</th>
                            <th className="py-3 px-3">Última Atividade</th>
                            <th className="py-3 px-3 text-center">Status</th>
                            <th className="py-3 px-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredUsers.map((u) => {
                            const isUserBanned =
                              u.isBanned || (u.ipAddress && bannedIps.some((b) => b.ip === u.ipAddress));

                            return (
                              <tr key={u.uid} className="hover:bg-stone-50/70 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-900 font-bold text-xs flex items-center justify-center shrink-0 border border-red-200">
                                      {(u.displayName || u.email || 'C')[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-stone-900 leading-tight">
                                        {u.displayName || 'Companheiro(a)'}
                                      </p>
                                      <p className="text-[11px] text-stone-500">
                                        {u.email || 'Sem e-mail'}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                                  <span title={u.uid}>
                                    {u.uid.length > 14 ? `${u.uid.substring(0, 14)}...` : u.uid}
                                  </span>
                                </td>

                                <td className="py-3 px-3 font-mono text-[11px]">
                                  {u.ipAddress ? (
                                    <span className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 text-stone-700">
                                      {u.ipAddress}
                                    </span>
                                  ) : (
                                    <span className="text-stone-400 italic">Não registrado</span>
                                  )}
                                </td>

                                <td className="py-3 px-3 text-center font-bold text-stone-800">
                                  {u.checkInsCount || 0}
                                </td>

                                <td className="py-3 px-3 text-stone-500 text-[11px]">
                                  {u.lastActive ? new Date(u.lastActive).toLocaleDateString('pt-BR') : '-'}
                                </td>

                                <td className="py-3 px-3 text-center">
                                  {isUserBanned ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                                      <Ban className="w-2.5 h-2.5" /> Banido
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                      Ativo
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Action to switch to user's relatos */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRelatoSearch(u.displayName || u.email || u.uid);
                                        setRelatoFilter('all');
                                        setActiveTab('relatos');
                                      }}
                                      title="Ver relatos deste usuário"
                                      className="p-1 text-stone-500 hover:text-red-900 rounded hover:bg-stone-100"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </button>

                                    {u.ipAddress && (
                                      isUserBanned ? (
                                        <button
                                          type="button"
                                          onClick={() => handleUnbanIp(u.ipAddress!)}
                                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
                                        >
                                          Desbanir IP
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setBanDialogTarget({
                                              ip: u.ipAddress!,
                                              userId: u.uid,
                                              userEmail: u.email || undefined,
                                              displayName: u.displayName || undefined,
                                            })
                                          }
                                          className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded border border-rose-200 transition-colors"
                                        >
                                          Banir IP
                                        </button>
                                      )
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: IPS BLOQUEADOS */}
            {activeTab === 'banned' && (
              <div className="space-y-5">
                {/* Manual Ban IP form */}
                <form
                  onSubmit={handleManualBanSubmit}
                  className="bg-white p-4 rounded-xl border border-stone-200 space-y-3"
                >
                  <h4 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Adicionar Bloqueio Manual de IP
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Endereço IP:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 177.136.24.12"
                        value={manualIp}
                        onChange={(e) => setManualIp(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Motivo da Violação:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Spam de publicações ofensivas"
                        value={manualReason}
                        onChange={(e) => setManualReason(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isBanning || !manualIp.trim()}
                        className="w-full py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        {isBanning ? 'Bloqueando...' : 'Bloquear IP'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Search in banned list */}
                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por IP, motivo ou e-mail..."
                      value={bannedSearch}
                      onChange={(e) => setBannedSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <span className="text-xs text-stone-500">
                    Total bloqueados: <strong>{bannedIps.length}</strong>
                  </span>
                </div>

                {filteredBannedIps.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-stone-200 p-6 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-serif text-base font-bold text-stone-800">
                      Nenhum IP bloqueado
                    </h4>
                    <p className="text-xs text-stone-500">
                      Não há endereços IP sob suspensão no momento.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs text-stone-700">
                      <thead className="bg-[#fbf8f3] border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                        <tr>
                          <th className="py-3 px-4">Endereço IP</th>
                          <th className="py-3 px-3">Motivo Registrado</th>
                          <th className="py-3 px-3">Data do Bloqueio</th>
                          <th className="py-3 px-3">Usuário Vinculado</th>
                          <th className="py-3 px-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredBannedIps.map((b) => (
                          <tr key={b.ip} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-rose-800 text-[12px]">
                              {b.ip}
                            </td>
                            <td className="py-3 px-3 text-stone-700 text-xs">
                              {b.reason || 'Violação das diretrizes da comunidade.'}
                            </td>
                            <td className="py-3 px-3 text-stone-500 text-[11px]">
                              {b.bannedAt ? new Date(b.bannedAt).toLocaleString('pt-BR') : '-'}
                            </td>
                            <td className="py-3 px-3 text-stone-500 text-[11px]">
                              {b.userEmail || b.userId || 'Não identificado'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleUnbanIp(b.ip)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition-colors cursor-pointer"
                              >
                                <Unlock className="w-3 h-3" />
                                <span>Desbloquear</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: GESTÃO DE ESPAÇOS E EDIÇÕES */}
            {activeTab === 'edits' && (
              <div className="space-y-6">
                
                {/* 1. Pending Edits Queue */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Edições Propostas por Responsáveis ({pendingSpaceEdits.length})</span>
                    </h4>
                    <span className="text-xs text-stone-500">
                      Revise antes de publicar no mapa e catálogo
                    </span>
                  </div>

                  {pendingSpaceEdits.length === 0 ? (
                    <div className="bg-white rounded-xl border border-stone-200 p-6 text-center text-xs text-stone-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                      Não há nenhuma proposta de edição pendente no momento.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingSpaceEdits.map((est) => {
                        const edit = est.pendingEdit!;
                        return (
                          <div
                            key={est.id}
                            className="bg-white rounded-xl border-2 border-amber-300 p-5 space-y-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
                              <div>
                                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                                  Proposta de Atualização
                                </span>
                                <h5 className="font-serif text-base font-bold text-stone-900">
                                  {est.name}
                                </h5>
                                <p className="text-xs text-stone-500">
                                  Enviada por <strong>{edit.submittedByEmail || edit.submittedByUid}</strong> em{' '}
                                  {new Date(edit.submittedAt).toLocaleString('pt-BR')}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRejectSpaceEdit(est.id)}
                                  className="px-3 py-1.5 bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                >
                                  Recusar Edição
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveSpaceEdit(est.id)}
                                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Aprovar e Publicar</span>
                                </button>
                              </div>
                            </div>

                            {/* Owner notes if present */}
                            {edit.notes && (
                              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-900 border border-amber-200">
                                <strong>Nota do Responsável:</strong> "{edit.notes}"
                              </div>
                            )}

                            {/* Comparison Diff Table */}
                            <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                              <table className="w-full text-left">
                                <thead className="bg-[#fbf8f3] border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase">
                                  <tr>
                                    <th className="py-2 px-3 w-1/4">Campo</th>
                                    <th className="py-2 px-3 w-3/8 text-stone-500">Versão Publicada Atual</th>
                                    <th className="py-2 px-3 w-3/8 text-emerald-900">Nova Proposta</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                  {edit.name && edit.name !== est.name && (
                                    <tr className="bg-amber-50/50">
                                      <td className="py-2 px-3 font-semibold text-stone-700">Nome</td>
                                      <td className="py-2 px-3 text-stone-500 line-through">{est.name}</td>
                                      <td className="py-2 px-3 font-bold text-emerald-800">{edit.name}</td>
                                    </tr>
                                  )}
                                  {edit.description && edit.description !== est.description && (
                                    <tr className="bg-amber-50/50">
                                      <td className="py-2 px-3 font-semibold text-stone-700">Descrição</td>
                                      <td className="py-2 px-3 text-stone-500 text-[11px]">{est.description}</td>
                                      <td className="py-2 px-3 font-medium text-emerald-900 text-[11px]">{edit.description}</td>
                                    </tr>
                                  )}
                                  {edit.address && edit.address !== est.address && (
                                    <tr className="bg-amber-50/50">
                                      <td className="py-2 px-3 font-semibold text-stone-700">Endereço</td>
                                      <td className="py-2 px-3 text-stone-500">{est.address} ({est.city}/{est.state})</td>
                                      <td className="py-2 px-3 font-bold text-emerald-800">{edit.address} ({edit.city || est.city}/{edit.state || est.state})</td>
                                    </tr>
                                  )}
                                  {edit.instagram !== undefined && edit.instagram !== est.instagram && (
                                    <tr className="bg-amber-50/50">
                                      <td className="py-2 px-3 font-semibold text-stone-700">Instagram</td>
                                      <td className="py-2 px-3 text-stone-500">{est.instagram || '-'}</td>
                                      <td className="py-2 px-3 font-bold text-emerald-800">{edit.instagram || '-'}</td>
                                    </tr>
                                  )}
                                  {edit.whatsapp !== undefined && edit.whatsapp !== est.whatsapp && (
                                    <tr className="bg-amber-50/50">
                                      <td className="py-2 px-3 font-semibold text-stone-700">WhatsApp</td>
                                      <td className="py-2 px-3 text-stone-500">{est.whatsapp || '-'}</td>
                                      <td className="py-2 px-3 font-bold text-emerald-800">{edit.whatsapp || '-'}</td>
                                    </tr>
                                  )}
                                  {edit.operatingHours && (
                                    <tr className="bg-amber-50/50">
                                      <td className="py-2 px-3 font-semibold text-stone-700">Horários</td>
                                      <td className="py-2 px-3 text-stone-500">Horários vigentes</td>
                                      <td className="py-2 px-3 text-emerald-900 font-medium">Novos horários propostos anexados</td>
                                    </tr>
                                  )}
                                  {edit.imageUrl && edit.imageUrl !== est.imageUrl && (
                                    <tr className="bg-amber-50/50">
                                      <td className="py-2 px-3 font-semibold text-stone-700">Foto de Capa</td>
                                      <td className="py-2 px-3 text-stone-500">Foto atual</td>
                                      <td className="py-2 px-3">
                                        <img src={edit.imageUrl} alt="Nova foto" className="w-16 h-12 object-cover rounded border" />
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Pending Claims Queue */}
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-red-900" />
                      <span>Reivindicações de Posse Pendentes ({pendingSpaceClaims.length})</span>
                    </h4>
                    <span className="text-xs text-stone-500">
                      Usuários que solicitaram gerenciar um estabelecimento
                    </span>
                  </div>

                  {pendingSpaceClaims.length === 0 ? (
                    <div className="bg-white rounded-xl border border-stone-200 p-6 text-center text-xs text-stone-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                      Não há solicitações de posse pendentes.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingSpaceClaims.map((est) => (
                        <div
                          key={est.id}
                          className="bg-white rounded-xl border-2 border-red-200 p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h5 className="font-serif text-base font-bold text-stone-900">
                                {est.name}
                              </h5>
                              <p className="text-xs text-stone-500">
                                {est.address} — {est.city}/{est.state}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRejectClaim(est.id)}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Recusar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApproveClaim(est)}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-900 hover:bg-red-950 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprovar Posse</span>
                              </button>
                            </div>
                          </div>

                          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs space-y-1">
                            <div>
                              <span className="font-bold text-stone-800">Solicitante:</span>{' '}
                              {est.ownerName || 'Companheiro'} ({est.ownerEmail || 'sem email'})
                            </div>
                            {est.claimedAt && (
                              <div className="text-stone-500 text-[11px]">
                                Solicitado em {new Date(est.claimedAt).toLocaleString('pt-BR')}
                              </div>
                            )}
                            {est.claimMessage && (
                              <div className="pt-1 text-stone-700 italic">
                                "{est.claimMessage}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Direct Owner Assignment */}
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h4 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-red-900" />
                    <span>Atribuição Direta de Responsável (Curadoria)</span>
                  </h4>

                  <form onSubmit={handleDirectAssignSubmit} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          1. Buscar Espaço:
                        </label>
                        <input
                          type="text"
                          placeholder="Nome ou cidade..."
                          value={assignSearch}
                          onChange={(e) => setAssignSearch(e.target.value)}
                          className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                        />
                        <div className="mt-1.5 max-h-28 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100 bg-white">
                          {assignEstablishmentsFiltered.map((e) => (
                            <div
                              key={e.id}
                              onClick={() => setAssignSelectedEst(e)}
                              className={`p-1.5 text-[11px] cursor-pointer ${
                                assignSelectedEst?.id === e.id
                                  ? 'bg-red-50 text-red-900 font-bold'
                                  : 'hover:bg-stone-50 text-stone-700'
                              }`}
                            >
                              {e.name} ({e.city}/{e.state})
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          2. E-mail do Responsável:
                        </label>
                        <input
                          type="email"
                          placeholder="responsavel@espaco.com"
                          value={assignEmail}
                          onChange={(e) => setAssignEmail(e.target.value)}
                          required
                          className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                        />
                        <label className="block text-xs font-bold text-stone-700 mt-2 mb-1">
                          Nome do Responsável:
                        </label>
                        <input
                          type="text"
                          placeholder="Nome / Coletivo"
                          value={assignName}
                          onChange={(e) => setAssignName(e.target.value)}
                          className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-900"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <button
                          type="submit"
                          disabled={isAssigning || !assignSelectedEst || !assignEmail.trim()}
                          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-950 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {isAssigning ? 'Vinculando...' : 'Vincular Responsável'}
                        </button>
                        {assignSelectedEst && (
                          <div className="text-[11px] text-stone-600 mt-2">
                            Espaço: <strong>{assignSelectedEst.name}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                {/* 4. Active Owners List */}
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h4 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>Espaços com Responsável Atribuído</span>
                  </h4>

                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-[#fbf8f3] border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Estabelecimento</th>
                            <th className="py-2.5 px-3">Responsável</th>
                            <th className="py-2.5 px-3">E-mail Cadastrado</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {establishments
                            .filter((e) => e.claimStatus === 'approved' || (e.ownerEmail && e.claimStatus !== 'pending'))
                            .map((e) => (
                              <tr key={e.id} className="hover:bg-stone-50">
                                <td className="py-2 px-3 font-bold text-stone-900">{e.name}</td>
                                <td className="py-2 px-3">{e.ownerName || 'Companheiro'}</td>
                                <td className="py-2 px-3 font-mono text-[11px]">{e.ownerEmail || e.ownerUid}</td>
                                <td className="py-2 px-3">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    Ativo
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeOwner(e.id)}
                                    className="text-stone-400 hover:text-rose-700 p-1 rounded"
                                    title="Desvincular responsável"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Ban IP */}
      {banDialogTarget && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fbf8f3] rounded-2xl max-w-md w-full border-2 border-rose-300 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <span className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-rose-700" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                  Confirmar Banimento de IP
                </h3>
                <p className="text-xs text-rose-700 font-mono font-semibold">
                  {banDialogTarget.ip}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              O endereço IP será imediatamente bloqueado para novos envios de relatos, cadastros de estabelecimentos ou qualquer ação na rede Sabor & Luta.
              {banDialogTarget.displayName && (
                <span className="block mt-1 font-semibold text-stone-800">
                  Autor vinculado: {banDialogTarget.displayName} ({banDialogTarget.userEmail || 'sem email'})
                </span>
              )}
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Motivo do Bloqueio:
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBanDialogTarget(null)}
                className="flex-1 py-2 text-xs font-semibold text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBanIp}
                disabled={isBanning}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 rounded-lg shadow-sm"
              >
                {isBanning ? 'Banindo...' : 'Confirmar Banimento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for viewing photos in high-res */}
      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages(null)}
        />
      )}
    </>
  );
};
