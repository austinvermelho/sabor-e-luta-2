import React, { useState } from 'react';
import { X, Check, Trash2, Edit3, MapPin, AlertCircle, Clock } from 'lucide-react';
import { Establishment } from '../types';
import { CATEGORIES } from '../utils/categories';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingList: Establishment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (item: Establishment) => void;
}

export const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({
  isOpen,
  onClose,
  pendingList,
  onApprove,
  onReject,
  onEdit,
}) => {
  const [rejectingItem, setRejectingItem] = useState<Establishment | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-neutral-900">
                Cadastros Aguardando Moderação ({pendingList.length})
              </h3>
              <span className="text-xs text-neutral-500">
                Revise os espaços enviados pela comunidade antes de publicá-los no mapa
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {pendingList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="font-display text-lg font-bold text-neutral-900">
                Fila de Moderação Vazia
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Não há nenhum estabelecimento pendente de aprovação no momento. Novos cadastros enviados pelo público aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingList.map((item) => {
                const categoryInfo = CATEGORIES[item.category] || {
                  label: 'Espaço Progressista',
                  shortLabel: 'Progressista',
                  icon: '🚩',
                };

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3.5 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-neutral-200/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                          <span className="font-semibold text-neutral-800 flex items-center gap-1">
                            <span>{categoryInfo.icon}</span>
                            <span>{categoryInfo.label}</span>
                          </span>
                          <span aria-hidden="true" className="text-neutral-300">·</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-[#d32f2f]" />
                            {item.city} - {item.state}
                          </span>
                        </div>
                        <h4 className="font-display text-xl font-bold text-neutral-900">
                          {item.name}
                        </h4>
                        <span className="text-xs text-neutral-600 block mt-0.5">
                          {item.address}
                        </span>
                      </div>

                      <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-md self-start shrink-0 border border-amber-200">
                        Pendente
                      </span>
                    </div>

                    {/* Sugestão de Categoria */}
                    {item.suggestedCategory && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 flex items-center gap-2 text-xs text-amber-950">
                        <span className="text-sm" aria-hidden="true">💡</span>
                        <span>
                          <strong className="font-bold">Categoria sugerida pelo usuário:</strong> "{item.suggestedCategory}"
                        </span>
                      </div>
                    )}

                    {/* Sugestão de Bandeiras/Práticas */}
                    {item.suggestedTags && item.suggestedTags.length > 0 && (
                      <div className="bg-amber-50/70 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-950 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>🚩</span>
                          <span>Bandeiras / Práticas sugeridas pelo usuário:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.suggestedTags.map((tag) => (
                            <span key={tag} className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-medium">
                              + {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manifesto */}
                    <div className="bg-white p-3.5 rounded-lg border border-neutral-200/80 text-xs text-neutral-700 leading-relaxed">
                      <span className="font-semibold text-[11px] uppercase tracking-wider text-[#d32f2f] block mb-1">
                        Manifesto & História
                      </span>
                      <p className="whitespace-pre-line">{item.description}</p>
                    </div>

                    {/* Tags & Contatos */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((t, i) => (
                            <span key={i} className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[11px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                        {item.instagram && <span>IG: {item.instagram}</span>}
                        {item.whatsapp && <span>Zap: {item.whatsapp}</span>}
                        {item.website && <span>Site: {item.website}</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setRejectingItem(item)}
                        className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onEdit(item);
                        }}
                        className="px-3 py-1.5 text-xs text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar antes de aprovar</span>
                      </button>

                      <button
                        onClick={() => onApprove(item.id)}
                        className="px-4 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Aprovar & Publicar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation modal for rejection */}
        <ConfirmDeleteModal
          isOpen={Boolean(rejectingItem)}
          title="Confirmar Recusa de Cadastro"
          establishmentName={rejectingItem?.name}
          message={`Tem certeza de que deseja recusar e excluir o cadastro pendente de "${rejectingItem?.name}"?`}
          confirmText="Sim, Recusar Cadastro"
          onConfirm={() => {
            if (rejectingItem) {
              onReject(rejectingItem.id);
              setRejectingItem(null);
            }
          }}
          onClose={() => setRejectingItem(null)}
        />
      </div>
    </div>
  );
};
