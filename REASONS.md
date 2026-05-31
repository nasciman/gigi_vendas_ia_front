# REASONS Canvas: Frontend - App Mobile Gigi Vendas

## [R] Requirements (Requisitos e Visão de Produto)
Desenvolver uma aplicação mobile em React Native utilizando o Expo. 
**Visão de Longo Prazo:** O app será um sistema de gestão completo (Login, Vendas, Funcionários).
**Foco Atual (Fase 1):** Gestão de Catálogo e Custos (Compras).

**Arquitetura Intent-First (Intenção Primeiro):**
Separação clara entre **Dados Mestres** (Produto: nome, foto, preço) e **Dados Transacionais** (Compras: custo, fornecedor, data). O Dashboard apresenta dois botões que definem a intenção do utilizador **antes** de abrir o scanner.

**Dashboard:**
- Botão **"Consultar Produto"** → Scanner (`mode=consult`).
- Botão **"Registar Entrada"** → Scanner (`mode=purchase`).

**Fluxo A — Consultar Produto (`mode=consult`):**
1. Dashboard → **"Consultar Produto"** → Scanner. Ao ler, faz `GET /api/v1/products/{barcode}`.
   - **Se 200 (Existe):** Abre `product-details.tsx` (tela de **leitura**).
   - **Se 404 (Não existe):** Exibe **Alerta**: *"Produto não encontrado. Deseja cadastrá-lo?"*. Se sim → `product-form.tsx` vazio. Se não → volta ao scanner.

**`product-details.tsx` (Tela de Consulta — só leitura):**
- Mostra: Foto (via `resolvePhotoUrl`), Nome, Preço de Venda, Último Custo, Último Fornecedor e Margem atual.
- Botões de ação:
  - **Editar** → `product-form.tsx` (edição de Dados Mestres).
  - **Registar Entrada** → `purchase-form.tsx` (entrada transacional de compra).

**Fluxo B — Registar Entrada (`mode=purchase`):**
1. Dashboard → **"Registar Entrada"** → Scanner. Ao ler, faz `GET /api/v1/products/{barcode}`.
   - **Se 200 (Existe):** Abre `purchase-form.tsx`.
   - **Se 404 (Não existe):** Exibe **Alerta**: *"Produto não encontrado. Deseja cadastrá-lo?"*. Se sim → `product-form.tsx` vazio. Se não → volta ao scanner.

**`product-form.tsx` (Dados Mestres — Cadastro/Edição):**
- Edita apenas **Nome, Foto e Preço de Venda**.
- O **Custo antigo** (`lastPurchasePrice`) é exibido apenas como **leitura**.
- O utilizador pode alterar a **Margem** (se houver custo) para recalcular o Preço de Venda. **Se não houver custo, a Margem fica bloqueada** (só edição direta do Preço de Venda).
- A foto é resolvida via `resolvePhotoUrl`.

**`purchase-form.tsx` (Dados Transacionais — Entrada de Compra):**
- Foco transacional: Foto e Nome bloqueados (leitura, via `resolvePhotoUrl`).
- Seleciona **Fornecedor** via `SearchableDropdown` (usa `<ScrollView>`, nunca `<FlatList>`).
- Insere o **novo Custo** e inclui o `PricingCalculator mode="restock"` para reajuste imediato do Preço de Venda.
- Dispara `POST /api/v1/purchases`.

## [E] Entities (Modelos de Estado Frontend)
* **Product:** `barcode`, `name`, `photoUri`, `salePrice` (number).
* **Supplier:** `id`, `name`.
* **PurchasePayload:** `produtoId`, `fornecedorId`, `precoCompra`, `dataCompra`.

## [A] Approach (Abordagem)
* **Framework & Navegação:** Expo com **Expo Router**. A estrutura de ficheiros gera as rotas automaticamente.
* **Comunicação:** Axios em `/services/api.ts`.
* **Interface (UI/UX):** Design limpo, rápido e utilitário. Uso de botões largos, inputs claros com bordas, feedbacks visuais (ActivityIndicator) e sem animações complexas.
* **UX de Fornecedores:** O filtro de fornecedores é feito num *Searchable Dropdown*. Se não existir, o botão "+ Cadastrar" abre um Modal/Bottom Sheet, salva na API, fecha e auto-seleciona.

## [S] Structure (Estrutura Modular)
    /src
    ├── app/               
    │   ├── _layout.tsx    
    │   ├── index.tsx      
    │   ├── scanner.tsx    
    │   ├── product-details.tsx  (tela de consulta — só leitura)
    │   └── forms/         (product-form.tsx, purchase-form.tsx)
    ├── components/        (SearchableDropdown, PricingCalculator, ImagePickerButton)
    ├── services/          (api.ts)
    ├── hooks/             (useSuppliers)
    └── utils/             (margin.ts, currency.ts)

## [O] Operations (Operações e Tarefas)
1. **Implementação de Formulários:** Os ficheiros em `app/forms/` devem ser implementados utilizando componentes visuais limpos. Devem importar a lógica matemática de `utils/margin.ts` e `utils/currency.ts`.
2. **Componentização:** A lógica visual dos 3 campos de preço deve ser isolada num componente `<PricingCalculator />` na pasta `components/` para ser reutilizada em ambos os formulários.
3. **Orquestração de Registo:** No `product-form.tsx`, construa o `FormData` anexando `codigoBarras`, `nome`, `salePrice` e a `foto`. Dispare o `POST /api/v1/products`. Com sucesso, dispare o `POST /api/v1/purchases`.

## [N] Norms (Normas)
* **Idioma:** 100% do código estrutural em **Inglês**. Textos da interface em **Português**.
* **Teclados:** Entradas financeiras usam `keyboardType="numeric"`. Os valores devem ser formatados como moeda local (ex: R$ 10,50) visualmente, mas armazenados/calculados como `number`.

## [S] Safeguards (Restrições Estritas)
* **NÃO** misture lógica de câmara ou cálculos de margem dentro do arquivo visual do formulário. Extraia para `components/`.
* **NÃO** envie JSON no `POST /products`. Esta rota requer `multipart/form-data`.
* **NÃO** utilize `<FlatList>` dentro de `<ScrollView>`. Causa crash no Android: *VirtualizedLists should never be nested inside plain ScrollViews*. Use `<ScrollView>` com `.map()` para listas internas.
