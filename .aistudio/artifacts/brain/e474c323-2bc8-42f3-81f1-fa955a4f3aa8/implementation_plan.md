# Passaporte Sabor & Luta - Sistema de Autenticação e Registros de Experiências

Implementação do **Passaporte Sabor & Luta**, permitindo que frequentadores do circuito gastronômico progressivo criem conta com e-mail e senha, registrem visitas com datas, relatos e fotos, e visualizem seus carimbos/selos virtuais em uma interface inspirada em uma caderneta física de passaporte.

---

> [!IMPORTANT]
> **Decisões Confirmadas pelo Usuário:**
> 1. **Autenticação**: Login direto e simples por E-mail e Senha (Firebase Authentication) sem fluxo obrigatório de redes sociais.
> 2. **Campos do Check-in**: Data da visita (`visitDate`), relato pessoal da experiência (`experienceNote`) e fotos opcionais (`photoUrl`).
> 3. **Apresentação do Passaporte**: Página dedicada no estilo **caderneta física com carimbos/selos virtuais**, indicadores de estatísticas (porcentagem do circuito percorrido, contagem de locais visitados, categorias exploradas) e lista detalhada das experiências salvas.

---

## 1. Visão Geral e Experiência do Usuário

O **Passaporte Sabor & Luta** transforma a navegação pelos estabelecimentos de gastronomia progressiva de Porto Alegre em uma jornada coletiva e afetiva.

### Fluxos Principais
1. **Autenticação Pessoal (E-mail / Senha)**
   - O usuário clica no botão **"Passaporte"** no cabeçalho ou no card/detalhes de qualquer local.
   - Caso não esteja autenticado, visualiza a modal com abas alternáveis entre **Entrar** e **Criar Conta**.
   - Mensagens claras de boas-vindas e tratamento amigável de erros (e-mail incorreto, senha curta, etc.).

2. **Carimbar Visita (Check-in)**
   - Ao acessar o modal de detalhes de um estabelecimento ou o botão "Carimbar Visita", o usuário logado pode registrar sua presença.
   - Formulário com:
     - Data da visita (padrão para o dia atual, ajustável).
     - Relato da experiência (impressões, pratos saboreados, clima do local).
     - Foto opcional (URL de imagem ou upload com preview).
   - Ao salvar, gera instantaneamente um **Selo Virtual (Carimbo Ilustrado)** no passaporte do usuário.

3. **Visualização do Passaporte (Caderneta Física Virtual)**
   - Interface com textura de papel artesanal/gravura, bordas costuradas e estética de caderneta de viagem.
   - **Cabeçalho de Identificação**: Nome do titular, e-mail, data de emissão e nível de exploração (ex: "Iniciante do Circuito", "Explorador da Luta", "Guardião da Gastronomia Progressiva").
   - **Painel de Estatísticas**:
     - Total de estabelecimentos visitados vs. cadastrados.
     - Porcentagem de conclusão do passaporte.
     - Categorias gastronômicas carimbadas.
   - **Grade de Selos / Carimbos**:
     - Cada estabelecimento visitado exibe um selo carimbado personalizado em tinta vermelha/vinho artesanal com a data da visita.
     - Clique em qualquer carimbo para expandir a "Folha de Memória" com a foto e o texto registrado pelo usuário.
     - Locais ainda não visitados aparecem como carimbos marca-d'água pontilhados incentivando a visita.

---

## 2. Design e Identidade Visual

Alinhado à estética editorial e xilográfica do *Sabor & Luta*:

- **Textura de Caderneta**: Fundo em papel craft/palha marfim artesanal (`#FDFBF7` / `#F4EFE6`) com linhas sutis e bordas levemente desgastadas.
- **Carimbos Virtuais**: Selos circulares e octogonais com tipografia condensada e ilustração de estrela/utensílios, impressos em vermelho rubro (`#991B1B` / `#7F1D1D`) simulando tinta de carimbo de borracha real.
- **Tipografia**: Titulares com serifa de peso editorial (*Playfair Display* / *Fraunces*) e textos legíveis com numerais tabulares para dados e datas.

---

## 3. Arquitetura Técnica e Modelo de Dados

### Diagrama do Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Interface React                               │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
│  │   PassaporteModal     │  │    CheckInModal      │  │  AuthModal   │  │
│  │ (Caderneta + Selos)   │  │ (Formulário Visita)  │  │(Email/Senha) │  │
│  └───────────┬───────────┘  └──────────┬───────────┘  └──────┬───────┘  │
└──────────────┼─────────────────────────┼─────────────────────┼──────────┘
               │                         │                     │
               ▼                         ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Camada de Serviços e Estado                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Firebase Auth (onAuthStateChanged / signIn / signUp / signOut)   │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Firestore Service (checkinsCollection: /checkins)                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Firebase Firestore                            │
│  Collection: /checkins/{checkinId}                                      │
│  - userId (string)                                                      │
│  - establishmentId (string)                                             │
│  - visitDate (string YYYY-MM-DD)                                        │
│  - experienceNote (string max 1000 chars)                               │
│  - photoUrl (string opcional)                                           │
│  - createdAt (timestamp)                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Regras de Segurança do Firestore (`firestore.rules`)
Garantia de que os check-ins só podem ser lidos e gravados pelo próprio usuário autenticado:

```javascript
match /checkins/{checkinId} {
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null 
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.visitDate is string
    && request.resource.data.experienceNote is string
    && request.resource.data.experienceNote.size() <= 1000;
  allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

---

## 4. Plano de Implementação Modular

1. **Atualização dos Tipos (`src/types/index.ts`)**
   - Definir `CheckIn` (id, userId, establishmentId, visitDate, experienceNote, photoUrl, createdAt).
   - Definir `UserProfile` (uid, email, displayName).

2. **Serviço de Autenticação e Firestore (`src/services/passport.ts` ou `src/lib/firebase.ts`)**
   - Funções de login por e-mail/senha (`loginWithEmail`, `registerWithEmail`, `logoutUser`).
   - Mapeamento em tempo real dos check-ins do usuário autenticado com `onSnapshot` na coleção `/checkins`.
   - Função `saveCheckIn` para registrar novas visitas.

3. **Componentes de Interface**
   - `src/components/AuthModal.tsx`: Login e cadastro simples com validação.
   - `src/components/CheckInModal.tsx`: Formulário para carimbar o local selecionado.
   - `src/components/PassportModal.tsx`: A caderneta do passaporte com selos, indicador de progresso, filtro de visitados e lista de histórias registradas.

4. **Integração na App Principal (`src/App.tsx` & `EstablishmentModal.tsx`)**
   - Botão **"Meu Passaporte"** com selo/distintivo no cabeçalho principal da aplicação.
   - Botão **"Carimbar no Passaporte"** nas fichas e modais dos estabelecimentos.

5. **Deploy das Regras do Firebase**
   - Atualizar `firestore.rules` e publicar via `DeployRules` RPC.

---

## 5. Validação e Testes
- Compilação via `compile_applet`.
- Checagem do linter via `lint_applet` (`tsc --noEmit`).
- Verificação visual e interativa dos fluxos de cadastro, login, check-in e acúmulo de carimbos.
