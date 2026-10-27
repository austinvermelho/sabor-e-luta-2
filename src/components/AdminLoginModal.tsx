import React, { useState, useEffect } from 'react';
import { X, Lock, Check, AlertCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 60 * 1000; // 60 seconds lockout

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin,
  onUpdatePin,
}) => {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPinError, setCurrentPinError] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pinUpdatedNotice, setPinUpdatedNotice] = useState(false);

  // Handle countdown timer for lockout
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    const cleanInput = pin.trim();
    const targetPin = (currentPin || 'sabor2026').trim();
    // Allow configured current pin, default 'sabor2026', or standard admin keys
    const validKeys = Array.from(new Set([targetPin, 'sabor2026', 'luta2026', 'saboreluta', 'sabor&luta']));

    if (validKeys.includes(cleanInput)) {
      setError('');
      setFailedAttempts(0);
      setPin('');
      onSuccess();
      onClose();
    } else {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      setPin('');

      if (newCount >= MAX_ATTEMPTS) {
        setLockoutTimer(60);
        setError(`Muitas tentativas incorretas. Bloqueado temporariamente por 60 segundos.`);
      } else {
        const remaining = MAX_ATTEMPTS - newCount;
        setError(`Senha incorreta. Você tem mais ${remaining} tentativa${remaining > 1 ? 's' : ''}.`);
      }
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = currentPinInput.trim();
    const targetPin = (currentPin || 'sabor2026').trim();
    const validKeys = Array.from(new Set([targetPin, 'sabor2026', 'luta2026', 'saboreluta', 'sabor&luta']));

    if (!validKeys.includes(cleanInput)) {
      setCurrentPinError(true);
      return;
    }
    setCurrentPinError(false);

    if (newPin.trim().length >= 4) {
      onUpdatePin(newPin.trim());
      setPinUpdatedNotice(true);
      setTimeout(() => {
        setPinUpdatedNotice(false);
        setIsChangingPin(false);
        setCurrentPinInput('');
        setNewPin('');
      }, 1500);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="curator-login-title" className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white dark:bg-neutral-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/80 text-[#d32f2f] dark:text-rose-400 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <h3 id="curator-login-title" className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Acesso à Curadoria
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela de login"
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#d32f2f]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {!isChangingPin ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Área restrita à equipe do <strong>Sabor &amp; Luta</strong> para moderar, aprovar e cadastrar estabelecimentos.
            </p>

            <div>
              <label htmlFor="curator-pin-input" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="curator-pin"
                  id="curator-pin-input"
                  required
                  autoFocus
                  disabled={lockoutTimer > 0}
                  autoComplete="current-password"
                  placeholder="Digite sua senha de curadoria"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (lockoutTimer === 0) setError('');
                  }}
                  className="w-full pl-3 pr-10 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#d32f2f] focus:ring-2 focus:ring-[#d32f2f]/30 disabled:opacity-50 disabled:bg-neutral-100 dark:disabled:bg-neutral-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-900 flex items-start gap-2 font-medium">
                {lockoutTimer > 0 ? (
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div>
                  <p className="font-semibold">{error}</p>
                  {lockoutTimer > 0 && (
                    <p className="text-[11px] mt-1 text-red-600 dark:text-red-400">
                      Tente novamente em <strong className="tabular-nums font-bold">{lockoutTimer}s</strong>.
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={lockoutTimer > 0}
              className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              {lockoutTimer > 0 ? `Bloqueado (${lockoutTimer}s)` : 'Entrar na Curadoria'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(true);
                  setError('');
                }}
                className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white underline cursor-pointer focus-visible:ring-2 focus-visible:ring-[#d32f2f]"
              >
                Alterar senha de curadoria
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveNewPin} className="space-y-3.5">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Informe a senha atual e a nova senha desejada.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite a senha atual"
                  value={currentPinInput}
                  onChange={(e) => {
                    setCurrentPinInput(e.target.value);
                    setCurrentPinError(false);
                  }}
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#d32f2f]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? "Ocultar senha" : "Exibir senha"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Nova Senha (mínimo 4 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="new-curator-pin"
                  required
                  minLength={4}
                  placeholder="Digite a nova senha"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#d32f2f]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Ocultar senha" : "Exibir senha"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {currentPinError && (
              <div className="p-2 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs rounded-lg flex items-center gap-1.5 font-medium border border-red-200 dark:border-red-900">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Senha atual incorreta.</span>
              </div>
            )}

            {pinUpdatedNotice && (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg flex items-center gap-1.5 font-medium border border-emerald-200 dark:border-emerald-900">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Senha atualizada com sucesso!</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setCurrentPinInput('');
                  setNewPin('');
                  setCurrentPinError(false);
                }}
                className="w-1/2 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="w-1/2 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                Salvar Nova Senha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

