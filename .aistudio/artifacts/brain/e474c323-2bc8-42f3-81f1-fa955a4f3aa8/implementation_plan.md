# Identidade Visual & Esquema de Cores: Luta de Classes e Gastronomia Popular

Plano arquitetural e de design para reformular a paleta de cores e atmosfera visual do **Sabor & Luta**, adotando uma estética de alto contraste inspirada em xilogravura, gravura popular e panfletos históricos operários, alinhada à remoção do modo escuro e aos refinamentos dos cards e fichas de cadastro.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões Confirmadas e Alinhamento:**
> - **Estilo Visual Confirmado (Fase 1)**: Gráfico de alto contraste inspirado em xilogravura e panfleto popular histórico, abandonando estéticas corporativas genéricas.
> - **Remoção do Modo Escuro**: A interface operará com base em papel craft/imprensa de manifesto (fundo claro editorial e tinta preta pura), eliminando a complexidade e inconsistência do modo escuro.
> - **Nota de Confirmação de Horários**: Retirada da ficha de cadastro (`RegistrationModal`) e exibida de forma destacada e informativa nos cards e detalhes acessados pelo público.

---

### 1. Overview & Core Concept

- **O que faz**: Atualiza a linguagem cromática, os tokens de estilo e os contrastes tipográficos da plataforma Sabor & Luta para traduzir visualmente a intersecção entre gastronomia comunitária (pão, terra, agricultura familiar, cozinha solidária) e luta popular (imprensa operária, xilogravura, cartazes de assembleia).
- **Público-Alvo**: Consumidores conscientes, militantes, apreciadores da culinária autogestionada, cooperados e frequentadores de espaços solidários.
- **Valor Principal**: Uma identidade visual inconfundível, com peso cultural e dignidade gráfica, que diferencia imediatamente o projeto de aplicativos comerciais convencionais de gastronomia.

---

### 2. User Experience & Visual Design

#### A. Paleta de Cores "Xilogravura & Pão Operário"

| Papel no Design | Token / Cor | Hex | Significado Simbólico & Uso |
| :--- | :--- | :--- | :--- |
| **Papel de Panfleto (Fundo)** | `bg-canvas` | `#fbf8f3` | Papel imprensa natural, fibra de trigo e farinha; acolhedor e anti-fadiga visual. |
| **Tinta de Prensa (Texto / Bordas)** | `text-ink` | `#141210` | Preto carvão de linóleo e xilogravura; legibilidade máxima e corte gráfico preciso. |
| **Vermelho Bandeira (Ação / Destaque)** | `accent-red` | `#b91c1c` | Estandarte de luta, sangue do trabalho e calor do fogão a lenha. |
| **Vinho de Guarda (Acento Nobre)** | `accent-wine` | `#7f1d1d` | Fermentação, ancestralidade e resistência duradoura. |
| **Ocre Milho & Trigo (Apoio / Alerta)** | `accent-grain` | `#c27803` | Colheita camponesa, pão assado, cevada e solidariedade. |
| **Verde Reforma Agrária (Terra Limpa)** | `accent-earth` | `#15803d` | Agroecologia, horta comunitária e alimento sem veneno. |
| **Bordas Estruturais** | `border-print` | `#e4dcce` | Linhas de matriz gráfica e linotipia; sem sombras difusas artificiais. |

#### B. Tipografia e Ritmo
- **Títulos & Cabeçalhos**: Tipografia de display robusta com inspiração tipográfica e editorial (`font-display font-black tracking-tight`).
- **Corpo & Descrições**: Tipografia limpa e equilibrada (`Plus Jakarta Sans`), preservando excelente cadência de leitura.
- **Elementos Gráficos**: Linhas de corte nítidas, ausência de cantos arredondados excessivos tipo "candy pills", divisores tipográficos claros (`·`, `/`).

#### C. Cards e Fichas
- **Cards Públicos (`EstablishmentCard`)**: Cartão gráfico com borda nítida de prensa, cabeçalho limpo sem pílulas decorativas, e nota de observação destacada recomendando a confirmação de horário com o espaço.
- **Modal de Detalhes (`EstablishmentModal`)**: Bloco de horário claro acompanhado da observação em destaque e remoção de poluição visual.
- **Ficha de Cadastro (`RegistrationModal`)**: Formulário focado apenas nas informações essenciais do espaço, sem advertências deslocadas ou sugestões genéricas.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Remoção do Modo Escuro**
  - *Abordagem*: Consolidar uma única paleta de "papel impresso e matriz gráfica", removendo o seletor de modo escuro do cabeçalho e do menu mobile.
  - *Justificativa*: A estética de xilogravura e panfleto popular depende do contraste entre a tinta preta/vermelha e o papel cru. Simplifica o código e elimina estilos cinzentos genéricos.
- **Decisão 2: Observação de Confirmação no Card Público**
  - *Abordagem*: Colocar o texto `* Recomendamos sempre confirmar horários diretamente com o estabelecimento antes de visitar, pois podem sofrer alterações sem aviso prévio.` nos cards do catálogo e no modal de detalhes.
  - *Justificativa*: O público que consulta o mapa é quem precisa dessa recomendação no momento do planejamento da visita.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     SABOR & LUTA INTERFACE                      │
│                                                                 │
│   [Header: Logotipo Xilogravura + Ações + Botão Cadastrar]      │
│   (Modo Escuro descontinuado - Estética Papel & Prensa)         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
        ┌────────────────────────┴────────────────────────┐
        ▼                                                 ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│   CATÁLOGO / CARDS PÚBLICOS     │   │      MAPA INTERATIVO            │
│   - Borda nítida de gravura     │   │   - Marcadores com contraste    │
│   - Alerta de confirmação       │   │   - Leaflet estilizado          │
│   - Acesso a detalhes           │   │                                 │
└────────────────┬────────────────┘   └─────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      ESTABLISHMENT MODAL        │
│   - Manifesto & História        │
│   - Horários estruturados       │
│   - Nota de aviso ao público    │
└─────────────────────────────────┘
```

#### Mapeamento de Arquivos a Atualizar
1. `src/App.tsx`:
   - Remoção de estados e persistência de `darkMode` (`saborluta_dark_mode`).
   - Aplicação da nova paleta base `#fbf8f3` com acentos vermelho-bandeira e tinta preta.
2. `src/components/Header.tsx`:
   - Remoção dos botões e seletores de alternância de modo escuro (desktop e gaveta mobile).
   - Atualização do estilo do cabeçalho para harmonia com a nova paleta.
3. `src/components/EstablishmentCard.tsx`:
   - Inclusão da nota de observação sobre confirmação direta de horários antes da visita.
   - Aplicação das bordas e contrastes gráficos inspirados em xilogravura.
4. `src/components/EstablishmentModal.tsx`:
   - Refinamento do bloco de horários e exibição limpa da observação.
