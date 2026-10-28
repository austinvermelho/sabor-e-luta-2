import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  establishmentName?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Confirmar Exclusão',
  message,
  establishmentName,
  confirmText = 'Sim, Excluir Estabelecimento',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        className="relative bg-[#fbf8f3] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e4dcce] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-[#e4dcce] mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-red-100 text-[#b91c1c] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.25]" aria-hidden="true" />
            </span>
            <div>
              <h3 id="confirm-delete-title" className="font-display text-lg font-bold text-[#141210]">
                {title}
              </h3>
              <p className="text-xs text-stone-500">
                Ação irreversível de curadoria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar confirmação"
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#b91c1c]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {message || (
              <>
                Tem certeza de que deseja excluir permanentemente o espaço{' '}
                <strong className="text-[#141210] font-bold">
                  "{establishmentName || 'este estabelecimento'}"
                </strong>{' '}
                do guia Sabor &amp; Luta?
              </>
            )}
          </p>
          <div className="p-3 bg-red-50 rounded-xl border border-red-200/80 text-xs text-red-900 font-medium">
            ⚠️ O espaço será removido do mapa, do catálogo público e do servidor.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 bg-[#b91c1c] hover:bg-[#991b1b] active:scale-95 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
