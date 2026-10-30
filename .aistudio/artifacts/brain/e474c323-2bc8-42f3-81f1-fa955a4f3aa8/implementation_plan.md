# Plano de Implementação: Modal de Boas-Vindas (Onboarding) e Correção de Responsividade Mobile

Apresenta o plano para inclusão do modal de boas-vindas (*onboarding*) interativo em formato de cartão com slides explicativos e a correção de sobreposição de texto em dispositivos móveis no topo do modal de login/cadastro (`AuthModal.tsx`).

---

## 1. Visão Geral das Alterações

### A. Modal de Boas-Vindas (Onboarding) — `OnboardingModal.tsx`
- **Formato**: Modal responsivo em cartão com 3 etapas/slides navegáveis.
- **Conteúdo dos 3 Pilares**:
  1. **Propósito do Guia Sabor & Luta**: A rede de bares, restaurantes e cafés alinhados com a gastronomia solidária, soberania alimentar e valores progressistas.
  2. **Passaporte Gastronômico**: Como registrar visitas (carimbos), relatar experiências, enviar fotos e colecionar conquistas no diário pessoal do frequentador.
  3. **Cadastro e Gestão de Espaços**: Como companheiros, coletivos e proprietários podem cadastrar novos locais e gerenciar as informações do seu próprio estabelecimento.
- **Controles de Navegação**:
  - Indicador visual de progresso (pontos/passos `1/3`, `2/3`, `3/3`).
  - Botões `Anterior`, `Próximo`, `Pular Apresentação` e `Começar a Explorar`.
  - Botão de fechar `(X)`.
- **Exibição & Persistência**:
  - Exibido automaticamente na **primeira visita** (verificado via `localStorage.getItem('sabor_luta_onboarding_completed')`).
  - Ao concluir ou fechar, armazena `'true'` no `localStorage`.
  - Atalho permanente **"Como Funciona o Guia"** no menu do topo e no drawer mobile (`Header.tsx`) para permitir reapresentação a qualquer momento.

### B. Correção de Responsividade Mobile — Header do `AuthModal.tsx`
- **Problema identificado** (captura de tela): No topo do modal de login/registro, o badge dark de indicação de conta (`CONTA DE FREQUENTADOR (PASSAPORTE)`) compartilha a mesma linha flexível com o texto explicativo (`Uma única conta dá acesso a tudo`), causando quebra de linha estranha e sobreposição em telas estreitas ($\le 360\text{px}$).
- **Solução**: Ajustar as classes Tailwind do contêiner para empilhamento responsivo vertical em telas pequenas (`flex-col sm:flex-row`), adequação dos tamanhos de fonte (`text-[10px] sm:text-[11px]`) e espaçamentos internos responsivos (`px-3 sm:px-4 py-2`).

---

## 2. Arquitetura e Componentes Afetados

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             SABOR & LUTA FRONTEND                          │
│                                                                            │
│  ┌───────────────────────┐   ┌──────────────────────┐  ┌────────────────┐ │
│  │   Header.tsx          │   │ OnboardingModal.tsx  │  │ AuthModal.tsx  │ │
│  │ - Botão "Como Funciona│──>│ - Slide 1: Propósito │  │ - Flex respons.│ │
│  │   o Guia" (Desktop/Mob)│   │ - Slide 2: Passaporte│  │   (flex-col/sm)│ │
│  └───────────────────────┘   │ - Slide 3: Cadastros │  └────────────────┘ │
│                              └──────────┬───────────┘                      │
└─────────────────────────────────────────┼──────────────────────────────────┘
                                          │
                               ┌──────────▼───────────┐
                               │       App.tsx        │
                               │ - state: isOnboardOpen│
                               │ - useEffect 1st visit│
                               └──────────────────────┘
```

---

## 3. Detalhamento dos Componentes

1. **`src/components/OnboardingModal.tsx`** (Novo Componente):
   - Recebe as props: `isOpen: boolean`, `onClose: () => void`, `onOpenRegister: () => void`, `onOpenPassport: () => void`.
   - Gerencia estado interno `currentStep` (0, 1, 2).
   - Utiliza cores e identidade do *Sabor & Luta* (vermelho carmim `#b91c1c`, detalhes em âmbar/dourado `#fbc02d`, tipografia serifada nos títulos).

2. **`src/components/Header.tsx`**:
   - Adicionar prop `onOpenOnboarding: () => void`.
   - Inserir botão com ícone de ajuda/informação ("Como Funciona") no menu principal e no gaveteiro mobile (`mobile-drawer-menu`).

3. **`src/components/AuthModal.tsx`**:
   - Atualizar a barra superior do badge de indicação de conta com suporte a `flex-col sm:flex-row items-start sm:items-center justify-between gap-1`.

4. **`src/App.tsx`**:
   - Adicionar estado `isOnboardingOpen`.
   - `useEffect` para carregar primeira visita:
     ```ts
     useEffect(() => {
       const completed = localStorage.getItem('sabor_luta_onboarding_completed');
       if (!completed) {
         setIsOnboardingOpen(true);
       }
     }, []);
     ```
   - Renderizar `<OnboardingModal isOpen={isOnboardingOpen} onClose={() => { localStorage.setItem('sabor_luta_onboarding_completed', 'true'); setIsOnboardingOpen(false); }} ... />`.

---

## 4. Plano de Verificação

1. **Compilação e Tipagem**:
   - Executar `lint_applet` (`npm run lint` / `tsc --noEmit`).
   - Executar `compile_applet`.
2. **Teste de Telas & Responsividade**:
   - Verificar visualização do Onboarding em viewport desktop (1440px) e mobile (360px).
   - Testar navegação entre slides (Avançar, Voltar, Pular, Finalizar).
   - Testar abertura do `AuthModal` em tela móvel garantindo layout limpo e sem sobreposição do badge superior.
3. **Persistência**:
   - Verificar que a flag `sabor_luta_onboarding_completed` é gravada corretamente no `localStorage`.
