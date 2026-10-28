# Plano de Otimização: SEO, GEO e PEO — Sabor & Luta

Este plano detalha a estratégia de otimização completa para o **Sabor & Luta — O Guia da Gastronomia Progressista**, abrangendo **SEO** (mecanismos de busca tradicionais), **GEO** (otimização para motores generativos/IA e busca geográfica) e **PEO** (otimização semântica para prompts e agentes de IA).

---

## 1. SEO (Search Engine Optimization) & Social Sharing

### Meta Tags Principais no `index.html`
- **Título da Página (`<title>`)**: `Sabor & Luta — Guia da Gastronomia Progressista, Agroecologia e Economia Solidária`
- **Descrição (`<meta name="description">`)**: `Mapeamento comunitário e colaborativo de bares, restaurantes, cafés e cooperativas comprometidos com autogestão, sustentabilidade agroecológica e direitos humanos.`
- **Palavras-chave (`keywords`)**: `gastronomia progressista, agroecologia, economia solidaria, bares populares, cozinha solidaria, cooperativa, vegano acessivel, autogestao, brasil`
- **Robots & Canonical**: Configuração de `<meta name="robots" content="index, follow">` e tag `<link rel="canonical">` dinâmica.

### OpenGraph & Twitter Cards
- **OpenGraph**: `og:type="website"`, `og:site_name="Sabor & Luta"`, `og:locale="pt_BR"`, `og:title`, `og:description`, `og:image`.
- **Twitter Card**: `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`.
- **Capa Social**: Criação/configuração do ícone/logotipo minimalista oficial do Sabor & Luta como imagem de pré-visualização.

---

## 2. GEO (Generative Engine Optimization & Geographic Optimization)

### Dados Estruturados Schema.org (JSON-LD)
Injeção no `<head>` do `index.html` e dinamicamente nos componentes React:
- **`WebApplication`**: Identificação do aplicativo web e sua categoria (`LifestyleApplication`).
- **`Organization`**: Dados da iniciativa comunitária Sabor & Luta (`name`, `url`, `logo`, `email`, `sameAs`).
- **`ItemList` & `FoodEstablishment` / `LocalBusiness`**: Estrutura JSON-LD cobrindo os locais cadastrados e aprovados, com coordenadas de latitude/longitude e endereço, facilitando a citação direta do mapa por ferramentas como Perplexity, Gemini, ChatGPT e Google Local.

### Metadados Geográficos
- Meta tags de geolocalização nacional: `geo.region="BR"`, `geo.placename="Brasil"`, para indexação regional priorizada.

---

## 3. PEO (Prompt Engine Optimization & AI Crawlers)

### Arquivos `/llms.txt` e `/llms-full.txt`
- Criação dos arquivos estáticos padronizados para IAs em `/public/llms.txt`, fornecendo em texto puro um resumo executivo da missão do projeto, categorias mapeadas e guia de citação para LLMs.

### Endpoints Dinâmicos no Servidor (`server.ts`)
- **`/sitemap.xml`**: Geração dinâmica do mapa do site contendo as URLs e atualizações do catálogo.
- **`/robots.txt`**: Permissão expressa para robôs tradicionais (Googlebot, Bingbot) e robôs de IA (GPTBot, ClaudeBot, PerplexityBot, Bytespider, Google-Extended).

---

## Passos de Execução

1. **Atualização do `index.html`**:
   - Inserir conjunto completo de meta tags SEO/GEO, OpenGraph, Twitter Cards e dados estruturados JSON-LD.
2. **Criação do `/public/llms.txt`**:
   - Adicionar arquivo de documentação semântica para agentes de IA e navegadores generativos.
3. **Servidor Express (`server.ts`)**:
   - Adicionar rotas para `/sitemap.xml` e `/robots.txt`.
4. **Verificação & Teste**:
   - Executar compilação e teste de validação de linter.
