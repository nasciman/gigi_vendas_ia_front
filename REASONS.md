# REASONS Canvas: Frontend - App Mobile Gigi Vendas

## [R] Requirements (Requisitos e Visão de Produto)
Desenvolver uma aplicação mobile em React Native utilizando o Expo. 
**Visão de Longo Prazo:** O app será um sistema de gestão completo (Login, Vendas, Funcionários).
**Foco Atual (Fase 1):** Gestão de Catálogo e Custos (Compras).

**Fluxo de UX Principal:**
1. A app abre num **Dashboard Inicial** com botões de ação claros e grandes (ex: "Consultar/Registar Produto").
2. Ao clicar em "Consultar", abre a Câmara. Lê o código e faz `GET /api/v1/products/{barcode}`.
3. **Se 404 (Produto Novo):** Navega para "Registo Completo". 
    * Pede: Foto, Nome, Fornecedor, Preço de Compra (Custo).
    * *UX de Precificação (Novo):* O ecrã tem 3 campos interligados (Custo, Margem % e Preço de Venda). A Margem vem por padrão a 30%. O utilizador digita o Custo e o Preço de Venda é calculado. Tudo é livremente editável.
4. **Se 200 (Produto Existente):** Navega para "Nova Compra". 
    * Mostra Foto e Nome bloqueados. Pede o Novo Custo e o Fornecedor.
    * *UX de Precificação (Reposição):* Carrega o Preço de Venda atual do banco de dados. Ao digitar o novo Custo, a app **NÃO** aplica 30%, mas calcula e exibe qual é a Margem % real que sobrou. O utilizador pode alterar o Preço de Venda se desejar repassar o custo ao cliente.

## [E] Entities (Modelos de Estado Frontend)
* **Product:** `barcode`, `name`, `photoUri`, `salePrice` (number).
* **Supplier:** `id`, `name`.
* **PurchasePayload:** `produtoId`, `fornecedorId`, `precoCompra`, `dataCompra`.

## [A] Approach (Abordagem)
* **Framework & Navegação:** Expo com **Expo Router**. A estrutura de ficheiros gera as rotas automaticamente.
* **Comunicação:** Axios em `/services/api.ts`.
* **Interface (UI/UX):** Design limpo, rápido e utilitário. Uso de botões largos (fáceis de tocar), feedbacks visuais rápidos (ActivityIndicator) e sem animações complexas que travem o uso diário.
* **UX de Fornecedores (Bottom Sheet/Modal):** O filtro de fornecedores é feito num *Searchable Dropdown*. Se não existir, o botão "+ Cadastrar" abre um pequeno Modal/Bottom Sheet, salva na API, fecha e auto-seleciona.

## [S] Structure (Estrutura Modular e Escalável)
    /src
    ├── app/               
    │   ├── _layout.tsx    (Configuração do Stack e tema global)
    │   ├── index.tsx      (Dashboard Inicial)
    │   ├── scanner.tsx    (A câmara)
    │   └── forms/         (product-form.tsx, purchase-form.tsx)
    ├── components/        (SearchableDropdown, PricingCalculator, BottomSheet)
    ├── services/          (api.ts)
    ├── hooks/             
    └── utils/             (math e currency formatters)

## [O] Operations (Operações e Tarefas)
Ao construir os componentes, siga:
1. **Estrutura Base:** Crie o `index.tsx` como um Dashboard amigável.
2. **Componente de Precificação:** Isole a lógica da "Tríade" (Custo, Margem, Venda) num Hook ou Componente próprio (`PricingCalculator`), garantindo o comportamento diferente entre Produtos Novos e Existentes.
3. **Orquestração de Registo:** Construa o `FormData` anexando `codigoBarras`, `nome`, `salePrice` e a `foto`. Dispare o `POST /api/v1/products`. Com sucesso, dispare o `POST /api/v1/purchases`.

## [N] Norms (Normas)
* **Idioma:** 100% do código estrutural em **Inglês**. Textos da interface em **Português**.
* **Teclados Otimizados:** Entradas financeiras devem usar `keyboardType="numeric"`. Os valores devem ser formatados como moeda local (ex: R$ 10,50) durante a digitação.

## [S] Safeguards (Restrições Estritas)
* **NÃO** misture lógica complexa de câmara ou cálculos de margem dentro do arquivo visual do formulário. Extraia para `components/` ou `hooks/`.
* **NÃO** envie JSON no `POST /products`. Esta rota requer `multipart/form-data`.
