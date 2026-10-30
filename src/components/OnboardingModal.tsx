import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  Stamp, 
  Store, 
  Sparkles, 
  HeartHandshake, 
  MapPin, 
  CheckCircle2,
  BookOpen,
  Users
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
  onOpenPassport?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenPassport,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSteps = 3;

  const steps = [
    {
      id: 'purpose',
      badge: 'PROPÓSITO DO GUIA',
      icon: Compass,
      iconColor: 'text-[#b91c1c]',
      iconBg: 'bg-red-100',
      title: 'Bem-vindo(a) ao Sabor & Luta!',
      subtitle: 'O Mapeamento da Gastronomia Progressista e Solidária',
      description: 
        'Somos um guia comunitário e independente que reúne bares, restaurantes, cafés, pizzarias e cozinhas populares comprometidos com a democracia, direitos humanos, autogestão e economia solidária.',
      highlights: [
        { label: 'Cooperativas & Autogestão', desc: 'Espaços geridos por trabalhadores e movimentos coletivos.' },
        { label: 'Cultura Antifascista', desc: 'Ambientes acolhedores e livres de qualquer discriminação.' },
        { label: 'Soberania Alimentar', desc: 'Incentivo à agroecologia e produtores locais.' },
      ],
    },
    {
      id: 'passport',
      badge: 'PASSAPORTE DIGITAL',
      icon: Stamp,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'Colecione Memórias e Carimbos',
      subtitle: 'Seu Diário de Experiências no Circuito Gastronômico',
      description: 
        'No Sabor & Luta, cada visita conta uma história. Com sua conta de Frequentador, você pode registrar sua presença em cada espaço, deixar depoimentos e acumular carimbos em seu passaporte digital.',
      highlights: [
        { label: 'Check-in e Registros', desc: 'Registre cada local visitado diretamente pelo mapa.' },
        { label: 'Relatos Autênticos', desc: 'Compartilhe suas vivências e dicas com outros companheiros.' },
        { label: 'Selo de Frequência', desc: 'Acompanhe seu histórico e contribua com a rede.' },
      ],
    },
    {
      id: 'spaces',
      badge: 'CADASTRO DE ESPAÇOS',
      icon: Store,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      title: 'Faça a Rede Crescer',
      subtitle: 'Cadastre ou Reivindique a Gestão do Seu Espaço',
      description: 
        'Conhece um estabelecimento progressista ou é proprietário/gestor de um local alinhado? Qualquer companheiro(a) pode sugerir novos espaços e responsáveis podem gerenciar suas próprias páginas no guia.',
      highlights: [
        { label: 'Sugerir Novos Locais', desc: 'Ajude a mapear novos estabelecimentos pela sua cidade.' },
        { label: 'Aba "Meus Espaços"', desc: 'Responsáveis atualizam horários, fotos e chave Pix para apoio.' },
        { label: 'Curadoria Soberana', desc: 'Todas as inclusões passam pela revisão atenta da nossa curadoria.' },
      ],
    },
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[#fbf8f3] border-2 border-red-900/30 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 transition-all flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        {/* Top Navigation Bar inside Modal */}
        <div className="bg-stone-900 text-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c]" />
            <span className="text-xs font-black tracking-widest uppercase text-amber-400 font-serif">
              SABOR &amp; LUTA · GUIA
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-stone-400 bg-stone-800 px-2.5 py-0.5 rounded-full">
              {currentStep + 1} de {totalSteps}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Fechar apresentação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Header Badge & Title */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-950 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3 border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{currentStepData.badge}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-3 sm:p-3.5 rounded-2xl ${currentStepData.iconBg} shrink-0 border border-black/5`}>
                <StepIcon className={`w-7 h-7 sm:w-8 sm:h-8 ${currentStepData.iconColor}`} />
              </div>
              <div>
                <h2 id="onboarding-title" className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                  {currentStepData.title}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#b91c1c] mt-0.5">
                  {currentStepData.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-white/70 p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
            {currentStepData.description}
          </p>

          {/* Highlights List */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-stone-500">
              O que você encontra nesta seção:
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {currentStepData.highlights.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs transition-all hover:border-amber-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#b91c1c] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-900">{item.label}</div>
                    <div className="text-[11px] text-stone-600 leading-snug">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Quick Actions on Last Step */}
          {currentStep === 2 && (
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <div className="text-xs font-bold text-stone-800">
                Ações Rápidas de Início:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {onOpenRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRegister();
                    }}
                    className="p-2.5 bg-red-900 hover:bg-red-950 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                  >
                    <Store className="w-4 h-4 text-amber-300" />
                    <span>Cadastrar um Espaço</span>
                  </button>
                )}
                {onOpenPassport && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPassport();
                    }}
                    className="p-2.5 bg-stone-900 hover:bg-black text-amber-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                  >
                    <Stamp className="w-4 h-4 text-amber-300" />
                    <span>Acessar Meu Passaporte</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`transition-all cursor-pointer rounded-full ${
                  currentStep === idx
                    ? 'w-6 h-2 bg-[#b91c1c]'
                    : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                }`}
                title={`Ir para o passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-200 border border-stone-300 rounded-xl transition-all flex items-center gap-1 cursor-pointer min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer min-h-[44px]"
              >
                Pular
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs font-bold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>{currentStep === totalSteps - 1 ? 'Começar a Explorar' : 'Próximo'}</span>
              {currentStep < totalSteps - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
