import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, Sparkles, Store, Stamp, CheckCircle2 } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../services/passport';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
  noticeMessage?: string;
  authPurpose?: 'passport' | 'establishment';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  noticeMessage,
  authPurpose = 'passport',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [accountType, setAccountType] = useState<'passport' | 'establishment'>(authPurpose);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAccountType(authPurpose);
      setError(null);
    }
  }, [isOpen, initialMode, authPurpose]);

  if (!isOpen) return null;

  const isEstablishmentMode = accountType === 'establishment';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await loginWithEmail(email, password);
        onSuccess(user);
        onClose();
      } else {
        if (!name.trim()) {
          setError('Por favor, informe seu nome ou como prefere ser chamado.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('A senha deve conter no mínimo 6 caracteres.');
          setLoading(false);
          return;
        }
        const user = await registerWithEmail(email, password, name.trim());
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      let msg = 'Ocorreu um erro ao processar seu acesso. Verifique seus dados.';
      if (err?.code === 'auth/invalid-email') {
        msg = 'Endereço de e-mail em formato inválido.';
      } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'E-mail ou senha incorretos.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'A senha informada é muito fraca. Escolha uma senha com no mínimo 6 caracteres.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-stone-50 border-2 border-red-900/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Purpose Indicator Badge */}
        <div className="bg-stone-900 text-stone-200 text-[11px] font-bold px-4 py-1.5 flex items-center justify-between border-b border-stone-800">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[#fbc02d]">
            {isEstablishmentMode ? (
              <>
                <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Conta de Responsável por Espaço</span>
              </>
            ) : (
              <>
                <Stamp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Conta de Frequentador (Passaporte)</span>
              </>
            )}
          </span>
          <span className="text-[10px] text-stone-400 font-normal">Uma única conta dá acesso a tudo</span>
        </div>

        {/* Header Banner with Specific Purpose Styling */}
        <div className={`p-6 relative text-center border-b ${
          isEstablishmentMode 
            ? 'bg-gradient-to-b from-stone-900 to-red-950 text-amber-50 border-stone-800' 
            : 'bg-red-900 text-amber-50 border-red-950'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center p-3 bg-black/30 rounded-full mb-3 border border-white/20">
            {isEstablishmentMode ? (
              <Store className="w-6 h-6 text-amber-300" />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-300" />
            )}
          </div>

          <h2 className="font-serif text-2xl font-bold tracking-tight text-amber-100">
            {isEstablishmentMode ? 'Gestão do Seu Espaço' : 'Passaporte Sabor & Luta'}
          </h2>
          <p className="text-xs text-red-100/90 mt-1 max-w-xs mx-auto leading-relaxed">
            {isEstablishmentMode
              ? 'Acesse para cadastrar, editar e manter atualizadas as informações do seu estabelecimento no guia.'
              : 'Acesse seu diário de visitas e colecione carimbos do circuito gastronômico progressista.'}
          </p>
        </div>

        {/* Purpose Selector Pills when creating new account */}
        {mode === 'register' && (
          <div className="p-3 bg-amber-50/80 border-b border-amber-200/80 text-xs space-y-1.5">
            <span className="block font-bold text-stone-900 text-[11px] uppercase tracking-wider">
              Qual o objetivo do seu cadastro?
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('passport')}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2 ${
                  accountType === 'passport'
                    ? 'bg-red-900 text-white border-red-900 font-bold shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100 font-medium'
                }`}
              >
                <Stamp className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs leading-tight">Frequentador</div>
                  <div className="text-[10px] opacity-80 font-normal">Visitar e carimbar</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('establishment')}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2 ${
                  accountType === 'establishment'
                    ? 'bg-red-900 text-white border-red-900 font-bold shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100 font-medium'
                }`}
              >
                <Store className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs leading-tight">Espaço / Bar</div>
                  <div className="text-[10px] opacity-80 font-normal">Editar página própria</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher (Login vs Register) */}
        <div className="flex border-b border-stone-200 bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-red-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Entrar com E-mail
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-red-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {noticeMessage && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs flex items-start gap-2.5 font-medium shadow-2xs">
              <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-amber-900">Identificação do Usuário</div>
                <div>{noticeMessage}</div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Seu Nome ou Nome do Responsável
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder={isEstablishmentMode ? "Ex: Carlos Silva (Gerente)" : "Ex: Maria da Graça"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800"
              />
            </div>
            {mode === 'register' && (
              <p className="text-[11px] text-stone-500 mt-1">
                A senha deve conter no mínimo 6 caracteres.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-red-900 hover:bg-red-950 text-amber-50 font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              isEstablishmentMode ? 'Acessar Gestão do Espaço' : 'Acessar Meu Passaporte'
            ) : (
              isEstablishmentMode ? 'Criar Conta de Responsável' : 'Criar Conta no Passaporte'
            )}
          </button>

          <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-200">
            {mode === 'login' ? (
              <span>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-red-800 font-semibold hover:underline cursor-pointer"
                >
                  Cadastre-se grátis
                </button>
              </span>
            ) : (
              <span>
                Já possui uma conta registrada?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-red-800 font-semibold hover:underline cursor-pointer"
                >
                  Faça login aqui
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

