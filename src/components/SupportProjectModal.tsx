import React, { useState } from 'react';
import { X, Copy, Check, Heart, ShieldCheck, QrCode } from 'lucide-react';
import { ProjectSupportConfig } from '../types';

interface SupportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectSupportConfig;
}

export const SupportProjectModal: React.FC<SupportProjectModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(config.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-100 text-[#d32f2f] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-[#d32f2f]" />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-neutral-900 leading-tight">
                Apoie o Projeto Sabor & Luta
              </h3>
              <span className="text-[11px] text-neutral-400">
                Sustente nossa infraestrutura colaborativa e independente
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transparency Alert */}
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 leading-relaxed space-y-2 mb-5">
          <div className="flex items-center gap-1.5 text-neutral-900 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#d32f2f]" />
            <span>Transparência & Destinação</span>
          </div>
          <p>
            O <strong>Sabor & Luta</strong> é um projeto independente e sem fins lucrativos.
            As doações via Pix sustentam <strong>exclusivamente a manutenção dos servidores, mapas abertos e o desenvolvimento contínuo da plataforma</strong>.
            Nenhum valor é repassado diretamente aos estabelecimentos cadastrados no guia.
          </p>
        </div>

        {/* Pix Box */}
        <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200 rounded-xl p-4.5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-amber-900 tracking-wider">
              Chave Pix do Projeto ({config.pixType.toUpperCase()})
            </span>
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-[11px] font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-neutral-200"
            >
              <QrCode className="w-3 h-3" />
              <span>{showQr ? 'Ocultar QR' : 'Exibir QR Code'}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg p-3 border border-amber-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <code className="text-sm sm:text-base font-mono font-bold text-neutral-900 select-all truncate">
              {config.pixKey}
            </code>

            <button
              onClick={handleCopy}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#d32f2f] hover:bg-[#b71c1c] text-white active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Chave Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Chave</span>
                </>
              )}
            </button>
          </div>

          {copied && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Chave copiada! Cole no aplicativo do seu banco para transferir qualquer valor.</span>
            </div>
          )}

          {showQr && (
            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col items-center justify-center gap-2 text-center animate-in fade-in duration-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  config.pixKey
                )}`}
                alt="QR Code Pix do Projeto Sabor & Luta"
                className="w-36 h-36 border border-neutral-200 rounded p-1.5 bg-white"
              />
              <span className="text-[11px] text-neutral-500">
                Aponte a câmera do aplicativo do seu banco para a chave
              </span>
            </div>
          )}

          <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-1 border-t border-amber-200/40">
            <span>Beneficiário: {config.recipientName}</span>
            <span>Qualquer valor fortalece a rede</span>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="text-xs text-neutral-500 hover:text-neutral-800 underline font-medium"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
