import React, { useState } from 'react';
import { X, Heart, Check, Sparkles, AlertCircle, Users, HandHeart } from 'lucide-react';
import { Volunteer, VolunteerSkill } from '../types';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Volunteer) => void;
}

const SKILL_OPTIONS: { id: VolunteerSkill; label: string; icon: string; description: string }[] = [
  { id: 'curadoria', label: 'Curadoria de Espaços', icon: '📍', description: 'Revisar cadastros, verificar informações de locais e contatar proprietários.' },
  { id: 'design', label: 'Design & Vídeo', icon: '🎨', description: 'Criar artes, vídeos curtos, vinhetas, cartazes virtuais e conteúdo audiovisual.' },
  { id: 'dev', label: 'Desenvolvimento Web', icon: '💻', description: 'Manter a plataforma aberta, otimizar mapas e criar ferramentas livres.' },
  { id: 'agroecologia', label: 'Agroecologia & Campo', icon: '🌾', description: 'Mapear hortas comunitárias, feiras orgânicas e cooperativas de produtores.' },
  { id: 'comunicacao', label: 'Comunicação & Redes', icon: '📣', description: 'Gerenciar redes sociais, escrever artigos e fortalecer a divulgação.' },
  { id: 'mapeamento', label: 'Mapeamento Local', icon: '🗺️', description: 'Catalogar estabelecimentos do seu bairro ou cidade diretamente.' },
  { id: 'eventos', label: 'Eventos & Mutirões', icon: '🎪', description: 'Ajuda na organização de lançamentos, encontros locais e ações comunitárias.' },
  { id: 'traducao', label: 'Acessibilidade & Tradução', icon: '🌐', description: 'Aprimorar acessibilidade digital, libras ou tradução de conteúdos.' },
];

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const VolunteerModal: React.FC<VolunteerModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [selectedSkills, setSelectedSkills] = useState<VolunteerSkill[]>(['curadoria', 'mapeamento']);
  const [availability, setAvailability] = useState('1 a 2 horas/semana');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSkill = (skill: VolunteerSkill) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('Por favor, informe um e-mail válido.');
      return;
    }

    if (!whatsapp.trim()) {
      setFormError('Por favor, informe seu telefone/WhatsApp para contato.');
      return;
    }

    if (!city.trim()) {
      setFormError('Por favor, informe sua cidade.');
      return;
    }

    if (selectedSkills.length === 0) {
      setFormError('Selecione ao menos uma área de interesse.');
      return;
    }

    const payload: Volunteer = {
      id: `vol-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      city: city.trim(),
      state,
      skills: selectedSkills,
      availability,
      message: message.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSave(payload);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#fbf8f3] border-b border-[#e4dcce] px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#b91c1c] text-white flex items-center justify-center shrink-0">
              <HandHeart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-neutral-900 tracking-tight">
                Seja Voluntário(a) no Sabor &amp; Luta
              </h3>
              <p className="text-xs text-[#b91c1c] font-medium">
                Rede colaborativa de gastronomia e economia solidária
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 sm:p-12 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-300">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="font-display text-2xl font-bold text-neutral-900">
              Inscrição Recebida com Sucesso!
            </h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Obrigado por colocar sua energia e habilidades à disposição da luta. Nossa equipe de curadores entrará em contato em breve via WhatsApp ou E-mail.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-900 text-xs font-bold border border-rose-200">
              <Sparkles className="w-4 h-4 text-[#b91c1c]" />
              <span>Sabor &amp; Luta — Construção Coletiva</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-xl text-rose-950 text-xs flex items-start gap-2.5 leading-relaxed">
              <Users className="w-4 h-4 text-[#b91c1c] shrink-0 mt-0.5" />
              <span>
                O <strong>Sabor &amp; Luta</strong> é mantido por pessoas voluntárias e militantes da gastronomia progressista. Seu apoio pode ser pontual ou recorrente, na curadoria, design, tecnologia ou mobilização local.
              </span>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-[#b91c1c] tracking-wider pb-1 border-b border-neutral-100">
                1. Seus Dados de Contato
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome ou como prefere ser chamado(a)..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    E-mail Principal *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo, Recife, Porto Alegre..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Estado (UF) *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] text-sm bg-white"
                  >
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Habilidades & Interesses */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-[#b91c1c] tracking-wider pb-1 border-b border-neutral-100">
                2. Áreas em que Você Pode Contribuir
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SKILL_OPTIONS.map((opt) => {
                  const active = selectedSkills.includes(opt.id);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => toggleSkill(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        active
                          ? 'bg-rose-50 border-[#b91c1c] shadow-2xs'
                          : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200'
                      }`}
                    >
                      <span className="text-lg leading-none mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${active ? 'text-[#b91c1c]' : 'text-neutral-900'}`}>
                            {opt.label}
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-[#b91c1c] stroke-[3]" />}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disponibilidade & Mensagem */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-[#b91c1c] tracking-wider pb-1 border-b border-neutral-100">
                3. Disponibilidade &amp; Apresentação
              </h4>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Disponibilidade Estimada
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#b91c1c] text-sm bg-white"
                >
                  <option value="1 a 2 horas/semana">1 a 2 horas por semana (Pontual)</option>
                  <option value="2 a 5 horas/semana">2 a 5 horas por semana (Moderado)</option>
                  <option value="5+ horas/semana">5+ horas por semana (Ativo)</option>
                  <option value="Apenas eventos/mutirões">Apenas quando houver mutirões ou eventos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Conte um pouco sobre sua trajetória ou motivação (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Sou morador(a) do Recife, trabalho com agricultura urbana e quero ajudar a mapear a zona norte..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#b91c1c] text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* Botões do Rodapé */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#b91c1c] hover:bg-[#991b1b] active:scale-95 rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Quero Ser Voluntário(a)</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
