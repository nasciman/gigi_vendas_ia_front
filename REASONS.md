# REASONS Canvas: Frontend - App Mobile Gigi Vendas

## [R] Requirements (Requisitos e Visão de Produto)
Desenvolver uma aplicação mobile em React Native utilizando o Expo. 
**Visão de Longo Prazo:** O app será um sistema de gestão completo (Login, Vendas, Funcionários).
**Foco Atual (Fase 1):** Gestão de Catálogo e Custos (Compras).

**Fluxo de UX Principal:**
1. A app abre num **Dashboard Inicial** com botões de ação claros e grandes (ex: "Consultar/Registar Produto").
2. Ao clicar em "Consultar", abre a Câmara. Lê o código e faz `GET /api/v1/products/{barcode}`.
3. **Se 404 (Produto Novo) -> `product-form.tsx`:** * Campos Visuais: Foto (Botão de captura), Nome do Produto, Fornecedor (Searchable Dropdown).
    * *UX de Precificação:* O ecrã tem 3 campos interligados visualmente (Custo, Margem % e Preço de Venda). A Margem vem por padrão a 30%. O utilizador digita o Custo e o Preço de Venda é calculado. Tudo é livremente editável.
4. **Se 200 (Produto Existente) -> `purchase-form.tsx`:** * Campos Visuais: Foto e Nome bloqueados (apenas leitura). Fornecedor (Searchable Dropdown).
    * *UX de Precificação:* Carrega o Preço de Venda atual. Ao digitar o novo Custo, a app **NÃO** aplica 30%, mas calcula e exibe qual é a Margem % real que sobrou. O utilizador pode alterar o Preço de Venda se desejar.

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
