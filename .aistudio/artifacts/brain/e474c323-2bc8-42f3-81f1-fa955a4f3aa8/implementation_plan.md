# Atribuição de Responsável e Gestão do Estabelecimento

Permite que companheiros cadastrados reivindiquem e editem as informações do seu próprio estabelecimento através de uma nova aba "Meus Espaços" no menu principal, mantendo a soberania total dos curadores, fluxo de re-aprovação antes de qualquer publicação e proteção absoluta aos comentários do passaporte.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões Alinhadas com o Usuário**:
> - **Poderes do Responsável**: Administra e edita exclusivamente a página cadastrada de seu próprio estabelecimento. Não interfere em outros estabelecimentos e os curadores continuam com poderes plenos e soberanos.
> - **Imutabilidade dos Comentários do Passaporte**: O responsável **não possui permissão** para editar, alterar ou apagar avaliações, fotos e comentários deixados pelos companheiros no passaporte.
> - **Fluxo de Moderação em Edições**: Toda e qualquer alteração enviada pelo responsável entrará em fila de re-aprovação da curadoria antes de ser publicada no mapa e catálogo público.
> - **Ponto de Acesso**: Nova aba exclusiva no menu principal chamada **"Meus Espaços"** (`activeTab: 'my-spaces'`), visível no topo e no menu mobile para usuários autenticados.

---

## 1. Overview & Core Concept

O objetivo é empoderar os coletivos, cooperativas e donos de bares/restaurantes solidários da rede **Sabor & Luta** para manterem seus dados sempre frescos (horários de funcionamento, redes sociais, fotos, chave Pix solidária e descrição), sem abrir mão da confiabilidade curatorial da rede.

- **Público-Alvo**: Gestores, cooperados e donos de espaços progressistas cadastrados na plataforma.
- **Valor Principal**: Descentraliza a manutenção cadastral e fortalece o engajamento comunitário, mantendo o controle de qualidade pela curadoria e a integridade dos depoimentos do passaporte.

---

## 2. User Experience & Visual Design

### A. Nova Aba "Meus Espaços" no Menu Principal
- Inserida na barra de navegação superior (`Header.tsx`) ao lado de *Visão Geral*, *Mapa*, *Catálogo* e *Missão*.
- **Estado Não Autenticado**: Apresenta tela informativa elegante com estilo editorial jornalístico convidando o responsável a conectar-se com sua conta de companheiro(a) ou cadastrar-se.
- **Estado Autenticado com Espaços Vinculados**:
  - Exibe cards dos estabelecimentos atribuídos ao usuário logado (`ownerUid === currentUser.uid`).
  - Badge de status da versão atual: `Publicado no Mapa` ou `Edição em Análise na Curadoria`.
  - Botão de ação primária: **"Editar Informações do Espaço"**.
  - Atalho para visualizar a página pública do espaço com os carimbos da comunidade.
- **Estado Autenticado sem Espaços**:
  - Card explicativo sobre como vincular seu estabelecimento.
  - Botão de ação: **"Cadastrar Novo Espaço"** ou **"Reivindicar um Espaço Já Cadastrado"**.

### B. Modal de Edição do Responsável (`OwnerEditModal.tsx`)
- Interface focada nos dados institucionais e operacionais do espaço:
  - Nome comercial, categoria, tags progressistas.
  - Endereço completo, cidade, estado e coordenadas.
  - Horários detalhados de funcionamento (segunda a domingo).
  - Fotos de capa e galeria do espaço.
  - Redes sociais, WhatsApp, site e história/manifesto.
  - Chave Pix solidária para apoio direto da comunidade.
- **Aviso visual de proteção aos relatos**:
  - Banner explicativo: *"Os depoimentos e carimbos do passaporte comunitário são geridos de forma autônoma pela comunidade e curadoria e não podem ser editados pelo responsável."*
- Botão de envio: **"Enviar Atualizações para Revisão da Curadoria"**.

### C. Gestão e Fila de Edições na Curadoria
- O **Painel da Curadoria** ganha uma nova seção/aba ou indicador na fila de aprovação:
  - Fila de **"Edições Pendentes"**: exibe o estabelecimento, autor da alteração (`ownerUid`, e-mail), campos modificados (comparativo entre versão atual e proposta) e botões para **Aprovar Edição** ou **Recusar Edição** com justificativa.
  - Seção de **"Vínculo de Responsáveis"**: no card de moderação e na lista de estabelecimentos, o curador pode vincular ou desvincular o e-mail/UID de um responsável a qualquer momento.

---

## 3. Key Product Decisions & Trade-Offs

- **Separação de Versão Publicada vs. Rascunho Pendente**:
  - *Abordagem*: O estabelecimento mantém os dados públicos vigentes enquanto uma edição está em revisão em um campo `pendingEdit` (ou status `pending_update`), garantindo que o público continue navegando pelo espaço no mapa sem interrupções até a aprovação.
  - *Alternativa descartada*: Ocultar o estabelecimento do mapa durante a revisão prejudicaria a visibilidade do negócio.
- **Vínculo por `ownerUid` e `ownerEmail`**:
  - *Abordagem*: Registro duplo no documento do estabelecimento. Permite validação de segurança direta em Firestore e Express, e busca facilitada no frontend.
- **Nenhum Poder sobre `checkins`**:
  - *Abordagem*: O endpoint de moderação de relatos e as regras de segurança permanecem de acesso exclusivo da curadoria (`isAdmin`), sem expor nenhuma rota de exclusão ou alteração de check-ins para o responsável do estabelecimento.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SABOR & LUTA FRONTEND                         │
│                                                                        │
│  ┌───────────────────┐    ┌────────────────────┐   ┌────────────────┐  │
│  │  Header: Nova Aba │    │ Modal de Edição do │   │  Painel da     │  │
│  │   "Meus Espaços"  │───>│    Responsável     │   │   Curadoria    │  │
│  │  (my-spaces tab)  │    │(sem acesso relatos)│   │ (aprova edições│  │
│  └───────────────────┘    └────────────────────┘   │   e vínculos)  │  │
│                                                    └────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ API / Firestore
┌────────────────────────────────────▼───────────────────────────────────┐
│                          EXPRESS & FIRESTORE                           │
│                                                                        │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│  │    Establishments    │  │   CheckIns (Posts)  │  │   Users / RBAC │ │
│  │ - ownerUid           │  │ - status: approved  │  │ - uid, email   │ │
│  │ - ownerEmail         │  │ - (IMUTÁVEL PARA O  │  │ - isCurator    │ │
│  │ - pendingEdit: {...} │  │    RESPONSÁVEL)     │  │ - isOwner      │ │
│  │ - status: approved   │  │                     │  │                │ │
│  └──────────────────────┘  └─────────────────────┘  └────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Modelo de Dados Atualizado (`src/types/index.ts`)
```ts
export interface Establishment {
  // ... campos existentes
  ownerUid?: string;
  ownerEmail?: string;
  claimStatus?: 'none' | 'pending' | 'approved';
  pendingEdit?: Partial<Establishment> & {
    submittedAt: string;
    submittedBy: string;
    notes?: string;
  };
}
```

### Endpoints da API (`server.ts`)
1. `GET /api/my-establishments?userId=...`: Retorna os estabelecimentos vinculados ao UID do usuário logado.
2. `POST /api/establishments/:id/submit-edit`: Submete alterações propostas pelo proprietário para o campo `pendingEdit`.
3. `POST /api/establishments/:id/claim`: Permite que um usuário autenticado solicite o vínculo de proprietário de um espaço.
4. `PUT /api/curator/establishments/:id/approve-edit`: Curador aceita a proposta de edição, promovendo `pendingEdit` para os campos principais.
5. `PUT /api/curator/establishments/:id/assign-owner`: Curador atribui ou revoga a posse de um estabelecimento diretamente.

---

## 5. Plano de Execução em Fases

1. **Campos e Tipagem**: Atualizar `Establishment` em `src/types/index.ts` com `ownerUid`, `ownerEmail`, `claimStatus` e `pendingEdit`.
2. **Backend e Serviços**:
   - Adicionar rotas em `server.ts` para submissão de edição por proprietários e aprovação de edição pela curadoria.
   - Atualizar `src/services/storage.ts` com funções auxiliares de vínculo e envio de edição.
3. **Interface do Usuário (Aba "Meus Espaços")**:
   - Adicionar a aba `'my-spaces'` em `src/components/Header.tsx` e `src/App.tsx`.
   - Criar componente `src/components/MySpacesView.tsx` com listagem de espaços do usuário, status da moderação e solicitação de posse.
   - Criar modal `src/components/OwnerEditModal.tsx` com formulário de edição e bloqueio explícito de edição de comentários.
4. **Painel da Curadoria**:
   - Integrar fila de edições pendentes em `PendingApprovalModal.tsx` ou `CuratorPanelModal.tsx` para revisão e aprovação com diff antes/depois.
5. **Verificação & Testes**:
   - Executar `tsc --noEmit` e `npm run build` para garantir integridade.
   - Testar o fluxo completo: reivindicação -> aprovação do curador -> edição do proprietário -> re-aprovação do curador -> publicação.
