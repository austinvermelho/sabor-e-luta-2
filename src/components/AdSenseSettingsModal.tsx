import React, { useState } from 'react';
import { X, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { AdSenseConfig } from '../types';

interface AdSenseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdSenseConfig;
  onSave: (config: AdSenseConfig) => void;
}

export const AdSenseSettingsModal: React.FC<AdSenseSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [clientId, setClientId] = useState(config.clientId || '');
  const [slotIdTop, setSlotIdTop] = useState(config.slotIdTop || '');
  const [slotIdSidebar, setSlotIdSidebar] = useState(config.slotIdSidebar || '');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      enabled,
      clientId: clientId.trim(),
      slotIdTop: slotIdTop.trim(),
      slotIdSidebar: slotIdSidebar.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#d32f2f]" />
            <h3 className="font-display text-xl font-bold text-neutral-900">
              Monetização & Google AdSense
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
            Por padrão, a plataforma exibe <strong>banners rotativos de coletivos e parceiros ideológicos</strong>.
            Se desejar ativar blocos de anúncios do Google AdSense, preencha o seu <code>Client-ID</code> abaixo.
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-[#d32f2f] rounded border-neutral-300 focus:ring-[#d32f2f]"
            />
            <div>
              <span className="text-sm font-semibold text-neutral-900 block">
                Ativar Google AdSense nos blocos de anúncios
              </span>
              <span className="text-xs text-neutral-500">
                Substitui os banners de parceiros pelos blocos oficiais do Google
              </span>
            </div>
          </label>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Google AdSense Client ID (Publisher ID)
            </label>
            <input
              type="text"
              placeholder="Ex: ca-pub-1234567890123456"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded border border-neutral-300 focus:border-[#d32f2f] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Slot ID Topo (Horizontal)
              </label>
              <input
                type="text"
                placeholder="Ex: 9876543210"
                value={slotIdTop}
                onChange={(e) => setSlotIdTop(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded border border-neutral-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Slot ID Barra Lateral (Quadrado)
              </label>
              <input
                type="text"
                placeholder="Ex: 1234567890"
                value={slotIdSidebar}
                onChange={(e) => setSlotIdSidebar(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded border border-neutral-300"
              />
            </div>
          </div>

          {savedNotice && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#d32f2f] hover:bg-[#b71c1c] rounded-lg shadow-sm"
            >
              Salvar Configuração
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
