import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../services/passport';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
        {/* Header Banner with Passport Brand Styling */}
        <div className="bg-red-900 text-amber-50 p-6 relative text-center border-b border-red-950">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-red-200 hover:text-white hover:bg-red-800/50 rounded-full transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center p-3 bg-red-950/60 rounded-full mb-3 border border-red-800/60">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-amber-100">
            Passaporte Sabor & Luta
          </h2>
          <p className="text-xs text-red-200 mt-1 max-w-xs mx-auto">
            Acesse seu diário de visitas e colecione carimbos do circuito gastronômico progressivo de Porto Alegre
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
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
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Seu Nome ou Apelido
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria da Graça"
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
            className="w-full py-3 px-4 bg-red-900 hover:bg-red-950 text-amber-50 font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              'Acessar Passaporte'
            ) : (
              'Emitir Meu Passaporte'
            )}
          </button>

          <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-200">
            {mode === 'login' ? (
              <span>
                Ainda não possui passaporte?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-red-800 font-semibold hover:underline"
                >
                  Cadastre-se grátis
                </button>
              </span>
            ) : (
              <span>
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-red-800 font-semibold hover:underline"
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
